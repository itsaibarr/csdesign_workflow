'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

export type MentorshipActionState = {
    success: boolean
    message: string
    error?: string
}

async function getSession() {
    return await auth.api.getSession({
        headers: await headers()
    })
}

// Fetch available mentors for selection
export async function getAvailableMentors() {
    try {
        const mentors = await prisma.user.findMany({
            where: { role: 'MENTOR' },
            select: {
                id: true,
                name: true,
                image: true,
                email: true // Optional: show email/bio if needed
                // Add more profile info here if available (e.g., bio, expertise)
            }
        })
        return mentors
    } catch (e) {
        console.error("Failed to fetch mentors", e)
        return []
    }
}

// Create a Mentorship Request (Student -> Mentor)
export async function requestMentorship(mentorId: string): Promise<MentorshipActionState> {
    const session = await getSession()
    if (!session?.user) {
        return { success: false, message: "Unauthorized" }
    }

    const studentId = session.user.id

    // Validations
    const existingRequest = await (prisma as any).mentorshipRequest.findFirst({
        where: {
            studentId: studentId,
            status: 'PENDING'
        }
    })

    if (existingRequest) {
        return { success: false, message: "You already have a pending request." }
    }

    const existingMentor = await prisma.user.findUnique({
        where: { id: studentId },
        select: { mentorId: true } as any
    })

    if (existingMentor?.mentorId) {
        return { success: false, message: "You already have a mentor assigned." }
    }

    try {
        await (prisma as any).mentorshipRequest.create({
            data: {
                studentId,
                mentorId,
                status: 'PENDING'
            }
        })

        revalidatePath('/dashboard')
        return { success: true, message: "Request sent successfully" }
    } catch (e) {
        console.error("Failed to create mentorship request", e)
        return { success: false, message: "Failed to send request" }
    }
}

// Accept a Mentorship Request (Mentor -> Student)
export async function acceptMentorship(requestId: string): Promise<MentorshipActionState> {
    const session = await getSession()
    if (!session?.user || session.user.role !== 'MENTOR') {
        return { success: false, message: "Unauthorized" }
    }

    const request = await (prisma as any).mentorshipRequest.findUnique({
        where: { id: requestId },
        include: { student: true }
    })

    if (!request) {
        return { success: false, message: "Request not found" }
    }

    if (request.mentorId !== session.user.id) {
        return { success: false, message: "Unauthorized", error: " This request is not for you" }
    }

    if (request.status !== 'PENDING') {
        return { success: false, message: "Request is not pending" }
    }

    try {
        // Transaction: Update Request -> ACCEPTED, Update User -> mentorId
        await prisma.$transaction([
            (prisma as any).mentorshipRequest.update({
                where: { id: requestId },
                data: { status: 'ACCEPTED' }
            }),
            prisma.user.update({
                where: { id: request.studentId },
                data: { mentorId: session.user.id } as any
            })
        ])

        revalidatePath('/dashboard')
        return { success: true, message: "Student accepted successfully" }
    } catch (e) {
        console.error("Failed to accept mentorship", e)
        return { success: false, message: "Database error" }
    }
}

// Reject a Mentorship Request (Mentor -> Student)
export async function rejectMentorship(requestId: string): Promise<MentorshipActionState> {
    const session = await getSession()
    if (!session?.user || session.user.role !== 'MENTOR') {
        return { success: false, message: "Unauthorized" }
    }

    const request = await (prisma as any).mentorshipRequest.findUnique({
        where: { id: requestId }
    })

    if (!request || request.mentorId !== session.user.id) {
        return { success: false, message: "Unauthorized" }
    }

    try {
        await (prisma as any).mentorshipRequest.update({
            where: { id: requestId },
            data: { status: 'REJECTED' }
        })

        revalidatePath('/dashboard')
        return { success: true, message: "Request rejected" }
    } catch (e) {
        console.error("Failed to reject mentorship", e)
        return { success: false, message: "Database error" }
    }
}

// Cancel a Request (Student -> Mentor)
export async function cancelMentorshipRequest(requestId: string): Promise<MentorshipActionState> {
    const session = await getSession()
    if (!session?.user) {
        return { success: false, message: "Unauthorized" }
    }

    const request = await (prisma as any).mentorshipRequest.findUnique({
        where: { id: requestId }
    })

    if (!request || request.studentId !== session.user.id) {
        return { success: false, message: "Unauthorized" }
    }

    try {
        await (prisma as any).mentorshipRequest.update({
            where: { id: requestId },
            data: { status: 'CANCELLED' }
        })

        revalidatePath('/dashboard')
        return { success: true, message: "Request cancelled" }
    } catch (e) {
        console.error("Failed to cancel request", e)
        return { success: false, message: "Database error" }
    }
}
