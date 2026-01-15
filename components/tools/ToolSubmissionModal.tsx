"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ToolCategory } from '@prisma/client';
import {
    X, Upload, Loader2, CheckCircle2, AlertCircle,
    Globe, Cpu, Terminal, Workflow, Shield, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { submitTool } from '@/app/actions/tools';

const submissionSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    url: z.string().url("Please enter a valid URL"),
    category: z.nativeEnum(ToolCategory),
    description: z.string().min(20, "Please provide a more detailed description (min 20 chars)"),
    useCase: z.string().min(10, "Describe how you used it"),
    taskSolved: z.string().min(10, "Describe what task it solved"),
});

type SubmissionForm = z.infer<typeof submissionSchema>;

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export default function ToolSubmissionModal({ isOpen, onClose }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<SubmissionForm>({
        resolver: zodResolver(submissionSchema),
        defaultValues: {
            category: ToolCategory.LLM
        }
    });

    const onSubmit = async (data: SubmissionForm) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const result = await submitTool(data);
            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    handleClose();
                }, 3000);
            } else {
                setError(result.error || "Failed to submit tool.");
            }
        } catch (e) {
            setError("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        reset();
        setSuccess(false);
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={handleClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl glass-panel rounded-[2.5rem] border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight">Deploy New Tool</h2>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Contribute to the CSC Resources Library</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-3 rounded-2xl hover:bg-white/5 text-muted-foreground hover:text-white transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8">
                    {success ? (
                        <div className="py-12 flex flex-col items-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary glow-primary">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black tracking-tight">Submission Received!</h3>
                                <p className="text-muted-foreground font-medium max-w-sm">
                                    Your tool has been sent for review. Mentors will validate it before it's deployed to the community library.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tool Name</label>
                                    <input
                                        {...register('name')}
                                        placeholder="e.g. Cursor, Zapier, v0"
                                        className={cn(
                                            "w-full px-5 py-4 bg-white/5 border rounded-2xl focus:outline-none transition-all text-white font-medium",
                                            errors.name ? "border-red-500/50 bg-red-500/5" : "border-white/10 focus:border-primary/40"
                                        )}
                                    />
                                    {errors.name && <p className="text-[10px] font-bold text-red-400 ml-1">{errors.name.message}</p>}
                                </div>

                                {/* URL */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Official URL</label>
                                    <input
                                        {...register('url')}
                                        placeholder="https://..."
                                        className={cn(
                                            "w-full px-5 py-4 bg-white/5 border rounded-2xl focus:outline-none transition-all text-white font-medium",
                                            errors.url ? "border-red-500/50 bg-red-500/5" : "border-white/10 focus:border-primary/40"
                                        )}
                                    />
                                    {errors.url && <p className="text-[10px] font-bold text-red-400 ml-1">{errors.url.message}</p>}
                                </div>
                            </div>

                            {/* Category Select */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {Object.values(ToolCategory).map((cat) => (
                                        <label key={cat} className="relative cursor-pointer group">
                                            <input
                                                type="radio"
                                                value={cat}
                                                {...register('category')}
                                                className="peer sr-only"
                                            />
                                            <div className="px-3 py-3 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center gap-2 transition-all peer-checked:bg-primary/20 peer-checked:border-primary/50 text-muted-foreground peer-checked:text-primary group-hover:bg-white/10">
                                                {cat === 'LLM' && <Cpu className="w-5 h-5" />}
                                                {cat === 'IDE' && <Terminal className="w-5 h-5" />}
                                                {cat === 'AUTOMATION' && <Workflow className="w-5 h-5" />}
                                                {cat === 'DESIGN' && <Globe className="w-5 h-5" />}
                                                {cat === 'SECURITY' && <Shield className="w-5 h-5" />}
                                                {cat === 'OTHER' && <Info className="w-5 h-5" />}
                                                <span className="text-[9px] font-black uppercase tracking-tighter">{cat}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 text-gradient">What is this tool?</label>
                                <textarea
                                    {...register('description')}
                                    placeholder="Brief explanation for the community library..."
                                    rows={2}
                                    className={cn(
                                        "w-full px-5 py-4 bg-white/5 border rounded-2xl focus:outline-none transition-all text-white font-medium resize-none",
                                        errors.description ? "border-red-500/50 bg-red-500/5" : "border-white/10 focus:border-primary/40"
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Use Case */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">How I used it</label>
                                    <textarea
                                        {...register('useCase')}
                                        placeholder="Context in your workflow..."
                                        rows={3}
                                        className={cn(
                                            "w-full px-5 py-4 bg-white/5 border rounded-2xl focus:outline-none transition-all text-white text-sm font-medium resize-none",
                                            errors.useCase ? "border-red-500/50 bg-red-500/5" : "border-white/10 focus:border-primary/40"
                                        )}
                                    />
                                </div>

                                {/* Task Solved */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Task it helped solve</label>
                                    <textarea
                                        {...register('taskSolved')}
                                        placeholder="Specific outcome achieved..."
                                        rows={3}
                                        className={cn(
                                            "w-full px-5 py-4 bg-white/5 border rounded-2xl focus:outline-none transition-all text-white text-sm font-medium resize-none",
                                            errors.taskSolved ? "border-red-500/50 bg-red-500/5" : "border-white/10 focus:border-primary/40"
                                        )}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm font-bold">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-5 bg-primary text-black rounded-2xl font-black uppercase tracking-widest glow-primary hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Submit for Validation
                                        <Upload className="w-6 h-6" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
