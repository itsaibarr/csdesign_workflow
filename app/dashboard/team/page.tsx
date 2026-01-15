import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import { redirect } from 'next/navigation';
import { Users, Plus, LogIn, Zap, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMyTeams } from '@/app/actions/teams';
import Link from 'next/link';

export default async function TeamPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect('/login');
    }

    const result = await getMyTeams();
    const teams = result.success ? result.teams : [];

    const isStudent = session.user.role === 'STUDENT';
    const isMentor = session.user.role === 'MENTOR';

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-1 text-center md:text-left">
                    <h1 className="text-4xl font-extrabold tracking-tighter text-gradient">
                        {isMentor ? 'Mentored Teams' : 'Team Workspace'}
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        {isMentor
                            ? 'Review and guide student team projects'
                            : 'Collaborate on team projects during weeks 9–12'
                        }
                    </p>
                </div>
                {isStudent && (
                    <div className="flex gap-4">
                        <Link
                            href="/dashboard/team/join"
                            className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                            <LogIn className="w-4 h-4 text-primary" />
                            Join Team
                        </Link>
                        <Link
                            href="/dashboard/team/create"
                            className="px-6 py-4 bg-primary text-black rounded-2xl flex items-center gap-2 text-sm font-bold uppercase tracking-widest glow-primary hover:scale-[1.02] transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Create Team
                        </Link>
                    </div>
                )}
            </div>

            {/* Teams List */}
            {teams.length === 0 ? (
                <div className="glass-panel p-20 text-center space-y-6 rounded-[3rem] border-white/5">
                    <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto border border-white/10 border-dashed">
                        <Users className="w-10 h-10 text-muted-foreground/50" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black tracking-tighter italic uppercase text-white/40">
                            {isStudent ? 'No Teams Yet' : 'No Teams Assigned'}
                        </h2>
                        <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                            {isStudent
                                ? 'Create a new team or join an existing one to start collaborating on projects.'
                                : 'You have no teams assigned yet. Contact an administrator for team assignments.'
                            }
                        </p>
                    </div>
                    {isStudent && (
                        <div className="flex gap-4 justify-center">
                            <Link
                                href="/dashboard/team/create"
                                className="px-10 py-5 bg-primary text-black rounded-2xl text-xs font-black uppercase tracking-widest glow-primary hover:scale-[1.05] transition-all"
                            >
                                Create Team
                            </Link>
                            <Link
                                href="/dashboard/team/join"
                                className="px-10 py-5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                            >
                                Join Team
                            </Link>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team: any) => (
                        <Link
                            key={team.id}
                            href={`/dashboard/team/${team.id}`}
                            className="glass-panel p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group hover:border-primary/20 transition-all"
                        >
                            {/* Background Glow */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-all duration-700" />

                            <div className="relative z-10 space-y-6">
                                {/* Header */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                            team.status === 'FORMING' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                                team.status === 'ACTIVE' ? "bg-primary/10 text-primary border border-primary/20" :
                                                    team.status === 'SUBMITTED' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                                        team.status === 'APPROVED' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                                            "bg-white/5 text-muted-foreground border border-white/10"
                                        )}>
                                            {team.status}
                                        </span>
                                        <div className="flex -space-x-2">
                                            {team.members.slice(0, 3).map((member: any, i: number) => (
                                                <div
                                                    key={i}
                                                    className="w-8 h-8 rounded-full border-2 border-black bg-white/5 flex items-center justify-center text-[10px] font-bold"
                                                    title={member.name}
                                                >
                                                    {member.image ? (
                                                        <img src={member.image} alt="" className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        member.name?.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                            ))}
                                            {team.members.length > 3 && (
                                                <div className="w-8 h-8 rounded-full border-2 border-black bg-white/10 flex items-center justify-center text-[10px] font-bold">
                                                    +{team.members.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">
                                        {team.name}
                                    </h3>
                                    {team.goal && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {team.goal}
                                        </p>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                                            <Users className="w-3 h-3" />
                                            Members
                                        </div>
                                        <div className="text-xl font-black">{team.members.length}/{team.maxMembers}</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                                            <Target className="w-3 h-3" />
                                            Tasks
                                        </div>
                                        <div className="text-xl font-black">{team._count?.tasks || 0}</div>
                                    </div>
                                </div>

                                {/* View Arrow */}
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                        View Workspace
                                    </span>
                                    <Zap className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
