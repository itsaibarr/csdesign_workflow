'use server'

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { z } from 'zod';

const updateProfileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    image: z.string().optional().or(z.literal('')), // Accept both preset paths and base64
});

export async function updateProfile(data: z.infer<typeof updateProfileSchema>) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    const validated = updateProfileSchema.parse(data);

    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            name: validated.name,
            image: validated.image || null,
        },
    });

    revalidatePath('/dashboard/profile');
    return { success: true };
}

const createHobbySchema = z.object({
    name: z.string().min(1, "Hobby name cannot be empty").max(30, "Hobby name too long"),
});

export async function createHobby(data: z.infer<typeof createHobbySchema>) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    const validated = createHobbySchema.parse(data);

    await prisma.hobby.create({
        data: {
            name: validated.name,
            userId: session.user.id
        }
    });

    revalidatePath('/dashboard/profile');
    return { success: true };
}

export async function deleteHobby(hobbyId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    // Verify ownership
    const hobby = await prisma.hobby.findUnique({
        where: { id: hobbyId },
    });

    if (!hobby || hobby.userId !== session.user.id) {
        throw new Error("Unauthorized or not found");
    }

    await prisma.hobby.delete({
        where: { id: hobbyId }
    });

    revalidatePath('/dashboard/profile');
    return { success: true };
}
