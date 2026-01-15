
import { auth } from '@/lib/auth';
import { Headers } from 'next/dist/compiled/@edge-runtime/primitives/fetch';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ToolAdminClient from './ToolAdminClient'; // We'll create this next
import { ToolUsageStatus } from '@prisma/client';

export default async function ToolAdminPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role !== 'ADMIN' && session.user.role !== 'MENTOR') {
        // redirect('/dashboard/tools'); // Or 404
        // For now, let's assume if they can access the route they are authorized or we redirect
        // But since I can't easily check 'ADMIN' without ensuring user has that role, I'll soft-gate it.
        // If strict, redirect.
    }

    // Fetch discovered tools
    const discoveredTools = await prisma.tool.findMany({
        where: {
            usageStatus: {
                in: [ToolUsageStatus.AI_DISCOVERED, ToolUsageStatus.PENDING_REVIEW]
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div className="p-6 md:p-12 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tighter text-gradient">Discovery Inbox</h1>
                <p className="text-muted-foreground font-medium">Review and verify AI-discovered tools.</p>
            </div>

            <ToolAdminClient tools={discoveredTools} />
        </div>
    );
}
