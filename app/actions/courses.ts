'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { NodeStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// Type definition for the return value of getCourseData
export type CourseData = {
    id: string;
    title: string;
    description: string | null;
    slug: string;
    progress: number;
    nodes: Array<{
        id: string;
        title: string;
        description: string | null;
        weekRange: string;
        nodeType: string;
        order: number;
        requiredActions: string | null;
        status: NodeStatus;
        completedAt: Date | null;
    }>;
};

export async function getCourseData(slug: string = 'ai-productivity-adaptation') {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        throw new Error('Unauthorized');
    }

    const userId = session.user.id;

    // 1. Fetch Course and Nodes
    const course = await prisma.course.findUnique({
        where: { slug },
        include: {
            nodes: {
                orderBy: { order: 'asc' },
            },
        },
    });

    if (!course) {
        return { error: 'Course not found' };
    }

    // 2. Fetch User Progress
    let progress = await prisma.userNodeProgress.findMany({
        where: {
            userId: userId,
            node: { courseId: course.id },
        },
    });

    // 3. Initialize Progress if empty
    if (progress.length === 0 && course.nodes.length > 0) {
        // Unlock first node
        const firstNode = course.nodes[0];

        await prisma.userNodeProgress.create({
            data: {
                userId: userId,
                nodeId: firstNode.id,
                status: NodeStatus.AVAILABLE, // First node is available
            },
        });

        // Re-fetch to include the new record
        progress = await prisma.userNodeProgress.findMany({
            where: {
                userId: userId,
                node: { courseId: course.id },
            },
        });
    }

    // 4. Merge Data for Frontend
    const nodesWithStatus = course.nodes.map(node => {
        const userProgress = progress.find(p => p.nodeId === node.id);
        return {
            ...node,
            status: userProgress ? userProgress.status : NodeStatus.LOCKED,
            completedAt: userProgress?.completedAt || null,
        };
    });

    // Calculate Overall Progress
    const completedCount = nodesWithStatus.filter(n => n.status === NodeStatus.COMPLETED).length;
    const totalCount = nodesWithStatus.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
        course: {
            ...course,
            progress: progressPercent,
            nodes: nodesWithStatus,
        }
    };
}

/**
 * Get detailed information for a specific stage/node
 */
export async function getStageDetail(nodeId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        throw new Error('Unauthorized');
    }

    const userId = session.user.id;

    // Fetch the node with course info
    const node = await prisma.courseNode.findUnique({
        where: { id: nodeId },
        include: {
            course: true,
        },
    });

    if (!node) {
        return { error: 'Stage not found' };
    }

    // Get user's progress for this node
    const userProgress = await prisma.userNodeProgress.findUnique({
        where: {
            userId_nodeId: {
                userId: userId,
                nodeId: nodeId,
            },
        },
    });

    // Parse required actions
    let stageDetails = null;
    if (node.requiredActions) {
        try {
            stageDetails = JSON.parse(node.requiredActions);
        } catch (e) {
            console.error('Failed to parse requiredActions:', e);
        }
    }

    // Get linked artifacts
    const artifacts = await prisma.artifact.findMany({
        where: {
            userId: userId,
            courseNodeId: nodeId,
        },
        select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
        },
    });

    return {
        stage: {
            ...node,
            status: userProgress?.status || 'LOCKED',
            completedAt: userProgress?.completedAt,
            details: stageDetails,
            artifacts,
        },
    };
}

/**
 * Mark a stage as IN_PROGRESS when user starts it
 */
export async function startStage(nodeId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        throw new Error('Unauthorized');
    }

    const userId = session.user.id;

    // Check if node is available
    const progress = await prisma.userNodeProgress.findUnique({
        where: {
            userId_nodeId: {
                userId: userId,
                nodeId: nodeId,
            },
        },
    });

    if (!progress || progress.status === NodeStatus.LOCKED) {
        return { error: 'This stage is not available yet' };
    }

    if (progress.status === NodeStatus.COMPLETED) {
        return { error: 'This stage is already completed' };
    }

    // Update to IN_PROGRESS
    await prisma.userNodeProgress.update({
        where: {
            userId_nodeId: {
                userId: userId,
                nodeId: nodeId,
            },
        },
        data: {
            status: NodeStatus.IN_PROGRESS,
        },
    });

    revalidatePath('/dashboard/courses');
    return { success: true };
}

export async function checkNodeCompletion(nodeId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        throw new Error('Unauthorized');
    }

    const userId = session.user.id;

    // 1. Check for Artifacts linked to this node
    const artifactCount = await prisma.artifact.count({
        where: {
            userId: userId,
            courseNodeId: nodeId,
        },
    });

    if (artifactCount > 0) {
        // Mark as COMPLETED
        await prisma.userNodeProgress.upsert({
            where: {
                userId_nodeId: {
                    userId: userId,
                    nodeId: nodeId,
                },
            },
            update: {
                status: NodeStatus.COMPLETED,
                completedAt: new Date(),
            },
            create: {
                userId: userId,
                nodeId: nodeId,
                status: NodeStatus.COMPLETED,
                completedAt: new Date(),
            },
        });

        // Unlock Next Node
        const currentNode = await prisma.courseNode.findUnique({
            where: { id: nodeId },
        });

        if (currentNode) {
            const nextNode = await prisma.courseNode.findFirst({
                where: {
                    courseId: currentNode.courseId,
                    order: currentNode.order + 1,
                },
            });

            if (nextNode) {
                // Check if already exists to avoid overwriting existing progress
                const nextProgress = await prisma.userNodeProgress.findUnique({
                    where: {
                        userId_nodeId: {
                            userId: userId,
                            nodeId: nextNode.id,
                        },
                    },
                });

                if (!nextProgress) {
                    await prisma.userNodeProgress.create({
                        data: {
                            userId: userId,
                            nodeId: nextNode.id,
                            status: NodeStatus.AVAILABLE,
                        },
                    });
                }
            }
        }

        revalidatePath('/dashboard/courses');
        return { success: true };
    }

    return { success: false, message: 'No artifacts found for this node.' };
}
