"use client";

import { ToolCategory, ToolUsageStatus } from '@prisma/client';
import { ExternalLink, Activity, Star, Cpu, Globe, Terminal, Shield, Workflow, Info, Wrench, Search, Banknote } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export type ToolCardProps = {
    tool: {
        id: string;
        name: string;
        shortDescription: string;
        category: any;
        usageStatus: any;
        pricing?: any; // Add pricing
        problemSolved?: string | null; // Add problem Solved
        badges: string[];
        url: string | null;
        _count: {
            artifactTools: number;
        };
    };
    actions?: React.ReactNode; // Optional actions for Admin view
    aiReason?: string; // Reason why this tool was recommended by AI
};

export default function ToolCard({ tool, actions, aiReason }: ToolCardProps) {
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'LLM': return <Cpu className="w-6 h-6" />;
            case 'IDE': return <Terminal className="w-6 h-6" />;
            case 'AUTOMATION': return <Workflow className="w-6 h-6" />;
            case 'DESIGN': return <Globe className="w-6 h-6" />;
            case 'SECURITY': return <Shield className="w-6 h-6" />;
            case 'RESEARCH': return <Search className="w-6 h-6" />;
            default: return <Wrench className="w-6 h-6" />;
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'COURSE_OFFICIAL': return 'bg-primary/10 border-primary/20 text-primary';
            case 'COMMUNITY_APPROVED': return 'bg-amber-400/10 border-amber-400/20 text-amber-400';
            case 'PENDING_REVIEW': return 'bg-purple-400/10 border-purple-400/20 text-purple-400';
            case 'AI_DISCOVERED': return 'bg-cyan-400/10 border-cyan-400/20 text-cyan-400';
            case 'REJECTED': return 'bg-red-400/10 border-red-400/20 text-red-400';
            default: return 'bg-white/5 border-white/10 text-white';
        }
    };

    return (
        <div className="glass-panel p-6 rounded-[2.5rem] border-white/5 group hover:border-primary/30 transition-all hover:scale-[1.02] relative overflow-hidden flex flex-col h-full">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />

            {/* Top Bar: Badges and Usage */}
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex flex-wrap gap-2">
                    <div className={cn(
                        "px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider",
                        getStatusStyles(tool.usageStatus)
                    )}>
                        {tool.usageStatus?.replace('_', ' ') || 'Unknown'}
                    </div>
                </div>
                {tool.pricing && (
                    <div className={cn("px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5",
                        tool.pricing === 'FREE' ? "bg-green-500/10 border-green-500/20 text-green-400" :
                            tool.pricing === 'PAID' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                                "bg-blue-500/10 border-blue-500/20 text-blue-400"
                    )}>
                        <Banknote className="w-3 h-3" />
                        {tool.pricing}
                    </div>
                )}
            </div>

            {/* Tool Info */}
            <div className="space-y-4 flex-grow relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 transition-all shrink-0">
                        <div className="text-primary">
                            {getCategoryIcon(tool.category)}
                        </div>
                    </div>
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <h3 className="font-black text-xl tracking-tight group-hover:text-primary transition-colors line-clamp-1">{tool.name}</h3>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{tool.category}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground/80 leading-relaxed line-clamp-3">
                        {tool.shortDescription}
                    </p>

                    {tool.problemSolved && (
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Solves:</p>
                            <p className="text-xs text-white/80 font-medium italic line-clamp-2">"{tool.problemSolved}"</p>
                        </div>
                    )}
                </div>

                {/* Additional Badges */}
                {tool.badges && tool.badges.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                        {tool.badges.map((badge, i) => (
                            <span key={i} className="text-[9px] px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-muted-foreground font-medium flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                {badge}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            {/* AI Reasoning Banner */}
            {aiReason && (
                <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-primary/20 to-transparent border border-primary/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                    <div className="relative z-10 flex gap-2 items-start">
                        <Cpu className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-0.5">AI Check</p>
                            <p className="text-xs text-white/90 font-medium leading-relaxed">{aiReason}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="pt-6 mt-auto relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                        <Activity className="w-3 h-3 text-primary" />
                        {tool._count?.artifactTools || 0} Usages
                    </div>

                    {tool.url && (
                        <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-primary/10 transition-all text-muted-foreground hover:text-primary"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    )}
                </div>

                {actions ? actions : (
                    <Link
                        href={`/dashboard/tools/${tool.id}`}
                        className="flex w-full items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold uppercase tracking-widest transition-all hover:text-primary group/link"
                    >
                        <Info className="w-4 h-4" />
                        View Details
                    </Link>
                )}
            </div>
        </div>
    );
}
