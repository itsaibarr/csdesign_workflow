'use client';

import { ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeStatus } from '@prisma/client';
import Link from 'next/link';

interface StageCardProps {
    id: string;
    title: string;
    description: string | null;
    weekRange: string;
    status: NodeStatus;
    requiredActions?: string | null;
}

export function StageCard({ id, title, description, weekRange, status, requiredActions }: StageCardProps) {
    const isLocked = status === NodeStatus.LOCKED;
    const isCompleted = status === NodeStatus.COMPLETED;
    const isActive = status === NodeStatus.IN_PROGRESS || status === NodeStatus.AVAILABLE;

    // Parse mission from requiredActions if available
    let mission = 'Complete Artifacts';
    if (requiredActions) {
        try {
            const parsed = JSON.parse(requiredActions);
            mission = parsed.description || parsed.expectedOutcome?.substring(0, 60) || mission;
        } catch (e) {
            // Ignore parse errors
        }
    }

    return (
        <div className="relative flex flex-col md:flex-row items-center md:items-start group">
            {/* Timeline Marker */}
            <div
                className={cn(
                    "absolute left-[50%] md:left-24 -translate-x-1/2 w-4 h-4 rounded-full border-4 z-10 transition-all duration-500",
                    isCompleted ? "bg-primary border-black glow-primary scale-125" :
                        isActive ? "bg-black border-primary animate-pulse" : "bg-zinc-800 border-zinc-700"
                )}
            />

            {/* Content Card */}
            <div
                className={cn(
                    "w-full md:ml-36 p-8 rounded-[2rem] border transition-all duration-500 max-w-xl",
                    isCompleted ? "glass-card border-primary/20 bg-primary/5" :
                        isActive ? "glass-panel border-primary shadow-2xl scale-[1.02]" : "bg-white/[0.02] border-white/5 opacity-50 grayscale"
                )}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                        <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary">Weeks {weekRange}</div>
                        <h3 className="text-xl font-bold tracking-tight">{title}</h3>
                    </div>
                    {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                    ) : isLocked ? (
                        <Lock className="w-6 h-6 text-muted-foreground" />
                    ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    )}
                </div>

                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    {description}
                </p>

                {/* Mission Indicator */}
                {requiredActions && (
                    <div className="mb-4 p-3 bg-black/20 rounded-lg border border-white/5">
                        <p className="text-[10px] font-mono text-muted-foreground">
                            MISSION: {mission}
                        </p>
                    </div>
                )}

                <div className="flex justify-between items-center">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(j => (
                            <div key={j} className="w-6 h-6 rounded-full border border-black bg-zinc-800" />
                        ))}
                        <div className="w-6 h-6 rounded-full border border-black bg-zinc-700 flex items-center justify-center text-[8px] font-bold">+12</div>
                    </div>

                    {isLocked ? (
                        <button
                            disabled
                            className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all inline-flex items-center gap-2 bg-white/5 text-muted-foreground"
                        >
                            Locked
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    ) : (
                        <Link
                            href={`/dashboard/courses/${id}`}
                            className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all inline-flex items-center gap-2 bg-primary text-black hover:scale-[1.05]"
                        >
                            {isCompleted ? 'Review Node' : 'Start Node'}
                            <ArrowRight className="w-3 h-3" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
