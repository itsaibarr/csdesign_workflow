import ToolsClientPage from './ToolsClientPage';
import { ToolCategory, ToolUsageStatus } from '@prisma/client';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

// Fallback types in case Prisma generation is out of sync
type ToolCategoryType = ToolCategory;
type ToolUsageStatusType = ToolUsageStatus;


export default async function ToolsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect('/login');
    }

    // Fetch tools with usage count
    const tools = await prisma.tool.findMany({
        where: {
            usageStatus: {
                in: [ToolUsageStatus.COURSE_OFFICIAL, ToolUsageStatus.COMMUNITY_APPROVED]
            }
        },
        include: {
            _count: {
                select: { artifactTools: true }
            }
        },
        orderBy: {
            artifactTools: {
                _count: 'desc'
            }
        }
    });

    const categories = Object.values(ToolCategory as any) as ToolCategoryType[];

    return (
        <ToolsClientPage
            initialTools={tools.map(t => ({
                id: t.id,
                name: t.name,
                shortDescription: (t as any).shortDescription || "",
                category: t.category as any,
                usageStatus: (t as any).usageStatus as any,
                pricing: (t as any).pricing,
                problemSolved: (t as any).problemSolved,
                badges: (t as any).badges || [],
                url: t.url,
                _count: {
                    artifactTools: (t as any)._count?.artifactTools || 0
                }
            }))}
            categories={categories}
        />
    );
}
