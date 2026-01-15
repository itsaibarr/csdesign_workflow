"use server";

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from "next/headers";
import { TaskStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

async function getSession() {
    return await auth.api.getSession({
        headers: await headers()
    });
}

export type TaskInput = {
    title: string;
    description?: string;
    status?: TaskStatus;
    assignedTo?: string;
};

export async function createTask(teamId: string, data: TaskInput) {
    const session = await getSession();

    if (!session) {
        return { error: "Unauthorized" };
    }

    try {
        // Verify user is a team member
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: { members: true }
        });

        if (!team) {
            return { error: "Team not found." };
        }

        const isMember = team.members.some(m => m.id === session.user.id);
        if (!isMember) {
            return { error: "You must be a team member to create tasks." };
        }

        // Get current max order for the status
        const maxOrderTask = await prisma.projectTask.findFirst({
            where: {
                teamId,
                status: data.status || TaskStatus.TODO
            },
            orderBy: { order: 'desc' }
        });

        const task = await prisma.projectTask.create({
            data: {
                title: data.title,
                description: data.description,
                status: data.status || TaskStatus.TODO,
                order: (maxOrderTask?.order || 0) + 1,
                teamId,
                assignedTo: data.assignedTo
            },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            }
        });

        revalidatePath(`/dashboard/team/${teamId}`);
        return { success: true, task };
    } catch (e) {
        console.error("Create task error:", e);
        return { error: "Failed to create task." };
    }
}

export async function updateTask(taskId: string, data: Partial<TaskInput>) {
    const session = await getSession();

    if (!session) {
        return { error: "Unauthorized" };
    }

    try {
        const task = await prisma.projectTask.findUnique({
            where: { id: taskId },
            include: {
                team: {
                    include: { members: true }
                }
            }
        });

        if (!task) {
            return { error: "Task not found." };
        }

        const isMember = task.team.members.some(m => m.id === session.user.id);
        if (!isMember) {
            return { error: "You must be a team member to update tasks." };
        }

        await prisma.projectTask.update({
            where: { id: taskId },
            data: {
                title: data.title,
                description: data.description,
                assignedTo: data.assignedTo
            }
        });

        revalidatePath(`/dashboard/team/${task.teamId}`);
        return { success: true };
    } catch (e) {
        console.error("Update task error:", e);
        return { error: "Failed to update task." };
    }
}

export async function moveTask(taskId: string, newStatus: TaskStatus, newOrder?: number) {
    const session = await getSession();

    if (!session) {
        return { error: "Unauthorized" };
    }

    try {
        const task = await prisma.projectTask.findUnique({
            where: { id: taskId },
            include: {
                team: {
                    include: { members: true }
                }
            }
        });

        if (!task) {
            return { error: "Task not found." };
        }

        const isMember = task.team.members.some(m => m.id === session.user.id);
        if (!isMember) {
            return { error: "You must be a team member to move tasks." };
        }

        // If no order specified, append to end of new status column
        let order = newOrder;
        if (order === undefined) {
            const maxOrderTask = await prisma.projectTask.findFirst({
                where: {
                    teamId: task.teamId,
                    status: newStatus
                },
                orderBy: { order: 'desc' }
            });
            order = (maxOrderTask?.order || 0) + 1;
        }

        await prisma.projectTask.update({
            where: { id: taskId },
            data: {
                status: newStatus,
                order
            }
        });

        revalidatePath(`/dashboard/team/${task.teamId}`);
        return { success: true };
    } catch (e) {
        console.error("Move task error:", e);
        return { error: "Failed to move task." };
    }
}

export async function deleteTask(taskId: string) {
    const session = await getSession();

    if (!session) {
        return { error: "Unauthorized" };
    }

    try {
        const task = await prisma.projectTask.findUnique({
            where: { id: taskId },
            include: {
                team: {
                    include: { members: true }
                }
            }
        });

        if (!task) {
            return { error: "Task not found." };
        }

        const isMember = task.team.members.some(m => m.id === session.user.id);
        if (!isMember) {
            return { error: "You must be a team member to delete tasks." };
        }

        await prisma.projectTask.delete({
            where: { id: taskId }
        });

        revalidatePath(`/dashboard/team/${task.teamId}`);
        return { success: true };
    } catch (e) {
        console.error("Delete task error:", e);
        return { error: "Failed to delete task." };
    }
}

export async function assignTask(taskId: string, userId: string | null) {
    const session = await getSession();

    if (!session) {
        return { error: "Unauthorized" };
    }

    try {
        const task = await prisma.projectTask.findUnique({
            where: { id: taskId },
            include: {
                team: {
                    include: { members: true }
                }
            }
        });

        if (!task) {
            return { error: "Task not found." };
        }

        const isMember = task.team.members.some(m => m.id === session.user.id);
        if (!isMember) {
            return { error: "You must be a team member to assign tasks." };
        }

        // Verify assignee is a team member (if not null)
        if (userId) {
            const isAssigneeMember = task.team.members.some(m => m.id === userId);
            if (!isAssigneeMember) {
                return { error: "Can only assign tasks to team members." };
            }
        }

        await prisma.projectTask.update({
            where: { id: taskId },
            data: { assignedTo: userId }
        });

        revalidatePath(`/dashboard/team/${task.teamId}`);
        return { success: true };
    } catch (e) {
        console.error("Assign task error:", e);
        return { error: "Failed to assign task." };
    }
}

export async function getTeamTasks(teamId: string) {
    const session = await getSession();

    if (!session) {
        return { error: "Unauthorized" };
    }

    try {
        const tasks = await prisma.projectTask.findMany({
            where: { teamId },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            },
            orderBy: [{ status: 'asc' }, { order: 'asc' }]
        });

        return { success: true, tasks };
    } catch (e) {
        console.error("Get tasks error:", e);
        return { error: "Failed to load tasks." };
    }
}
