import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import {
    ExternalLink, Activity, Star, Cpu, Globe, Terminal,
    Shield, Workflow, Info, Calendar, User, ArrowLeft,
    CheckCircle2, AlertCircle, Ghost
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ToolCategory, ToolUsageStatus } from '@prisma/client';

// Type safety fallbacks
type ToolDetailsWithRelations = any;

export default async function ToolDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect('/login');
    }

    const toolRaw = await prisma.tool.findUnique({
        where: { id },
        include: {
            submittedBy: {
                select: { name: true, image: true }
            },
            artifactTools: {
                include: {
                    artifact: {
                        include: {
                            user: {
                                select: { name: true, image: true }
                            },
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 6
            },
            _count: {
                select: { artifactTools: true }
            }
        }
    });

    if (!toolRaw) {
        notFound();
    }

    const tool = toolRaw as any;

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'LLM': return <Cpu className="w-8 h-8" />;
            case 'IDE': return <Terminal className="w-8 h-8" />;
            case 'AUTOMATION': return <Workflow className="w-8 h-8" />;
            case 'DESIGN': return <Globe className="w-8 h-8" />;
            case 'SECURITY': return <Shield className="w-8 h-8" />;
            default: return <Info className="w-8 h-8" />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Navigation & Header */}
            <div className="space-y-6">
                <Link
                    href="/dashboard/tools"
                    className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Library
                </Link>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-primary glow-primary-sm">
                                {getCategoryIcon(tool.category)}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-5xl font-black tracking-tighter">{tool.name}</h1>
                                    {tool.usageStatus === 'COURSE_OFFICIAL' && (
                                        <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5 h-6">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Official
                                        </div>
                                    )}
                                </div>
                                <p className="text-xl text-muted-foreground font-medium">{tool.category} Resource</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {tool.url && (
                            <a
                                href={tool.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-4 bg-primary text-black rounded-2xl font-black uppercase tracking-widest glow-primary hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center gap-3"
                            >
                                Visit Tool
                                <ExternalLink className="w-5 h-5" />
                            </a>
                        )}
                        <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-white transition-all">
                            Save to Workspace
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Description & Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Description Card */}
                    <div className="glass-panel p-10 rounded-[3rem] border-white/5 space-y-6">
                        <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                            <Info className="w-6 h-6 text-primary" />
                            Tool Overview
                        </h2>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {tool.fullDescription || tool.shortDescription}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-4">
                            {tool.badges.map((badge, i) => (
                                <div key={i} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    {badge}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Community Use Cases */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                <Globe className="w-6 h-6 text-primary" />
                                Community Implementation
                            </h2>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                {tool._count.artifactTools} Total Artifacts
                            </p>
                        </div>

                        {tool.artifactTools.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tool.artifactTools.map((at) => (
                                    <Link
                                        key={at.id}
                                        href={`/dashboard/artifacts?id=${at.artifactId}`}
                                        className="glass-panel p-6 rounded-3xl border-white/5 hover:border-primary/30 transition-all group"
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-zinc-800 border border-white/10 overflow-hidden">
                                                        {at.artifact.user.image ? (
                                                            <img src={at.artifact.user.image} alt={at.artifact.user.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">
                                                                {at.artifact.user.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                        {at.artifact.user.name.split(' ')[0]}
                                                    </span>
                                                </div>
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
                                                    {new Date(at.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-white text-lg group-hover:text-primary transition-colors leading-tight">
                                                {at.artifact.title}
                                            </h4>
                                            {at.usageContext && (
                                                <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-3">
                                                    "{at.usageContext}"
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="glass-panel p-12 rounded-[2rem] border-white/5 border-dashed text-center flex flex-col items-center justify-center gap-4 opacity-50">
                                <Ghost className="w-12 h-12 text-muted-foreground/30" />
                                <div className="space-y-1">
                                    <h3 className="font-bold uppercase tracking-widest text-muted-foreground">No implementations yet</h3>
                                    <p className="text-xs font-medium text-muted-foreground/50">Be the first to create an artifact using this tool.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Sidebar info */}
                <div className="space-y-8">
                    {/* Usage Stats Card */}
                    <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                        <h3 className="text-lg font-black uppercase tracking-widest border-b border-white/5 pb-4">Usage Analytics</h3>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Usages</p>
                                        <p className="text-2xl font-black tracking-tighter">{tool._count.artifactTools}</p>
                                    </div>
                                </div>
                                <div className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                                    +12% Trending
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                                    <span>Adoption Rate</span>
                                    <span>78%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)] w-[78%]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submitter Info */}
                    {tool.submittedBy && (
                        <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Maintained By</h3>
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-white/10 overflow-hidden shrink-0">
                                    {tool.submittedBy.image ? (
                                        <img src={tool.submittedBy.image} alt={tool.submittedBy.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-lg">
                                            {tool.submittedBy.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-0.5 overflow-hidden">
                                    <p className="font-bold text-sm truncate">{tool.submittedBy.name}</p>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Community Contributor</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* How to use banner */}
                    <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-8 rounded-[2.5rem] border border-primary/20 space-y-4">
                        <div className="p-3 bg-primary text-black rounded-xl w-fit">
                            <Workflow className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-black tracking-tight leading-tight">Implement in your next artifact</h3>
                        <p className="text-sm text-muted-foreground font-medium ">
                            Include {tool.name} in your project to automatically track efficiency gains and generate technical reflections.
                        </p>
                        <Link
                            href={`/dashboard/artifacts?action=new&toolId=${tool.id}`}
                            className="block text-center w-full py-3 bg-primary text-black rounded-xl font-bold uppercase tracking-widest text-[10px] hover:scale-105 transition-all"
                        >
                            Build with {tool.name}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
