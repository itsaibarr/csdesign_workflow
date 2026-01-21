import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import { prisma } from '@/lib/prisma';
import { Layers, Trophy, Clock, Zap, ArrowUpRight, Sparkles, Activity, Search, Box } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Prisma } from '@prisma/client';
import { DashboardSearch } from '@/components/dashboard/DashboardSearch';
import { Suspense } from 'react';

import { MentorSelectionModal } from '@/components/dashboard/student/MentorSelectionModal';

export default async function StudentDashboard() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.email) return null;

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            mentor: {
                select: {
                    name: true,
                    image: true,
                    email: true
                }
            },
            sentMentorshipRequests: {
                where: { status: 'PENDING' },
                select: { status: true }
            },
            artifacts: {
                include: {
                    reflection: true
                },
                orderBy: {
                    updatedAt: 'desc'
                }
            },
            team: true,
            UserNodeProgress: {
                include: {
                    node: true
                }
            }
        }
    }) as any;

    const pendingRequest = user?.sentMentorshipRequests?.[0];

    const artifacts = user?.artifacts || [];
    const artifactCount = artifacts.length;

    // Calculate total time saved from all reflections
    const totalTimeSaved = artifacts.reduce((acc: number, art: any) => acc + (art.reflection?.timeSavedMinutes || 0), 0);

    // Get current learning context
    // We look for the first IN_PROGRESS node or the latest AVAILABLE one
    const currentProgress = user?.UserNodeProgress.find((p: any) => p.status === 'IN_PROGRESS')
        || user?.UserNodeProgress.filter((p: any) => p.status === 'COMPLETED').sort((a: any, b: any) => b.node.order - a.node.order)[0]
        || user?.UserNodeProgress.find((p: any) => p.status === 'AVAILABLE');

    const currentStageName = currentProgress?.node.title || "The Foundation";
    const currentWeekRange = currentProgress?.node.weekRange || "Week 1";

    // Calculate completion (simplified for MVP: completed nodes / total nodes)
    const allNodes = await prisma.courseNode.findMany({
        orderBy: { order: 'asc' }
    });
    const totalNodesCount = allNodes.length;
    const completedNodesCount = user?.UserNodeProgress.filter((p: any) => p.status === 'COMPLETED').length || 0;
    const completionPercentage = totalNodesCount > 0 ? Math.round((completedNodesCount / totalNodesCount) * 100) : 0;

    return (
        <main className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Mentor Selection Overlay */}
            {!user?.mentorId && (
                <MentorSelectionModal existingRequestStatus={pendingRequest?.status} />
            )}
            {/* Identity & Context Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary/80 font-bold uppercase tracking-[0.2em] text-[10px]">
                        <Activity className="w-3 h-3" />
                        System Active — {currentWeekRange}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                        {session.user.name?.split(' ')[0]}'s <span className="text-primary italic">Mission Control</span>
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg">
                        Context: <span className="text-white">{currentStageName}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Suspense fallback={<div className="w-80 h-12 bg-white/5 animate-pulse rounded-2xl" />}>
                        <DashboardSearch />
                    </Suspense>
                    <Link href="/dashboard/artifacts?action=new">
                        <button className="bg-primary text-black px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest glow-primary hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-2xl shadow-primary/20">
                            Build <Zap className="w-4 h-4 fill-current" />
                        </button>
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* AI Mentor Assistant - Left Column (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card rounded-[2.5rem] p-8 relative overflow-hidden group min-h-[420px] border border-white/5 flex flex-col">
                        <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                            <Sparkles className="w-12 h-12 text-primary" />
                        </div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-2 mb-8 bg-primary/10 self-start px-4 py-1.5 rounded-full border border-primary/20">
                                <Sparkles className="w-3.5 h-3.5 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">AI Mentor Assistant</span>
                            </div>

                            <div className="flex-grow flex items-center justify-center relative my-4">
                                {/* Visual Centerpiece */}
                                <div className="w-40 h-40 rounded-full orb-animation relative z-20" />
                                <div className="absolute w-48 h-48 rounded-full border border-primary/20 animate-pulse-slow" />
                                <div className="absolute w-64 h-64 rounded-full border border-white/5 animate-spin-slow duration-[15s]" />
                                <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
                            </div>

                            <div className="mt-auto space-y-4">
                                <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center gap-4">
                                    {user?.mentor ? (
                                        <>
                                            <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden">
                                                {user.mentor.image ? (
                                                    <img src={user.mentor.image} alt={user.mentor.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-primary font-bold text-lg">
                                                        {user.mentor.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Assigned Mentor</p>
                                                <p className="text-sm font-bold text-white">{user.mentor.name}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-sm text-white/90 leading-relaxed font-medium">
                                            "You've been making solid progress in <span className="text-primary font-bold">{currentStageName}</span>. Focus on validating your last artifact to unlock the next level of efficiency."
                                        </p>
                                    )}
                                </div>
                                <Link href="/dashboard/mentor" className="w-full">
                                    <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 group">
                                        Ask Mentor Assistant
                                        <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Quick Team Status (Integration) */}
                    {user?.team && (
                        <Link href={`/dashboard/team/${user.team.id}`}>
                            <div className="glass-card rounded-[2rem] p-6 border border-white/5 flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden group-hover:bg-primary/10 transition-colors">
                                        <Box className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Team</p>
                                        <p className="font-bold text-white">{user.team.name}</p>
                                    </div>
                                </div>
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            </div>
                        </Link>
                    )}
                </div>

                {/* Main Content Area - Right Column (8 cols) */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Top Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Current Focus */}
                        <div className="md:col-span-2 glass-card rounded-[2rem] p-8 border border-white/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8">
                                <Trophy className="w-16 h-16 text-primary/5 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Current Focus</p>
                                </div>
                                <h3 className="text-2xl font-black tracking-tight text-white mb-2">
                                    {artifacts[0]?.status === 'DRAFT' ? `Finalize: ${artifacts[0].title}` : `Initialize ${currentStageName} Artifact`}
                                </h3>
                                <p className="text-muted-foreground text-sm max-w-md mb-6">
                                    This is your primary path to growth. Complete this action to advance your trajectory.
                                </p>
                                <Link href={artifacts[0]?.status === 'DRAFT' ? `/dashboard/artifacts?id=${artifacts[0].id}` : `/dashboard/artifacts?action=new`}>
                                    <button className="bg-white text-black px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary transition-colors">
                                        Go to focus
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Completion / Progress Circular Indicator */}
                        <div className="glass-card rounded-[2rem] p-8 border border-white/5 flex flex-col items-center justify-center text-center">
                            <div className="relative w-24 h-24 mb-4">
                                <svg className="w-full h-full -rotate-90">
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="40"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        className="text-white/5"
                                    />
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="40"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={251.2}
                                        strokeDashoffset={251.2 - (251.2 * completionPercentage) / 100}
                                        className="text-primary transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xl font-black">{completionPercentage}%</span>
                                </div>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Completion</p>
                        </div>
                    </div>

                    {/* Stats Grids */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Total Artifacts */}
                        <div className="glass-panel rounded-[2rem] p-8 border border-white/5 flex flex-col gap-6 hover:border-white/10 transition-colors">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
                                <Layers className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-4xl font-black tracking-tighter text-white mb-1">{artifactCount}</p>
                                <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Total Artifacts Created</h3>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-primary/40 w-2/3" />
                            </div>
                        </div>

                        {/* Efficiency Score */}
                        <div className="glass-panel rounded-[2rem] p-8 border border-white/5 flex flex-col gap-6 hover:border-white/10 transition-colors">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
                                <Clock className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-4xl font-black tracking-tighter text-white mb-1">
                                    {totalTimeSaved}<span className="text-xl ml-1 text-muted-foreground">min</span>
                                </p>
                                <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Estimated Efficiency Gain</h3>
                            </div>
                            <div className="flex items-center gap-1 text-primary text-[10px] font-black">
                                <Activity className="w-3 h-3" />
                                GROWING TREND
                            </div>
                        </div>
                    </div>

                    {/* Growth Trajectory Visual */}
                    <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-xl font-black tracking-tight text-white">Growth Trajectory</h2>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Your Personal Learning Path</p>
                            </div>
                            <div className="px-4 py-1.5 bg-white/5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest">
                                {currentWeekRange}
                            </div>
                        </div>

                        {/* Visual Path Path */}
                        <div className="relative h-20 flex items-center justify-between px-4">
                            <div className="absolute top-1/2 left-4 right-4 h-px bg-white/10 -translate-y-1/2 z-0" />
                            {allNodes.map((node) => {
                                const progress = user?.UserNodeProgress.find((p: any) => p.nodeId === node.id);
                                const isActive = node.id === currentProgress?.node.id;
                                const isCompleted = progress?.status === 'COMPLETED';

                                return (
                                    <Link
                                        key={node.id}
                                        href={`/dashboard/courses/${node.id}`}
                                        className="relative z-10 flex flex-col items-center group/node"
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-2xl border flex items-center justify-center transition-all duration-500",
                                            isActive ? "bg-primary border-primary glow-primary text-black scale-110" :
                                                isCompleted ? "bg-white/10 border-white/20 text-white hover:border-primary/50" :
                                                    "bg-black border-white/5 text-white/20"
                                        )}>
                                            {isCompleted ? <Zap className="w-4 h-4 fill-current" /> : <span className="text-xs font-bold">{node.order}</span>}
                                        </div>
                                        {isActive && (
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-primary text-[8px] font-black rounded uppercase">
                                                Active
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/5 flex justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Status</p>
                                <p className="text-sm font-black text-white">{currentStageName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Target Outcome</p>
                                <p className="text-sm font-black text-primary">Foundational Mastery</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Artifacts */}
                    <div className="glass-panel rounded-[2.5rem] p-8 border border-white/5">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-xl font-black tracking-tight text-white">Recent Artifacts</h2>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Proof of Work</p>
                            </div>
                            <Link href="/dashboard/artifacts">
                                <button className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                                    View Your Arsenal <ArrowUpRight className="w-3 h-3" />
                                </button>
                            </Link>
                        </div>

                        {artifactCount === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-[2rem] bg-white/[0.01]">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                    <Box className="w-8 h-8 text-white/20" />
                                </div>
                                <p className="text-muted-foreground font-bold mb-6 text-sm">Your tool arsenal is currently empty.</p>
                                <Link href="/dashboard/artifacts?action=new">
                                    <button className="bg-primary text-black px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs glow-primary hover:scale-105 transition-all flex items-center gap-2">
                                        Initialize First Artifact <Zap className="w-4 h-4 fill-current" />
                                    </button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {artifacts.slice(0, 2).map((art: any) => (
                                    <div key={art.id} className="glass-card p-6 rounded-[2rem] border border-white/5 group hover:border-primary/30 transition-all flex flex-col">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
                                                <Layers className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                                            </div>
                                            <span className={cn(
                                                "text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                                                art.status === 'VALIDATED' ? "bg-green-500/20 text-green-500 border-green-500/30" :
                                                    art.status === 'NEEDS_IMPROVEMENT' ? "bg-amber-500/20 text-amber-500 border-amber-500/30" :
                                                        "bg-primary/20 text-primary border-primary/30"
                                            )}>
                                                {art.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <h4 className="font-black text-xl mb-2 text-white group-hover:text-primary transition-colors leading-tight">{art.title}</h4>
                                        <p className="text-xs text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
                                            {art.problemDescription}
                                        </p>
                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5 font-black uppercase tracking-widest text-[8px]">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                {new Date(art.updatedAt).toLocaleDateString()}
                                            </div>
                                            <Link href={`/dashboard/artifacts?id=${art.id}`} className="text-primary group-hover:translate-x-1 transition-transform cursor-pointer">
                                                Open module
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
