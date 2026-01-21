import { prisma } from '@/lib/prisma';
import { ToolApprovalQueue } from '@/components/dashboard/admin/ToolApprovalQueue';
import { Wrench } from 'lucide-react';

export default async function AdminToolsPage() {

    const tools = await prisma.tool.findMany({
        where: {
            usageStatus: {
                in: ['AI_DISCOVERED', 'PENDING_REVIEW']
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary/80 font-bold uppercase tracking-[0.2em] text-[10px]">
                        <Wrench className="w-3 h-3" />
                        Inventory Control
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                        Tool <span className="text-primary italic">Moderation</span>
                    </h1>
                    <p className="text-muted-foreground font-medium text-sm mt-2">
                        Review AI-discovered tools and student submissions. Approve quality tools to make them available in the Resources library.
                    </p>
                </div>
            </header>

            <ToolApprovalQueue tools={tools} />
        </div>
    );
}
