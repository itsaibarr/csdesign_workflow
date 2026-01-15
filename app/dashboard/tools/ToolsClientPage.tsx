"use client";

import { useState, useMemo } from 'react';
import { ToolCategory, ToolUsageStatus } from '@prisma/client';
import { Search, Filter, Cpu, Globe, Terminal, Ghost, Plus, ChevronDown, Sparkles, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import ToolCard from '@/components/tools/ToolCard';
import ToolSubmissionModal from '@/components/tools/ToolSubmissionModal';

type ToolWithUsageCount = {
    id: string;
    name: string;
    shortDescription: string;
    category: any;
    usageStatus: any;
    pricing?: any;
    problemSolved?: string | null;
    badges: string[];
    url: string | null;
    _count: {
        artifactTools: number;
    };
};

type Props = {
    initialTools: ToolWithUsageCount[];
    categories: any[];
};

type SmartMatch = {
    toolId: string;
    reason: string;
};

export default function ToolsClientPage({ initialTools, categories }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'ALL'>('ALL');
    const [selectedStatus, setSelectedStatus] = useState<ToolUsageStatus | 'ALL'>('ALL');
    const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);

    // Smart Search State
    const [isSmartSearching, setIsSmartSearching] = useState(false);
    const [smartResults, setSmartResults] = useState<SmartMatch[]>([]);
    const [isSmartActive, setIsSmartActive] = useState(false);

    const handleSmartSearch = async () => {
        if (!searchQuery.trim() || isSmartSearching) return;

        setIsSmartSearching(true);
        setIsSmartActive(true);

        try {
            const res = await fetch('/api/tools/smart-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchQuery }),
            });
            const data = await res.json();

            if (data.success) {
                setSmartResults(data.results || []);
            }
        } catch (error) {
            console.error('Smart search failed', error);
            setIsSmartActive(false);
        } finally {
            setIsSmartSearching(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            // Trigger smart search if query is question-like or long
            if (searchQuery.length > 10 || searchQuery.includes('?')) {
                handleSmartSearch();
            }
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('ALL');
        setSelectedStatus('ALL');
        setSmartResults([]);
        setIsSmartActive(false);
    };

    const filteredTools = useMemo(() => {
        // If Smart Search is active and has results, prioritize those
        if (isSmartActive && smartResults.length > 0) {
            const matches: any[] = [];
            smartResults.forEach(match => {
                const tool = initialTools.find(t => t.id === match.toolId);
                if (tool) {
                    matches.push({ ...tool, aiReason: match.reason });
                }
            });
            return matches;
        }

        // Fallback to standard filtering
        return initialTools.filter(tool => {
            const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tool.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'ALL' || tool.category === selectedCategory;
            const matchesStatus = selectedStatus === 'ALL' || tool.usageStatus === selectedStatus;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [initialTools, searchQuery, selectedCategory, selectedStatus, isSmartActive, smartResults]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-1 text-center md:text-left">
                    <h1 className="text-4xl font-extrabold tracking-tighter text-gradient">Resources Library</h1>
                    <p className="text-muted-foreground font-medium">Curated AI tools validated by the CSC ecosystem.</p>
                </div>
                <button
                    onClick={() => setIsSubmissionModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-2xl font-bold uppercase tracking-wider transition-all group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    Suggest Tool
                </button>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
                <div className="relative flex-grow group max-w-2xl">
                    <div className={cn("absolute left-4 top-1/2 -translate-y-1/2 transition-all p-2 rounded-xl", isSmartActive ? "bg-primary/20 text-primary" : "text-muted-foreground")}>
                        {isSmartSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5 group-focus-within:text-primary" />}
                    </div>

                    <input
                        type="text"
                        placeholder="Ask a question (e.g., 'Best AI for python coding?')"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            // If user clears input, reset smart mode
                            if (e.target.value === '') {
                                setIsSmartActive(false);
                                setSmartResults([]);
                            }
                        }}
                        onKeyDown={handleKeyDown}
                        className={cn(
                            "w-full pl-16 py-4 bg-white/5 border rounded-2xl focus:outline-none focus:border-primary/30 transition-all text-white placeholder:text-muted-foreground/80 font-medium",
                            (searchQuery.length > 5 && !isSmartSearching) ? "pr-32" : "pr-4",
                            isSmartActive ? "border-primary/50 shadow-[0_0_20px_rgba(var(--primary),0.1)]" : "border-white/10"
                        )}
                    />

                    {/* Smart Search Action Button inside Input */}
                    {(searchQuery.length > 5 && !isSmartSearching) && (
                        <button
                            onClick={handleSmartSearch}
                            className={cn(
                                "absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                                isSmartActive
                                    ? "bg-white/10 text-white hover:bg-white/20"
                                    : "bg-primary text-black hover:bg-primary/90 glow-primary"
                            )}
                        >
                            {isSmartActive ? 'Refine' : (
                                <>
                                    <Sparkles className="w-3 h-3" />
                                    Ask AI
                                </>
                            )}
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                    {/* Category Filter */}
                    <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                        <button
                            onClick={() => setSelectedCategory('ALL')}
                            className={cn(
                                "whitespace-nowrap px-6 py-4 rounded-2xl flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-all",
                                selectedCategory === 'ALL'
                                    ? "bg-primary text-black glow-primary"
                                    : "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10"
                            )}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={cn(
                                    "whitespace-nowrap px-6 py-4 rounded-2xl flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-all",
                                    selectedCategory === cat
                                        ? "bg-primary text-black glow-primary"
                                        : "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Status Toggle */}
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                        <button
                            onClick={() => setSelectedStatus('ALL')}
                            className={cn(
                                "px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                selectedStatus === 'ALL' ? "bg-white/10 text-white" : "text-muted-foreground"
                            )}
                        >
                            All Status
                        </button>
                        <button
                            onClick={() => setSelectedStatus('COURSE_OFFICIAL')}
                            className={cn(
                                "px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                selectedStatus === 'COURSE_OFFICIAL' ? "bg-primary/20 text-primary" : "text-muted-foreground"
                            )}
                        >
                            Official
                        </button>
                        <button
                            onClick={() => setSelectedStatus('COMMUNITY_APPROVED')}
                            className={cn(
                                "px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                selectedStatus === 'COMMUNITY_APPROVED' ? "bg-amber-400/20 text-amber-400" : "text-muted-foreground"
                            )}
                        >
                            Community
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                        Showing <span className="text-white">{filteredTools.length}</span> tools
                    </p>
                    {isSmartActive && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-[10px] font-bold uppercase tracking-wider text-primary">
                            <Sparkles className="w-3 h-3" />
                            AI Recommended
                        </div>
                    )}
                </div>
                {(searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || isSmartActive) && (
                    <button
                        onClick={clearFilters}
                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
                    >
                        <X className="w-3 h-3" />
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTools.length > 0 ? (
                    filteredTools.map((tool) => (
                        <ToolCard
                            key={tool.id}
                            tool={tool}
                            aiReason={(tool as any).aiReason}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-32 text-center glass-panel rounded-[3rem] border-white/5 border-dashed">
                        {isSmartSearching ? (
                            <><Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
                                <h3 className="text-xl font-bold uppercase tracking-widest text-white">Asking the Oracle...</h3></>
                        ) : (
                            <><Ghost className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30 animate-pulse" />
                                <h3 className="text-xl font-bold uppercase tracking-widest text-muted-foreground/50">No tools found matching filters</h3>
                                <p className="text-sm text-muted-foreground/30 mt-2 font-medium">Try adjusting your search or category selection.</p></>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Info Banner */}
            <div className="glass-panel p-12 rounded-[3.5rem] border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 group-hover:bg-primary/10 transition-colors duration-1000" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="space-y-4 text-center md:text-left flex-grow">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
                            Community Driven
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter leading-none">Powering your workflow?</h2>
                        <p className="text-muted-foreground max-w-xl text-lg font-medium leading-relaxed">
                            If you've discovered a tool that significantly improves your productivity or solved a complex engineering task, share it with the CSC community.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsSubmissionModalOpen(true)}
                        className="shrink-0 px-12 py-6 bg-primary text-black rounded-[2rem] font-black uppercase tracking-widest glow-primary hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center gap-3"
                    >
                        Deploy New Tool
                        <Plus className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Submission Modal */}
            <ToolSubmissionModal
                isOpen={isSubmissionModalOpen}
                onClose={() => setIsSubmissionModalOpen(false)}
            />
        </div>
    );
}
