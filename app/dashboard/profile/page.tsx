import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { User, Mail, Shield, Calendar, Box, Heart, Users, Sparkles, Activity, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function ProfilePage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect('/login');
    }

    const userData = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            team: true,
            hobbies: true,
            artifacts: {
                include: {
                    reflection: true,
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 5
            },
            _count: {
                select: {
                    artifacts: true,
                    comments: true,
                }
            }
        }
    });

    if (!userData) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">User profile not found.</p>
            </div>
        );
    }

    // Calculate total time saved from reflections
    const reflections = await prisma.reflection.findMany({
        where: {
            artifact: {
                userId: userData.id
            }
        }
    });
    const totalTimeSaved = reflections.reduce((acc, curr) => acc + curr.timeSaved, 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Profile Hero Header */}
            <div className="glass-panel rounded-[2.5rem] p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden group-hover:border-primary/30 transition-all duration-500">
                            {userData.image ? (
                                <img src={userData.image} alt={userData.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-16 h-16 text-muted-foreground group-hover:text-primary transition-colors" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                                <span className="text-[10px] uppercase font-bold text-white tracking-widest">Update</span>
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-xl flex items-center justify-center glow-primary border-4 border-background">
                            <Sparkles className="text-black w-4 h-4 fill-black" />
                        </div>
                    </div>

                    <div className="text-center md:text-left space-y-2 flex-grow">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-widest text-primary">
                            System Node: {userData.role}
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tighter text-gradient">{userData.name}</h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {userData.email}
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Joined {new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95">
                            Settings
                        </button>
                        <button className="px-6 py-3 rounded-2xl bg-primary text-black text-sm font-bold uppercase tracking-widest hover:scale-105 transition-all glow-primary active:scale-95">
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Grid */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                            { label: 'Artifacts', value: userData._count.artifacts, icon: Box, color: 'text-primary' },
                            { label: 'Time Saved', value: `${totalTimeSaved}m`, icon: Clock, color: 'text-blue-400' },
                            { label: 'Involved Tools', value: userData._count.comments, icon: Activity, color: 'text-rose-400' },
                        ].map((stat, i) => (
                            <div key={i} className="glass-card p-6 rounded-[2rem] border-white/5 group hover:border-white/10 transition-all">
                                <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 transition-colors", `group-hover:${stat.color}`)}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <div className="text-2xl font-black tracking-tight">{stat.value}</div>
                                <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Engineering Feed / Latest Artifacts */}
                    <div className="glass-panel rounded-[2rem] p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                <Zap className="w-5 h-5 text-primary" />
                                Engineering Activity
                            </h2>
                            <button className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">View All</button>
                        </div>

                        <div className="space-y-4">
                            {userData.artifacts.length > 0 ? (
                                userData.artifacts.map((artifact) => (
                                    <div key={artifact.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0">
                                            <Box className="w-5 h-5" />
                                        </div>
                                        <div className="flex-grow space-y-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-sm tracking-wide">{artifact.title}</h3>
                                                <span className="text-[10px] text-muted-foreground">{new Date(artifact.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                                                    {artifact.type}
                                                </span>
                                                {artifact.reflection && (
                                                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-primary">
                                                        <Clock className="w-3 h-3" />
                                                        +{artifact.reflection.timeSaved}m saved
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center space-y-2">
                                    <Box className="w-12 h-12 text-white/5 mx-auto" />
                                    <p className="text-sm text-muted-foreground">No recent engineering activity recorded.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Team Section */}
                    <div className="glass-panel rounded-[2rem] p-6 space-y-6">
                        <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-400" />
                            Assigned Team
                        </h2>
                        {userData.team ? (
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-2">
                                    <h3 className="font-bold text-blue-400">{userData.team.name}</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{userData.team.goal || 'No objective defined for this node.'}</p>
                                </div>
                                <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                                    Open Team Space
                                </button>
                            </div>
                        ) : (
                            <div className="p-6 text-center space-y-4 rounded-2xl border-2 border-dashed border-white/5">
                                <Users className="w-10 h-10 text-white/5 mx-auto" />
                                <p className="text-xs text-muted-foreground">Not assigned to any collaboration unit.</p>
                                <button className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">Request Assignment</button>
                            </div>
                        )}
                    </div>

                    {/* Hobbies Section */}
                    <div className="glass-panel rounded-[2rem] p-6 space-y-6">
                        <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                            <Heart className="w-5 h-5 text-rose-400" />
                            Personal Nodes
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {userData.hobbies.length > 0 ? (
                                userData.hobbies.map((hobby) => (
                                    <span key={hobby.id} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-muted-foreground hover:border-rose-400/30 hover:text-rose-400 transition-all cursor-default">
                                        {hobby.name}
                                    </span>
                                ))
                            ) : (
                                <p className="text-xs text-muted-foreground italic px-2">No personal interests indexed.</p>
                            )}
                            <button className="w-full mt-2 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                                Manage Hobbies
                            </button>
                        </div>
                    </div>

                    {/* Security Info */}
                    <div className="glass-panel rounded-[2rem] p-6 bg-gradient-to-br from-background to-white/[0.01]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <Shield className="w-4 h-4" />
                            </div>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/80">Access Integrity</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
                                <span className="text-muted-foreground">ID Status</span>
                                <span className="text-emerald-500">Verified</span>
                            </div>
                            <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
                                <span className="text-muted-foreground">MFA Node</span>
                                <span className="text-rose-500">Deactivated</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
