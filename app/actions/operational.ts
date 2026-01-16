'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { ArtifactStatus, UserRole } from "@prisma/client"

export type OperationalActionState = {
    success: boolean
    message: string
    error?: string
}

async function getSession() {
    return await auth.api.getSession({
        headers: await headers()
    })
}

// Student Action: Submit Artifact
export async function submitArtifact(artifactId: string): Promise<OperationalActionState> {
    const session = await getSession()
    if (!session?.user) {
        return { success: false, message: "Unauthorized", error: "Not logged in" }
    }

    const artifact = await prisma.artifact.findUnique({
        where: { id: artifactId },
        include: { user: true }
    })

    if (!artifact) {
        return { success: false, message: "Artifact not found" }
    }

    if (artifact.userId !== session.user.id) {
        return { success: false, message: "Unauthorized", error: "You do not own this artifact" }
    }

    // Only allow submission from DRAFT or NEEDS_IMPROVEMENT or IN_PROGRESS
    const allowedStatuses = ['DRAFT', 'NEEDS_IMPROVEMENT', 'IN_PROGRESS']
    if (!allowedStatuses.includes(artifact.status)) {
        return { success: false, message: "Invalid status for submission", error: `Current status: ${artifact.status}` }
    }

    try {
        await prisma.artifact.update({
            where: { id: artifactId },
            data: { status: 'SUBMITTED' }
        })

        revalidatePath('/dashboard')
        revalidatePath(`/dashboard/work/${artifactId}`)
        return { success: true, message: "Artifact submitted successfully" }
    } catch (e) {
        console.error("Failed to submit artifact:", e)
        return { success: false, message: "Database error during submission" }
    }
}

// Mentor Action: Review Artifact (Approve or Request Changes)
export async function reviewArtifact(
    artifactId: string,
    status: 'VALIDATED' | 'NEEDS_IMPROVEMENT',
    feedback: string
): Promise<OperationalActionState> {
    const session = await getSession()
    if (!session?.user) {
        return { success: false, message: "Unauthorized" }
    }

    // Check if user is mentor
    const mentor = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, id: true }
    })

    if (mentor?.role !== 'MENTOR') {
        return { success: false, message: "Unauthorized", error: "Only mentors can review" }
    }

    const artifact = await prisma.artifact.findUnique({
        where: { id: artifactId },
        include: { user: true }
    })

    if (!artifact) {
        return { success: false, message: "Artifact not found" }
    }

    // Verify mentor relationship (Optional for MVP, but good for strictness)
    // For now, we allow any mentor to review if the student is assigned to them
    // OR if we just want to enforce role-based access. 
    // The requirement says: "mentor: sees only students assigned to them".
    // So we should check if artifact.user.mentorId === mentor.id

    // Verify mentor relationship
    // The requirement says: "mentor: sees only students assigned to them".
    if (artifact.user.mentorId !== mentor.id) {
        return { success: false, message: "Unauthorized", error: "This student is not assigned to you." }
    }

    if (artifact.status !== 'SUBMITTED') {
        // Mentor can technically override, but usually they review submitted items.
        // We'll allow it if it's already validated (to correct mistake) or needs improvement,
        // but typically it follows the flow.
    }

    try {
        // Update artifact status
        await prisma.artifact.update({
            where: { id: artifactId },
            data: { status: status }
        })

        // Log comment/feedback
        if (feedback) {
            await prisma.comment.create({
                data: {
                    content: `[${status}] ${feedback}`,
                    userId: mentor.id,
                    artifactId: artifactId
                }
            })
        }

        revalidatePath('/dashboard/reviews')
        revalidatePath(`/dashboard/reviews/${artifactId}`)
        return { success: true, message: `Artifact ${status === 'VALIDATED' ? 'approved' : 'returned for improvement'}` }

    } catch (e) {
        console.error("Review failed:", e)
        return { success: false, message: "Database error during review" }
    }
}
