import { prisma } from '@/lib/prisma';
import { UserManager } from '@/components/dashboard/admin/UserManager';
import { Users } from 'lucide-react';

export default async function AdminUsersPage() {
    // Fetch data
    const [users, branches] = await Promise.all([
        prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                branchId: true
            },
            take: 200 // Limit for initial scalability without full pagination
        }),
        prisma.branch.findMany({
            where: { active: true },
            select: { id: true, name: true }
        })
    ]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary/80 font-bold uppercase tracking-[0.2em] text-[10px]">
                        <Users className="w-3 h-3" />
                        User Database
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                        Personnel <span className="text-primary italic">Manifest</span>
                    </h1>
                </div>
            </header>

            <UserManager users={users} branches={branches} />
        </div>
    );
}
