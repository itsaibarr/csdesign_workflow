import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Users, Target, MessageSquare, Zap, Shield, Crown, Terminal, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function TeamPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect('/login');
    }

    const userWithTeam = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            team: {
                include: {
                    members: true,
                    artifacts: {
                        take: 5,
                        orderBy: { createdAt: 'desc' }
                    }
                }
            }
        }
    });

    const team = userWithTeam?.team;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-1 text-center md:text-left">
                    <h1 className="text-4xl font-extrabold tracking-tighter text-gradient">Collaborative Node</h1>
                    <p className="text-muted-foreground font-medium">Synchronizing engineering efforts within your assigned unit.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        Comms
                    </button>
                    <button className="px-6 py-4 bg-primary text-black rounded-2xl flex items-center gap-2 text-sm font-bold uppercase tracking-widest glow-primary hover:scale-[1.02] transition-all">
                        Project Space
                    </button>
                </div>
            </div>

            {!team ? (
                <div className="glass-panel p-20 text-center space-y-6 rounded-[3rem] border-white/5">
                    <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto border border-white/10 border-dashed">
                        <Users className="w-10 h-10 text-muted-foreground/50" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black tracking-tighter italic uppercase text-white/40">Unit Unassigned</h2>
                        <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                            You are currently a solo node. Request team clearance to join a specialized engineering cohort.
                        </p>
                    </div>
                    <button className="px-10 py-5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                        Request Team Assignment
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Team Identity */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Team Banner */}
                        <div className="glass-panel p-10 rounded-[3rem] border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 group-hover:bg-primary/20 transition-all duration-700" />

                            <div className="relative z-10 space-y-6">
                                <div className="space-y-2">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
                                        Unit Active • Cohort Alpha
                                    </div>
                                    <h2 className="text-5xl font-black tracking-tighter leading-none text-gradient">{team.name}</h2>
                                </div>
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                                        <Target className="w-4 h-4" />
                                        Primary Strategic Goal
                                    </div>
                                    <p className="text-lg font-medium text-white/80 leading-snug">
                                        {team.goal || 'No goal set for this unit.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Team Grid: Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                { label: 'Unit Velocity', value: '84%', icon: Zap, color: 'text-primary' },
                                { label: 'Shared Artifacts', value: team.artifacts?.length || 0, icon: Sparkles, color: 'text-blue-400' },
                                { label: 'Security Level', value: 'IV', icon: Shield, color: 'text-emerald-400' },
                            ].map((stat, i) => (
                                <div key={i} className="glass-card p-6 rounded-[2rem] border-white/5 relative group overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-1">{stat.label}</div>
                                        <div className="text-3xl font-black tracking-tight">{stat.value}</div>
                                    </div>
                                    <stat.icon className={cn("absolute -bottom-2 -right-2 w-20 h-20 opacity-5 group-hover:opacity-10 transition-all rotate-12 group-hover:rotate-0", stat.color)} />
                                </div>
                            ))}
                        </div>

                        {/* Recent Team Activity */}
                        <div className="glass-panel rounded-[2.5rem] border-white/5 overflow-hidden">
                            <div className="p-8 border-b border-white/5 flex justify-between items-center">
                                <h3 className="text-xl font-black uppercase tracking-widest text-white/50">Unit Transmissions</h3>
                                <button className="text-xs font-bold text-primary hover:underline">View History</button>
                            </div>
                            <div className="divide-y divide-white/5">
                                {team.artifacts?.map((art, i) => (
                                    <div key={i} className="p-6 flex items-start gap-4 hover:bg-white/[0.02] transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                            <Terminal className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold">{art.title}</p>
                                            <p className="text-xs text-muted-foreground opacity-60">System generated outcome linked to Unit project.</p>
                                        </div>
                                    </div>
                                ))}
                                {(!team.artifacts || team.artifacts.length === 0) && (
                                    <div className="p-10 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest">
                                        No recent unit outcomes.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Members & Social */}
                    <div className="space-y-8">
                        <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black uppercase tracking-widest">Unit Nodes</h3>
                                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black text-muted-foreground">{team.members.length}</span>
                            </div>
                            <div className="space-y-4">
                                {team.members.map((member, i) => (
                                    <div key={i} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 overflow-hidden flex items-center justify-center font-black text-white/20">
                                                {member.image ? <img src={member.image} alt="" className="w-full h-full object-cover" /> : member.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold group-hover:text-primary transition-colors">{member.name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{member.role || 'Contributor'}</p>
                                            </div>
                                        </div>
                                        {i === 0 && <Crown className="w-4 h-4 text-amber-500 fill-amber-500/20" />}
                                    </div>
                                ))}
                            </div>
                            <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                Expand Directory
                            </button>
                        </div>

                        {/* Recruitment Section */}
                        <div className="glass-card p-8 rounded-[2.5rem] bg-emerald-500/5 border-emerald-500/20 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                                <Users className="w-8 h-8 text-emerald-400" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-black uppercase tracking-widest text-emerald-100">Invite Nodes</p>
                                <p className="text-xs text-emerald-400/60 leading-relaxed font-medium">
                                    Your unit has 2 slots available for specialized engineering talent.
                                </p>
                            </div>
                            <button className="w-full py-4 bg-emerald-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-[1.05] transition-all">
                                Generate Invite
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
