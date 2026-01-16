import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Users, Briefcase, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function MentorTeamsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.email) redirect('/login');

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true }
    });

    if (user?.role !== 'MENTOR') {
        redirect('/dashboard');
    }

    const teams = await prisma.team.findMany({
        where: { mentorId: user.id },
        include: {
            members: true,
            _count: { select: { artifacts: true } }
        },
        orderBy: { updatedAt: 'desc' }
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-medium tracking-tight text-white mb-2">My Teams</h1>
                <p className="text-muted-foreground">Oversight for {teams.length} project teams.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map(team => (
                    <div key={team.id} className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.01] hover:border-white/10 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{team.name}</h3>
                                <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">{team.status}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                <Users className="w-5 h-5 text-slate-400" />
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">Project</p>
                                <p className="text-sm text-slate-300 line-clamp-2">{team.projectCase || "No project case defined."}</p>
                            </div>

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">Members</p>
                                <div className="flex -space-x-2">
                                    {team.members.map((member, i) => (
                                        <div key={member.id} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-black flex items-center justify-center text-[10px] font-bold text-white" style={{ zIndex: 10 - i }}>
                                            {member.name[0]}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs">
                            <div className="flex items-center gap-1 text-slate-500">
                                <Briefcase className="w-3 h-3" />
                                {team._count.artifacts} Artifacts
                            </div>
                            {/* Link to team details - assuming page exists or placeholder */}
                            <Link href={`/dashboard/team/${team.id}`} className="flex items-center gap-1 font-bold text-primary hover:gap-2 transition-all">
                                Open Operations <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                ))}

                {teams.length === 0 && (
                    <div className="col-span-full p-12 text-center text-slate-500 border border-dashed border-white/10 rounded-[2rem]">
                        No active teams assigned.
                    </div>
                )}
            </div>
        </div>
    );
}
