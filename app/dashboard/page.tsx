import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import { prisma } from '@/lib/prisma';
import { Layers, Trophy, Clock, Zap, ArrowUpRight, Sparkles, Activity, Search, Box } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.email) return null;

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            artifacts: true,
            team: true
        }
    });

    const artifactCount = user?.artifacts.length || 0;
    const timeSaved = 120;

    return (
        <main className="space-y-10 animate-in fade-in duration-700">
            {/* Top Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-5xl font-bold tracking-tight text-gradient mb-2">
                        Mission Control
                    </h1>
                    <p className="text-muted-foreground font-medium flex items-center gap-2">
                        System authenticated as <span className="text-primary font-bold">@{session.user.name?.toLowerCase().replace(' ', '_')}</span>
                    </p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-grow md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Find artifacts..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                    </div>
                    <button className="bg-primary text-black px-5 py-2.5 rounded-2xl font-bold text-sm glow-primary hover:scale-105 transition-transform flex items-center gap-2">
                        Build <Zap className="w-4 h-4 fill-current" />
                    </button>
                    <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.name}`} alt="avatar" />
                    </div>
                </div>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6">

                {/* AI Assistant Widget - Spans 4 columns */}
                <div className="md:col-span-12 lg:col-span-4 glass-card rounded-[2.5rem] p-8 relative overflow-hidden group min-h-[400px]">
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-8 bg-white/5 self-start px-4 py-1.5 rounded-full border border-white/10">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold uppercase tracking-widest">AI Mentor Assistant</span>
                        </div>

                        <div className="flex-grow flex items-center justify-center relative">
                            {/* The Orb */}
                            <div className="w-48 h-48 rounded-full orb-animation relative z-20" />
                            <div className="absolute w-56 h-56 rounded-full border border-primary/20 animate-pulse-slow" />
                            <div className="absolute w-64 h-64 rounded-full border border-white/5 animate-spin-slow duration-[10s]" />
                        </div>

                        <div className="mt-8 space-y-4">
                            <button className="w-full bg-primary text-black py-4 rounded-2xl font-black uppercase tracking-widest text-sm glow-primary hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                Ask Mentor <Zap className="w-4 h-4 fill-current" />
                            </button>
                            <div className="glass-panel p-4 rounded-2xl border border-white/5">
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    "Your current focus is **The Foundation**. I recommend completing the Mindset artifact before Friday."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats & Charts - Spans 8 columns */}
                <div className="md:col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Total Artifacts */}
                    <div className="glass-card rounded-[2rem] p-8 flex flex-col justify-between group">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
                                <Layers className="w-6 h-6 text-primary" />
                            </div>
                            <span className="text-xs font-bold text-primary flex items-center gap-1">
                                +12% <ArrowUpRight className="w-3 h-3" />
                            </span>
                        </div>
                        <div>
                            <p className="text-4xl font-bold tracking-tight mb-1">{artifactCount}</p>
                            <h3 className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Total Artifacts</h3>
                        </div>
                    </div>

                    {/* Time Saved */}
                    <div className="glass-card rounded-[2rem] p-8 flex flex-col justify-between group">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
                                <Clock className="w-6 h-6 text-primary" />
                            </div>
                            <span className="text-xs font-bold text-primary">GROWTH</span>
                        </div>
                        <div>
                            <p className="text-4xl font-bold tracking-tight mb-1">{timeSaved}<span className="text-xl">min</span></p>
                            <h3 className="text-muted-foreground font-medium uppercase tracking-widest text-xs">AI Efficiency Score</h3>
                        </div>
                    </div>

                    {/* Progress Chart Simulation */}
                    <div className="md:col-span-2 glass-panel rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden min-h-[250px] group">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-4 h-4 text-primary" />
                                Growth Trajectory
                            </h3>
                            <div className="flex gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <div className="w-2 h-2 rounded-full bg-white/20" />
                            </div>
                        </div>

                        {/* CSS Chart Simulation */}
                        <div className="flex items-end justify-between gap-2 h-24 mt-4">
                            {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                                <div
                                    key={i}
                                    style={{ height: `${h}%` }}
                                    className={cn(
                                        "flex-grow rounded-t-xl transition-all duration-500 group-hover:opacity-100",
                                        i === 6 ? "bg-primary glow-primary opacity-100" : "bg-white/10 opacity-40 hover:bg-white/30"
                                    )}
                                />
                            ))}
                        </div>

                        <div className="mt-8 flex justify-between border-t border-white/5 pt-4">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</p>
                                <p className="text-sm font-bold">The Foundation — Week 1</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Completion</p>
                                <p className="text-sm font-bold text-primary">68%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row - Recent Artifacts */}
                <div className="md:col-span-12 glass-panel rounded-[2.5rem] p-8 border border-white/5">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold tracking-tight flex items-center gap-3">
                            <Box className="w-5 h-5 text-primary" />
                            Recent Artifacts
                        </h2>
                        <button className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                            View Arsenal
                        </button>
                    </div>

                    {artifactCount === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-[2rem] bg-white/[0.02]">
                            <p className="text-muted-foreground font-medium mb-6">Your tool arsenal is currently empty.</p>
                            <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2">
                                Initialize Artifact <Zap className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="glass-card p-6 rounded-3xl border border-white/5 group hover:border-primary/30 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                                        <Zap className="w-5 h-5 text-primary" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/30">
                                        DRAFT
                                    </span>
                                </div>
                                <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">Cognitive Map #1</h4>
                                <p className="text-xs text-muted-foreground mb-4">The impact of AI on visual thinking.</p>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                    <Clock className="w-3 h-3" />
                                    Updated 2 hours ago
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
