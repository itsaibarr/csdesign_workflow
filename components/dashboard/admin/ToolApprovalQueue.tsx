'use client'

import { useState } from 'react'
import { approveTool, rejectTool } from '@/app/actions/admin'
import { Check, X, Loader2, Sparkles, ExternalLink, Globe, RefreshCw, Cpu, Terminal, Workflow, Shield, Search, Wrench, Star, Banknote, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tool } from '@prisma/client'

type ToolWithCount = Tool & {
    _count?: {
        artifactTools: number
    }
}

export function ToolApprovalQueue({ tools }: { tools: ToolWithCount[] }) {
    const [processing, setProcessing] = useState<string | null>(null)
    const [discovering, setDiscovering] = useState(false)

    const handleRefresh = async () => {
        setDiscovering(true)
        try {
            const res = await fetch('/api/admin/discover-tools', { method: 'POST' })
            const data = await res.json()

            if (data.success) {
                alert('✅ Tool discovery started! New tools will appear in a few moments.')
                setTimeout(() => window.location.reload(), 3000)
            } else {
                alert('❌ Failed to start discovery: ' + (data.error || 'Unknown error'))
            }
        } catch (e) {
            console.error(e)
            alert('❌ Network error')
        } finally {
            setDiscovering(false)
        }
    }

    const handleApprove = async (id: string) => {
        setProcessing(id)
        try {
            await approveTool(id)
        } catch (e) {
            console.error(e)
        }
        setProcessing(null)
    }

    const handleReject = async (id: string) => {
        setProcessing(id)
        try {
            await rejectTool(id)
        } catch (e) {
            console.error(e)
        }
        setProcessing(null)
    }

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

    return (
        <div className="space-y-6">
            {/* Header with Refresh Button */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-slate-400">
                    <span className="font-bold text-white">{tools.length}</span> tools pending review
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={discovering}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
                        discovering
                            ? "bg-white/5 text-slate-500 cursor-not-allowed"
                            : "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40"
                    )}
                >
                    <RefreshCw className={cn("w-4 h-4", discovering && "animate-spin")} />
                    {discovering ? 'Discovering...' : 'Discover New Tools'}
                </button>
            </div>

            {/* Tools Grid - Wider cards for admin */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {tools.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center p-8 bg-white/[0.02] border border-white/5 rounded-[3rem]">
                        <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center text-green-500 mb-6">
                            <Check className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2">Queue Cleared</h3>
                        <p className="text-slate-500 max-w-md">No pending tools found. Discovery algorithms are running in background.</p>
                    </div>
                )}

                {tools.map(tool => (
                    <div key={tool.id} className="glass-panel p-6 rounded-[2.5rem] border-white/5 group hover:border-primary/30 transition-all relative overflow-hidden flex flex-col">

                        {/* Background Accent */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />

                        {/* Top Bar: Status and Pricing */}
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className={cn(
                                "px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider",
                                tool.usageStatus === 'AI_DISCOVERED'
                                    ? "bg-blue-500/20 text-blue-300 border-blue-500/20"
                                    : "bg-purple-500/20 text-purple-300 border-purple-500/20"
                            )}>
                                {tool.usageStatus.replace('_', ' ')}
                            </div>
                            {tool.pricing && (
                                <div className={cn(
                                    "px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5",
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
                                <div className="space-y-0.5 flex-grow">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-black text-xl tracking-tight group-hover:text-primary transition-colors">{tool.name}</h3>
                                    </div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{tool.category}</p>
                                    {tool.url && (
                                        <a
                                            href={tool.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-primary hover:underline flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity"
                                        >
                                            <Globe className="w-3 h-3" />
                                            {tool.url}
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm text-muted-foreground/80 leading-relaxed">
                                    {tool.shortDescription}
                                </p>

                                {tool.problemSolved && (
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Solves:</p>
                                        <p className="text-xs text-white/80 font-medium italic">"{tool.problemSolved}"</p>
                                    </div>
                                )}

                                {/* Full Description if available */}
                                {tool.fullDescription && (
                                    <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-2">Full Details:</p>
                                        <p className="text-sm text-white/70 leading-relaxed">{tool.fullDescription}</p>
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

                            {/* Usage Stats */}
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-fit">
                                <Activity className="w-3 h-3 text-primary" />
                                {tool._count?.artifactTools || 0} Usages
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-6 mt-4 border-t border-white/5 flex gap-3 relative z-10">
                            <button
                                onClick={() => handleReject(tool.id)}
                                disabled={processing === tool.id}
                                className="flex-1 px-4 py-3 bg-red-500/5 hover:bg-red-500/10 text-red-500/70 hover:text-red-400 border border-transparent hover:border-red-500/20 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                            >
                                {processing === tool.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                Reject
                            </button>
                            <button
                                onClick={() => handleApprove(tool.id)}
                                disabled={processing === tool.id}
                                className="flex-1 px-4 py-3 bg-primary/10 hover:bg-primary/20 text-black border border-primary/20 hover:border-primary/40 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_-5px_var(--primary)]"
                            >
                                {processing === tool.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Approve
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
