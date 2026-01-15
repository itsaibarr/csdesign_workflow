import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ToolUsageStatus } from '@prisma/client';
import ToolReviewClient from './ToolReviewClient';

export default async function ToolSubmissionsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role === 'STUDENT') {
        redirect('/dashboard/tools');
    }

    const submissions = await prisma.toolSubmission.findMany({
        where: {
            status: ToolUsageStatus.PENDING_REVIEW
        },
        include: {
            submittedBy: {
                select: {
                    name: true,
                    image: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div className="container mx-auto py-10 px-4 md:px-0">
            <div className="mb-10 space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tighter text-gradient">Pending Tool Submissions</h1>
                <p className="text-muted-foreground font-medium">Review and approve tool suggestions from the community.</p>
            </div>

            <ToolReviewClient initialSubmissions={submissions as any} />
        </div>
    );
}
