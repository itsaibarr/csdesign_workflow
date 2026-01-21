import { prisma } from '@/lib/prisma';
import { BranchManager } from '@/components/dashboard/admin/BranchManager';
import { Layers } from 'lucide-react';

export default async function AdminBranchesPage() {
    // Fetch branches with user count
    const branches = await prisma.branch.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { users: true }
            }
        }
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary/80 font-bold uppercase tracking-[0.2em] text-[10px]">
                        <Layers className="w-3 h-3" />
                        Branch Operations
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                        Manage <span className="text-primary italic">Locations</span>
                    </h1>
                </div>
            </header>

            <BranchManager initialBranches={branches} />
        </div>
    );
}
