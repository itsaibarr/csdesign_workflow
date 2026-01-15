"use server";

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from "next/headers";
import { ArtifactStatus, ArtifactType } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { checkNodeCompletion } from '@/app/actions/courses';

export type ArtifactInput = {
    title: string;
    problemDescription: string;
    goal: string;
    type: ArtifactType;
    courseNodeId?: string;
    toolIds?: string[]; // New: list of tools used
};

export type EfficiencyInput = {
    timeSavedMinutes: number;
    workSimplificationNote: string;
};

async function getSession() {
    return await auth.api.getSession({
        headers: await headers()
    });
}

export async function createArtifact(data: ArtifactInput) {
    const session = await getSession();
    if (!session || session.user.role !== 'STUDENT') {
        return { error: "Unauthorized: Only students can create artifacts." };
    }

    const { toolIds, ...artifactData } = data;

    // Constraint: Max 5 individual artifacts
    if (data.type === ArtifactType.SCHOOL || data.type === ArtifactType.PERSONAL) {
        const count = await prisma.artifact.count({
            where: {
                userId: session.user.id,
                type: { in: [ArtifactType.SCHOOL, ArtifactType.PERSONAL] }
            }
        });

        if (count >= 5) {
            return { error: "Limit Reached: You can only create 5 individual artifacts." };
        }
    }

    // Constraint: Team artifacts locked (Week 9-10 check - simplified as toggle/date check placeholder)
    if (data.type === ArtifactType.TEAM) {
        if (!session.user.teamId) {
            return { error: "You must be in a team to create a Team Artifact." };
        }
    }

    try {
        const artifact = await prisma.artifact.create({
            data: {
                ...artifactData,
                userId: session.user.id,
                teamId: data.type === ArtifactType.TEAM ? session.user.teamId : undefined,
                courseNodeId: data.courseNodeId,
                status: ArtifactStatus.DRAFT,
                artifactTools: {
                    create: toolIds?.map(toolId => ({
                        toolId
                    }))
                }
            }
        });

        // If linked to a course node, check if this completes the node
        if (data.courseNodeId) {
            await checkNodeCompletion(data.courseNodeId);
        }

        revalidatePath('/dashboard/artifacts');
        return { success: true, artifact };
    } catch (e) {
        console.error("Create Artifact Error:", e);
        return { error: "Failed to create artifact." };
    }
}

export async function updateArtifactStatus(id: string, status: ArtifactStatus) {
    const session = await getSession();
    // Assuming 'MENTOR' is the role string
    if (!session || session.user.role !== 'MENTOR') {
        return { error: "Unauthorized: Only mentors can update status." };
    }

    try {
        await prisma.artifact.update({
            where: { id },
            data: { status }
        });
        revalidatePath('/dashboard/artifacts');
        return { success: true };
    } catch (e) {
        return { error: "Failed to update status." };
    }
}

export async function updateEfficiency(artifactId: string, data: EfficiencyInput) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        // Upsert reflection
        await prisma.reflection.upsert({
            where: { artifactId },
            create: {
                artifactId,
                beforeState: "", // explicit blank for now if not provided
                afterState: "",
                ...data,
                reportedByStudent: true,
                validatedByMentor: false, // Reset validation on edit
            },
            update: {
                ...data,
                validatedByMentor: false, // Reset validation on edit
            }
        });
        revalidatePath('/dashboard/artifacts');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to update efficiency data." };
    }
}

export async function deleteArtifact(id: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        const artifact = await prisma.artifact.findUnique({ where: { id } });
        if (!artifact) return { error: "Artifact not found" };

        // Only owner or mentor can delete (though typically only owner should delete their work, mentors might archive)
        // Let's restrict to owner for now as per "Student can delete" request.
        if (artifact.userId !== session.user.id) {
            return { error: "Unauthorized: You can only delete your own artifacts." };
        }

        // Use transaction to manually cascade delete related records
        await prisma.$transaction([
            prisma.artifactTool.deleteMany({ where: { artifactId: id } }),
            prisma.comment.deleteMany({ where: { artifactId: id } }),
            prisma.reflection.deleteMany({ where: { artifactId: id } }),
            prisma.artifact.delete({ where: { id } })
        ]);
        revalidatePath('/dashboard/artifacts');
        return { success: true };
    } catch (e) {
        console.error("Delete error:", e);
        return { error: "Failed to delete artifact." };
    }
}

export async function submitSolutionPlan(id: string, plan: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        const artifact = await prisma.artifact.findUnique({ where: { id } });
        if (!artifact) return { error: "Artifact not found" };

        if (artifact.userId !== session.user.id) {
            return { error: "Unauthorized: You can only submit plans for your own artifacts." };
        }

        await prisma.artifact.update({
            where: { id },
            data: {
                solutionPlan: plan,
                status: ArtifactStatus.SUBMITTED
            }
        });
        revalidatePath('/dashboard/artifacts');
        return { success: true };
    } catch (e) {
        console.error("Submit plan error:", e);
        return { error: "Failed to submit solution plan." };
    }
}
