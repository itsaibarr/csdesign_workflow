'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { UserRole, ToolUsageStatus } from '@prisma/client'

async function checkAdmin() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user?.email) throw new Error('Unauthorized')

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (user?.role !== 'ADMIN') throw new Error('Forbidden: Admins only')
    return user
}

export async function createBranch(data: { name: string, location?: string }) {
    await checkAdmin()

    const branch = await prisma.branch.create({
        data: {
            name: data.name,
            location: data.location,
            active: true
        }
    })

    revalidatePath('/dashboard/admin/branches')
    return branch
}

export async function toggleBranchActive(id: string, active: boolean) {
    await checkAdmin()

    const branch = await prisma.branch.update({
        where: { id },
        data: { active }
    })

    revalidatePath('/dashboard/admin/branches')
    return branch
}

export async function updateUserRole(userId: string, role: string) {
    await checkAdmin()

    // Validate role
    if (!Object.values(UserRole).includes(role as UserRole)) {
        throw new Error('Invalid role')
    }

    const user = await prisma.user.update({
        where: { id: userId },
        data: { role: role as UserRole }
    })

    revalidatePath('/dashboard/admin/users')
    return user
}

export async function assignUserToBranch(userId: string, branchId: string | null) {
    await checkAdmin()

    const user = await prisma.user.update({
        where: { id: userId },
        data: { branchId }
    })

    revalidatePath('/dashboard/admin/users')
    return user
}


export async function assignMentorToStudent(studentId: string, mentorId: string | null) {
    await checkAdmin()

    const user = await prisma.user.update({
        where: { id: studentId },
        data: { mentorId }
    })

    revalidatePath('/dashboard/admin/assignments')
    return user
}

export async function approveTool(toolId: string) {
    await checkAdmin()

    const tool = await prisma.tool.update({
        where: { id: toolId },
        data: { usageStatus: ToolUsageStatus.COMMUNITY_APPROVED }
    })

    revalidatePath('/dashboard/admin/tools')
    revalidatePath('/dashboard/tools') // Update student view
    revalidatePath('/dashboard/admin') // Update counters
    return tool
}

export async function rejectTool(toolId: string) {
    await checkAdmin()

    const tool = await prisma.tool.update({
        where: { id: toolId },
        data: { usageStatus: ToolUsageStatus.REJECTED }
    })

    revalidatePath('/dashboard/admin/tools')
    revalidatePath('/dashboard/admin')
    return tool
}
