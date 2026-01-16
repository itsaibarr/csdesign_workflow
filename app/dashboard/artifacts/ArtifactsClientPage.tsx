'use client';

import { useState, useEffect } from 'react';
import { Box, Plus, Search, Clock, ArrowUpRight, Sparkles, X, CheckCircle, PenTool, Trash2, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearchParams, useRouter } from 'next/navigation';
import { Artifact, ArtifactStatus, ArtifactType, Reflection } from '@prisma/client';
import { createArtifact, updateArtifactStatus, deleteArtifact, submitSolutionPlan } from '@/app/actions/artifacts';

type ArtifactWithRelations = Artifact & {
    reflection: Reflection | null;
    team: { name: string } | null;
    hobby: { name: string } | null;
    // Explicitly add potentially missing fields if client is stale
    solutionPlan?: string | null;
    problemDescription?: string;
    comments?: { id: string; content: string; createdAt: Date }[];
};

interface ArtifactsClientProps {
    initialArtifacts: ArtifactWithRelations[];
    userId: string;
    userRole: string; // 'STUDENT' | 'MENTOR'
    availableTools?: { id: string; name: string; category: any }[];
}


export default function ArtifactsClientPage({ initialArtifacts, userId, userRole, availableTools = [] }: ArtifactsClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [artifacts, setArtifacts] = useState(initialArtifacts);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [typeFilter, setTypeFilter] = useState<ArtifactType | 'ALL'>('ALL');
    const [statusFilter, setStatusFilter] = useState<ArtifactStatus | 'ALL'>('ALL');

    // Modals
    // Clear URL params when closing modals
    const cleanupUrl = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('action');
        params.delete('id');
        router.replace(`/dashboard/artifacts?${params.toString()}`);
    };

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(searchParams.get('action') === 'new');
    const handleOpenCreateModal = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('action', 'new');
        router.replace(`/dashboard/artifacts?${params.toString()}`);
        setIsCreateModalOpen(true);
    };
    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        cleanupUrl();
    };
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

    useEffect(() => {
        const q = searchParams.get('q');
        if (q) setSearchQuery(q);

        const action = searchParams.get('action');
        if (action === 'new') setIsCreateModalOpen(true);
    }, [searchParams]);

    // Selection state
    const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(searchParams.get('id'));
    const [planData, setPlanData] = useState('');
    const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
    const [toolSearch, setToolSearch] = useState('');

    // Feedback Modal State
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState<string>('');

    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            setSelectedArtifactId(id);
            // Optional: Scroll to the artifact in the table
            const element = document.getElementById(`artifact-${id}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [searchParams]);

    // Stats Calculation
    const stats = {
        total: artifacts.length,
        validated: artifacts.filter(a => (a.status as string) === 'VALIDATED').length,
        inProgress: artifacts.filter(a => (a.status as string) === 'IN_PROGRESS' || (a.status as string) === 'SUBMITTED').length,
    };

    // Filter Logic
    const filteredArtifacts = artifacts.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (a.problemDescription || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'ALL' || a.type === typeFilter;
        const matchesStatus = statusFilter === 'ALL' || (a.status as string) === (statusFilter as string);
        return matchesSearch && matchesType && matchesStatus;
    });

    const filteredTools = availableTools.filter(t =>
        t.name.toLowerCase().includes(toolSearch.toLowerCase())
    );

    const handleCreate = async (formData: FormData) => {
        const title = formData.get('title') as string;
        const problemDescription = formData.get('problemDescription') as string;
        const goal = formData.get('goal') as string;
        const type = formData.get('type') as ArtifactType;

        const result = await createArtifact({
            title,
            problemDescription,
            goal,
            type,
            toolIds: selectedToolIds
        });
        if (result.success) {
            setIsCreateModalOpen(false);
            setSelectedToolIds([]);
            window.location.reload();
        } else {
            alert(result.error);
        }
    };


    const handleStatusUpdate = async (id: string, newStatus: ArtifactStatus) => {
        const result = await updateArtifactStatus(id, newStatus);
        if (result.success) {
            window.location.reload();
        } else {
            alert(result.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this artifact?")) return;
        const result = await deleteArtifact(id);
        if (result.success) {
            window.location.reload();
        } else {
            alert(result.error);
        }
    };

    const handleViewFeedback = (comments: { id: string; content: string }[]) => {
        if (comments && comments.length > 0) {
            // Filter for the latest actionable feedback if needed, currently taking the most recent one
            setSelectedFeedback(comments[0].content);
            setIsFeedbackModalOpen(true);
        }
    };

    const openPlanModal = (artifact: ArtifactWithRelations) => {
        setSelectedArtifactId(artifact.id);
        setPlanData(artifact.solutionPlan || '');
        setIsPlanModalOpen(true);
    };

    const handlePlanSubmit = async (formData: FormData) => {
        if (!selectedArtifactId) return;
        const plan = formData.get('solutionPlan') as string;

        const result = await submitSolutionPlan(selectedArtifactId, plan);
        if (result.success) {
            setIsPlanModalOpen(false);
            window.location.reload();
        } else {
            alert(result.error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-1 text-center md:text-left">
                    <h1 className="text-4xl font-extrabold tracking-tighter text-gradient">Artifact Repository</h1>
                    <p className="text-muted-foreground font-medium">Manage and preserve your engineering outcomes.</p>
                </div>
                {userRole === 'STUDENT' && (
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-4 bg-primary text-black rounded-2xl font-bold uppercase tracking-wider glow-primary hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <Plus className="w-5 h-5" />
                        New Artifact
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: 'Total Units', value: stats.total, icon: Box, color: 'text-primary' },
                    { label: 'Validated', value: stats.validated, icon: Sparkles, color: 'text-blue-400' },
                    { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-amber-400' },
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

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search artifacts by title, goal, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/30 transition-all text-white placeholder:text-muted-foreground/50"
                    />
                </div>
                <div className="flex gap-4">
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as any)}
                        className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all text-white/70">
                        <option value="ALL">All Types</option>
                        <option value={ArtifactType.SCHOOL}>Individual</option>
                        <option value={ArtifactType.TEAM}>Team</option>
                        <option value={ArtifactType.PERSONAL}>Personal</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all text-white/70">
                        <option value="ALL">All Status</option>
                        <option value="DRAFT">Draft</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="VALIDATED">Validated</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="glass-panel rounded-[2.5rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-bottom border-white/5 bg-white/[0.02]">
                                <th className="px-8 py-5 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground w-1/3">Artifact Details</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Category</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Status</th>
                                <th className="px-8 py-5 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredArtifacts.length > 0 ? (
                                filteredArtifacts.map((artifact) => (
                                    <tr
                                        key={artifact.id}
                                        id={`artifact-${artifact.id}`}
                                        className={cn(
                                            "group hover:bg-white/[0.02] transition-all",
                                            selectedArtifactId === artifact.id && "bg-primary/5 border-l-2 border-l-primary"
                                        )}
                                    >
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
                                                        {artifact.problemDescription || 'No description provided.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                    {artifact.type}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em]",
                                                artifact.status === ArtifactStatus.VALIDATED ? "text-emerald-400" :
                                                    artifact.status === ArtifactStatus.SUBMITTED ? "text-blue-400" : "text-amber-400"
                                            )}>
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full animate-pulse",
                                                    artifact.status === ArtifactStatus.VALIDATED ? "bg-emerald-400" :
                                                        artifact.status === ArtifactStatus.SUBMITTED ? "bg-blue-400" : "bg-amber-400"
                                                )} />
                                                {artifact.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 items-center">
                                                {/* Student Actions: Plan Solution */}
                                                {userRole === 'STUDENT' && (
                                                    <>
                                                        {artifact.status === ArtifactStatus.NEEDS_IMPROVEMENT && artifact.comments && artifact.comments.length > 0 && (
                                                            <button
                                                                onClick={() => handleViewFeedback(artifact.comments || [])}
                                                                className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all group/btn animate-pulse"
                                                                title="View Mentor Feedback">
                                                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => openPlanModal(artifact)}
                                                            className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group/btn"
                                                            title="Write Solution Plan">
                                                            <PenTool className="w-4 h-4 text-muted-foreground group-hover/btn:text-primary transition-colors" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(artifact.id)}
                                                            className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-red-500/30 hover:bg-red-500/10 transition-all group/btn"
                                                            title="Delete Artifact">
                                                            <Trash2 className="w-4 h-4 text-muted-foreground group-hover/btn:text-red-400 transition-colors" />
                                                        </button>
                                                    </>
                                                )}

                                                {/* Mentor Actions: Status Updates */}
                                                {userRole === 'MENTOR' && (
                                                    <>
                                                        {/* Show content/plan viewing button (search icon for now) */}
                                                        <button className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all" title="View Details">
                                                            <FileText className="w-4 h-4 text-muted-foreground" />
                                                        </button>

                                                        {artifact.status !== ArtifactStatus.VALIDATED && (
                                                            <button
                                                                onClick={() => handleStatusUpdate(artifact.id, ArtifactStatus.VALIDATED)}
                                                                className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-emerald-400"
                                                                title="Approve / Validate">
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
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
                                                    No artifacts found matching your filters.
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Artifact Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors">
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>

                        <h2 className="text-2xl font-bold tracking-tight mb-2">New Artifact</h2>
                        <p className="text-sm text-muted-foreground mb-6">Define the problem you want to solve.</p>

                        <form action={handleCreate} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Title</label>
                                <input name="title" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 focus:outline-none transition-colors" placeholder="e.g. Automated Note Taker" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Problem Description</label>
                                <textarea name="problemDescription" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 focus:outline-none transition-colors min-h-[100px]" placeholder="What specific problem are you facing?" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Goal</label>
                                <textarea name="goal" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 focus:outline-none transition-colors" placeholder="What is the desired outcome?" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Type</label>
                                <select name="type" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 focus:outline-none transition-colors text-white/70">
                                    <option value={ArtifactType.SCHOOL}>Individual (School)</option>
                                    <option value={ArtifactType.PERSONAL}>Personal</option>
                                    <option value={ArtifactType.TEAM}>Team (Week 9+)</option>
                                </select>
                            </div>

                            {/* Tool Selection */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">AI Tools Used</label>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Search tools..."
                                            value={toolSearch}
                                            onChange={(e) => setToolSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/30"
                                        />
                                    </div>
                                    <div className="max-h-40 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                        {filteredTools.map(tool => (
                                            <label key={tool.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-4 h-4 rounded border flex items-center justify-center transition-all",
                                                        selectedToolIds.includes(tool.id) ? "bg-primary border-primary text-black" : "border-white/20"
                                                    )}>
                                                        {selectedToolIds.includes(tool.id) && <CheckCircle className="w-3 h-3" />}
                                                    </div>
                                                    <span className="text-sm font-medium">{tool.name}</span>
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground">
                                                    {tool.category}
                                                </span>
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={selectedToolIds.includes(tool.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedToolIds([...selectedToolIds, tool.id]);
                                                        } else {
                                                            setSelectedToolIds(selectedToolIds.filter(id => id !== tool.id));
                                                        }
                                                    }}
                                                />
                                            </label>
                                        ))}
                                        {filteredTools.length === 0 && (
                                            <p className="text-center py-4 text-xs text-muted-foreground italic">No tools found.</p>
                                        )}
                                    </div>
                                </div>
                                {selectedToolIds.length > 0 && (
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                                        {selectedToolIds.length} tool{selectedToolIds.length > 1 ? 's' : ''} selected
                                    </p>
                                )}
                            </div>

                            <button type="submit" className="w-full py-4 bg-primary text-black font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity mt-4">
                                Create Artifact
                            </button>

                        </form>
                    </div>
                </div>
            )}

            {/* Solution Plan Modal */}
            {isPlanModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsPlanModalOpen(false)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors">
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>

                        <h2 className="text-2xl font-bold tracking-tight mb-2 flex items-center gap-2">
                            <PenTool className="w-6 h-6 text-primary" />
                            Solution Plan
                        </h2>
                        <p className="text-sm text-muted-foreground mb-6">Describe how you intend to solve this problem. Use step-by-step logic.</p>

                        <form action={handlePlanSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Step-by-Step Plan</label>
                                <textarea
                                    name="solutionPlan"
                                    defaultValue={planData}
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 focus:outline-none transition-colors min-h-[200px]"
                                    placeholder="1. Research existing libraries...&#10;2. Create prototype...&#10;3. Testing..."
                                />
                            </div>

                            <button type="submit" className="w-full py-4 bg-primary text-black font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity mt-4">
                                Submit Plan to Mentor
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Feedback Modal */}
            {isFeedbackModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-md bg-[#0a0a0a] border border-amber-500/30 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsFeedbackModalOpen(false)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors">
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>

                        <div className="flex items-center gap-3 mb-4 text-amber-500">
                            <AlertCircle className="w-6 h-6" />
                            <h2 className="text-xl font-bold tracking-tight">Mentor Feedback</h2>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-200/90 text-sm leading-relaxed whitespace-pre-wrap">
                            {selectedFeedback}
                        </div>

                        <button
                            onClick={() => setIsFeedbackModalOpen(false)}
                            className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest rounded-xl transition-colors text-xs">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
