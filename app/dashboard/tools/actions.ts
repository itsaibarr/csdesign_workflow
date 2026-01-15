
'use server';

import { prisma } from '@/lib/prisma';
import { ToolUsageStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function approveTool(toolId: string) {
    try {
        await prisma.tool.update({
            where: { id: toolId },
            data: {
                usageStatus: ToolUsageStatus.COMMUNITY_APPROVED
            }
        });
        revalidatePath('/dashboard/tools/admin');
        revalidatePath('/dashboard/tools');
        return { success: true };
    } catch (error) {
        console.error("Failed to approve tool", error);
        return { success: false, error: 'Failed' };
    }
}

export async function rejectTool(toolId: string) {
    try {
        await prisma.tool.update({
            where: { id: toolId },
            data: {
                usageStatus: ToolUsageStatus.REJECTED
            }
        });
        revalidatePath('/dashboard/tools/admin');
        return { success: true };
    } catch (error) {
        console.error("Failed to reject tool", error);
        return { success: false, error: 'Failed' };
    }
}
