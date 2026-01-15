"use server";

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from "next/headers";
import { ReviewStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

async function getSession() {
    return await auth.api.getSession({
        headers: await headers()
    });
}

export type ReviewInput = {
    feedback: string;
    status: ReviewStatus;
};

export async function createReview(teamId: string, data: ReviewInput) {
    const session = await getSession();

    if (!session || session.user.role !== 'MENTOR') {
        return { error: "Only mentors can create reviews." };
    }

    try {
        const review = await prisma.mentorReview.create({
            data: {
                teamId,
                mentorId: session.user.id,
                feedback: data.feedback,
                status: data.status
            },
            include: {
                mentor: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        revalidatePath(`/dashboard/team/${teamId}`);
        return { success: true, review };
    } catch (e) {
        console.error("Create review error:", e);
        return { error: "Failed to create review." };
    }
}

export async function updateReview(reviewId: string, data: ReviewInput) {
    const session = await getSession();

    if (!session || session.user.role !== 'MENTOR') {
        return { error: "Only mentors can update reviews." };
    }

    try {
        const review = await prisma.mentorReview.findUnique({
            where: { id: reviewId }
        });

        if (!review) {
            return { error: "Review not found." };
        }

        if (review.mentorId !== session.user.id) {
            return { error: "You can only update your own reviews." };
        }

        await prisma.mentorReview.update({
            where: { id: reviewId },
            data: {
                feedback: data.feedback,
                status: data.status
            }
        });

        revalidatePath(`/dashboard/team/${review.teamId}`);
        return { success: true };
    } catch (e) {
        console.error("Update review error:", e);
        return { error: "Failed to update review." };
    }
}

export async function getTeamReviews(teamId: string) {
    const session = await getSession();

    if (!session) {
        return { error: "Unauthorized" };
    }

    try {
        const reviews = await prisma.mentorReview.findMany({
            where: { teamId },
            include: {
                mentor: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, reviews };
    } catch (e) {
        console.error("Get reviews error:", e);
        return { error: "Failed to load reviews." };
    }
}

export async function getMyMentorReviews() {
    const session = await getSession();

    if (!session || session.user.role !== 'MENTOR') {
        return { error: "Only mentors can view their reviews." };
    }

    try {
        const reviews = await prisma.mentorReview.findMany({
            where: { mentorId: session.user.id },
            include: {
                team: {
                    select: {
                        id: true,
                        name: true,
                        status: true
                    }
                },
                mentor: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, reviews };
    } catch (e) {
        console.error("Get my reviews error:", e);
        return { error: "Failed to load reviews." };
    }
}
