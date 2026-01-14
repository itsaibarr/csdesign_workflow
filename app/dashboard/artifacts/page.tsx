import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Box, Plus, Search, Filter, Clock, ArrowUpRight, Zap, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default async function ArtifactsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect('/login');
    }

    const artifacts = await prisma.artifact.findMany({
        where: { userId: session.user.id },
        include: {
            reflection: true,
            team: true,
            hobby: true,
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const stats = {
        total: artifacts.length,
        reviewed: artifacts.filter(a => a.status === 'REVIEWED').length,
        drafts: artifacts.filter(a => a.status === 'DRAFT').length,
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-1 text-center md:text-left">
                    <h1 className="text-4xl font-extrabold tracking-tighter text-gradient">Artifact Repository</h1>
                    <p className="text-muted-foreground font-medium">Manage and preserve your engineering outcomes.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-4 bg-primary text-black rounded-2xl font-bold uppercase tracking-wider glow-primary hover:scale-[1.02] active:scale-[0.98] transition-all">
                    <Plus className="w-5 h-5" />
                    New Artifact
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: 'Total Units', value: stats.total, icon: Box, color: 'text-primary' },
                    { label: 'Validated', value: stats.reviewed, icon: Sparkles, color: 'text-blue-400' },
                    { label: 'In Progress', value: stats.drafts, icon: Clock, color: 'text-amber-400' },
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-6 rounded-[2rem] border-white/5 flex items-center justify-between group">
                        <div>
                            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-1">{stat.label}</div>
                            <div className="text-2xl font-black tracking-tight">{stat.value}</div>
                        </div>
                        <div className={cn("w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center transition-all group-hover:bg-white/10", stat.color)}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search artifacts by title or content..."
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/30 transition-all text-white placeholder:text-muted-foreground/50"
                    />
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                        <Filter className="w-4 h-4" />
                        Type
                    </button>
                    <button className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                        Status
                    </button>
                </div>
            </div>

            {/* Artifacts List */}
            <div className="glass-panel rounded-[2.5rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-bottom border-white/5 bg-white/[0.02]">
                                <th className="px-8 py-5 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Artifact Details</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Category</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Status</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Efficiency</th>
                                <th className="px-8 py-5 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {artifacts.length > 0 ? (
                                artifacts.map((artifact) => (
                                    <tr key={artifact.id} className="group hover:bg-white/[0.02] transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all flex-shrink-0">
                                                    <Box className="w-5 h-5" />
                                                </div>
                                                <div className="space-y-1 max-w-xs md:max-w-md">
                                                    <div className="font-bold tracking-wide flex items-center gap-2">
                                                        {artifact.title}
                                                        <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground truncate opacity-60">
                                                        {artifact.content || 'No description provided.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                    {artifact.type}
                                                </span>
                                                {artifact.team && <span className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">Team Node</span>}
                                                {artifact.hobby && <span className="text-[10px] text-rose-400 font-bold uppercase tracking-tighter">Personal</span>}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em]",
                                                artifact.status === 'REVIEWED' ? "text-emerald-400" :
                                                    artifact.status === 'SUBMITTED' ? "text-blue-400" : "text-amber-400"
                                            )}>
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full animate-pulse",
                                                    artifact.status === 'REVIEWED' ? "bg-emerald-400" :
                                                        artifact.status === 'SUBMITTED' ? "bg-blue-400" : "bg-amber-400"
                                                )} />
                                                {artifact.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {artifact.reflection ? (
                                                <div className="flex items-center gap-1 text-primary">
                                                    <Zap className="w-3.5 h-3.5 fill-primary" />
                                                    <span className="text-xs font-black">+{artifact.reflection.timeSaved}m</span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground/30 font-bold uppercase">No data</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all">
                                                    <Zap className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </button>
                                                <button className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all">
                                                    <Search className="w-4 h-4 text-muted-foreground" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center pointer-events-none">
                                        <div className="space-y-4">
                                            <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto">
                                                <Box className="w-10 h-10 text-white/10" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xl font-bold tracking-tight">Empty Repository</p>
                                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                                    You haven't initialized any artifacts yet. Start by creating your first knowledge block.
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer Placeholder */}
                <div className="p-6 bg-white/[0.01] border-top border-white/5 flex justify-between items-center">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Showing node {artifacts.length} of {artifacts.length}</p>
                    <div className="flex gap-2">
                        <button disabled className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest opacity-50">Prev</button>
                        <button disabled className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest opacity-50">Next</button>
                    </div>
                </div>
            </div>

            {/* Hint Box */}
            <div className="p-6 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 flex gap-4 items-start">
                <AlertCircle className="w-6 h-6 text-indigo-400 flex-shrink-0" />
                <div className="space-y-1">
                    <p className="text-sm font-bold text-indigo-100">Artifact Optimization Tip</p>
                    <p className="text-xs text-indigo-300/70 leading-relaxed">
                        Artifacts with linked reflections contribute 40% more to your growth metrics.
                        Try documenting the tools and time saved for your latest design refactor.
                    </p>
                </div>
            </div>
        </div>
    );
}
