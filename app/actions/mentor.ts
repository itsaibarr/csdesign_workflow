'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { NodeStatus } from '@prisma/client';

export async function updateNodeStatus(
    studentId: string,
    nodeId: string,
    newStatus: NodeStatus
) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.email) {
        throw new Error('Unauthorized');
    }

    const mentor = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true }
    });

    if (!mentor || mentor.role !== 'MENTOR') {
        throw new Error('Forbidden: Mentors only');
    }

    // Verify student ownership
    const student = await prisma.user.findUnique({
        where: { id: studentId },
        include: { team: true }
    });

    if (!student) {
        throw new Error('Student not found');
    }

    // Allow if student is directly assigned OR in a team mentored by this mentor
    const isDirectlyAssigned = student.mentorId === mentor.id;
    const isTeamMentored = student.team?.mentorId === mentor.id;

    if (!isDirectlyAssigned && !isTeamMentored) {
        throw new Error('Forbidden: You are not this student\'s mentor');
    }

    // Update status
    // Use upsert just in case the progress record doesn't exist yet (though it should)
    await prisma.userNodeProgress.upsert({
        where: {
            userId_nodeId: {
                userId: studentId,
                nodeId: nodeId
            }
        },
        update: {
            status: newStatus
        },
        create: {
            userId: studentId,
            nodeId: nodeId,
            status: newStatus
        }
    });

    revalidatePath(`/dashboard/students/${studentId}`);
    revalidatePath('/dashboard/students');
    return { success: true };
}
