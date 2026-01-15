"use client";

import { useState } from 'react';
import { ToolCategory, ToolUsageStatus } from '@prisma/client';
import { Cpu, Globe, Terminal, Shield, Workflow, Check, X, ExternalLink, User as UserIcon, Calendar, MessageSquare, Ghost } from 'lucide-react';
import { cn } from '@/lib/utils';
import { reviewToolSubmission } from '@/app/actions/tools';
import { useRouter } from 'next/navigation';

type SubmissionWithUser = {
    id: string;
    name: string;
    url: string;
    category: ToolCategory;
    description: string;
    useCase: string;
    taskSolved: string;
    status: ToolUsageStatus;
    submittedBy: {
        name: string;
        image: string | null;
    };
    createdAt: Date;
};

type Props = {
    initialSubmissions: SubmissionWithUser[];
};

export default function ToolReviewClient({ initialSubmissions }: Props) {
    const [submissions, setSubmissions] = useState(initialSubmissions);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const router = useRouter();

    const handleReview = async (submissionId: string, decision: 'APPROVE' | 'REJECT') => {
        setIsProcessing(submissionId);
        try {
            const result = await reviewToolSubmission(submissionId, decision, decision === 'REJECT' ? "Rejected by mentor." : "Approved for community library.");
            if (result.success) {
                setSubmissions(prev => prev.filter(s => s.id !== submissionId));
                router.refresh();
            } else {
                alert(result.error || "Failed to process submission.");
            }
        } catch (e) {
            alert("An unexpected error occurred.");
        } finally {
            setIsProcessing(null);
        }
    };

    const getCategoryIcon = (category: any) => {
        switch (category?.toString()) {
            case 'LLM': return <Cpu className="w-5 h-5" />;
            case 'IDE': return <Terminal className="w-5 h-5" />;
            case 'AUTOMATION': return <Workflow className="w-5 h-5" />;
            case 'DESIGN': return <Globe className="w-5 h-5" />;
            case 'SECURITY': return <Shield className="w-5 h-5" />;
            default: return <MessageSquare className="w-5 h-5" />;
        }
    };

    if (submissions.length === 0) {
        return (
            <div className="py-20 text-center glass-panel rounded-[3rem] border-white/5 border-dashed">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-widest text-white mb-2">Queue Clear</h3>
                <p className="text-muted-foreground font-medium">There are no pending tool submissions to review.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6">
            {submissions.map((submission) => (
                <div key={submission.id} className="glass-panel p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="flex flex-col lg:flex-row gap-8 relative z-10">
                        {/* Left Side: Submission Details */}
                        <div className="flex-grow space-y-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                                        {getCategoryIcon(submission.category)}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight">{submission.name}</h3>
                                        <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                            <span>{submission.category}</span>
                                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                                            <a href={submission.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                                                Visit Link <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Description</h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{submission.description}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">The Task It Helped Solve</h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed italic">"{submission.taskSolved}"</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Specific Use Case</h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{submission.useCase}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3">Submitted By</h4>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20 overflow-hidden">
                                                {submission.submittedBy.image ? (
                                                    <img src={submission.submittedBy.image} alt={submission.submittedBy.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon className="w-5 h-5 text-primary" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{submission.submittedBy.name}</p>
                                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(submission.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Decisions */}
                        <div className="lg:w-64 flex lg:flex-col gap-4 justify-center">
                            <button
                                onClick={() => handleReview(submission.id, 'APPROVE')}
                                disabled={isProcessing !== null}
                                className={cn(
                                    "flex-grow lg:flex-none flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black uppercase tracking-widest transition-all",
                                    "bg-primary text-black glow-primary hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                )}
                            >
                                {isProcessing === submission.id ? (
                                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        Approve
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => handleReview(submission.id, 'REJECT')}
                                disabled={isProcessing !== null}
                                className={cn(
                                    "flex-grow lg:flex-none flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black uppercase tracking-widest transition-all",
                                    "bg-white/5 border border-white/10 text-white hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/30 active:scale-[0.98] disabled:opacity-50"
                                )}
                            >
                                <X className="w-5 h-5" />
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
