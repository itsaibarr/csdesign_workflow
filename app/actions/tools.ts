"use server";

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from "next/headers";
import { ToolCategory, ToolUsageStatus, Tool } from '@prisma/client';
import { revalidatePath } from 'next/cache';

async function getSession() {
    return await auth.api.getSession({
        headers: await headers()
    });
}

export async function getTools(filters?: {
    search?: string;
    category?: ToolCategory;
    usageStatus?: ToolUsageStatus[];
}) {
    try {
        const { search, category, usageStatus } = filters || {};

        const where: any = {
            usageStatus: {
                not: ToolUsageStatus.PENDING_REVIEW
            }
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { shortDescription: { contains: search, mode: 'insensitive' } },
                { fullDescription: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (category) {
            where.category = category;
        }

        if (usageStatus && usageStatus.length > 0) {
            where.usageStatus = { in: usageStatus };
        }

        const tools = await prisma.tool.findMany({
            where,
            include: {
                _count: {
                    select: { artifactTools: true }
                }
            },
            orderBy: {
                artifactTools: {
                    _count: 'desc'
                }
            }
        });

        return { success: true, tools };
    } catch (e) {
        console.error("Get tools error:", e);
        return { error: "Failed to load tools." };
    }
}

export async function getToolById(id: string) {
    try {
        const tool = await prisma.tool.findUnique({
            where: { id },
            include: {
                artifactTools: {
                    include: {
                        artifact: {
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                        image: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 10
                }
            }
        });

        if (!tool) {
            return { error: "Tool not found." };
        }

        return { success: true, tool };
    } catch (e) {
        console.error("Get tool by id error:", e);
        return { error: "Failed to load tool details." };
    }
}

export async function submitTool(data: {
    name: string;
    url: string;
    category: ToolCategory;
    description: string;
    useCase: string;
    taskSolved: string;
}) {
    const session = await getSession();
    if (!session || session.user.role !== 'STUDENT') {
        return { error: "Only students can submit new tools." };
    }

    try {
        const submission = await prisma.toolSubmission.create({
            data: {
                name: data.name,
                url: data.url,
                category: data.category,
                description: data.description,
                useCase: data.useCase,
                taskSolved: data.taskSolved,
                submittedById: session.user.id,
                status: ToolUsageStatus.PENDING_REVIEW
            }
        });

        revalidatePath('/dashboard/tools');
        return { success: true, submissionId: submission.id };
    } catch (e) {
        console.error("Submit tool error:", e);
        return { error: "Failed to submit tool for review." };
    }
}

export async function getPendingSubmissions() {
    const session = await getSession();
    if (!session || session.user.role === 'STUDENT') {
        return { error: "Unauthorized." };
    }

    try {
        const submissions = await prisma.toolSubmission.findMany({
            where: {
                status: ToolUsageStatus.PENDING_REVIEW
            },
            include: {
                submittedBy: {
                    select: {
                        name: true,
                        image: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return { success: true, submissions };
    } catch (e) {
        console.error("Get pending submissions error:", e);
        return { error: "Failed to load pending submissions." };
    }
}

export async function reviewToolSubmission(
    submissionId: string,
    decision: 'APPROVE' | 'REJECT',
    notes?: string
) {
    const session = await getSession();
    if (!session || session.user.role === 'STUDENT') {
        return { error: "Unauthorized." };
    }

    try {
        const submission = await prisma.toolSubmission.findUnique({
            where: { id: submissionId }
        });

        if (!submission) {
            return { error: "Submission not found." };
        }

        if (decision === 'REJECT') {
            await prisma.toolSubmission.update({
                where: { id: submissionId },
                data: {
                    status: ToolUsageStatus.PENDING_REVIEW, // Or add a REJECTED status if needed
                    reviewedById: session.user.id,
                    reviewNotes: notes
                }
            });
        } else {
            // APPROVE: Create the tool and update submission
            const tool = await prisma.tool.create({
                data: {
                    name: submission.name,
                    url: submission.url,
                    category: submission.category,
                    shortDescription: submission.description.substring(0, 100) + "...",
                    fullDescription: submission.description,
                    usageStatus: ToolUsageStatus.COMMUNITY_APPROVED,
                    badges: ["Community driven"],
                    submittedById: submission.submittedById,
                    usageContexts: [submission.useCase]
                }
            });

            await prisma.toolSubmission.update({
                where: { id: submissionId },
                data: {
                    status: ToolUsageStatus.COMMUNITY_APPROVED,
                    reviewedById: session.user.id,
                    reviewNotes: notes,
                    approvedToolId: tool.id
                }
            });
        }

        revalidatePath('/dashboard/tools');
        revalidatePath('/dashboard/tools/submissions');
        return { success: true };
    } catch (e) {
        console.error("Review tool submission error:", e);
        return { error: "Failed to review tool submission." };
    }
}

export async function linkArtifactToTool(
    artifactId: string,
    toolId: string,
    context?: string
) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized." };

    try {
        await prisma.artifactTool.create({
            data: {
                artifactId,
                toolId,
                usageContext: context
            }
        });

        revalidatePath(`/dashboard/tools/${toolId}`);
        revalidatePath(`/dashboard/artifacts/${artifactId}`);
        return { success: true };
    } catch (e) {
        console.error("Link artifact to tool error:", e);
        return { error: "Failed to link tool to artifact." };
    }
}
