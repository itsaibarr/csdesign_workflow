import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Target, Wrench, Trophy, Users as UsersIcon, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { getStageDetail, startStage } from '@/app/actions/courses';
import { ToolCard } from '@/components/courses/ToolCard';
import { NodeStatus } from '@prisma/client';

interface PageProps {
    params: Promise<{
        nodeId: string;
    }>;
}

export default async function StageDetailPage({ params }: PageProps) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect('/login');
    }

    const { nodeId } = await params;
    const data = await getStageDetail(nodeId);

    if ('error' in data) {
        notFound();
    }

    const { stage } = data;
    const details = stage.details;

    const isLocked = stage.status === 'LOCKED';
    const isCompleted = stage.status === NodeStatus.COMPLETED;
    const isActive = stage.status === NodeStatus.IN_PROGRESS || stage.status === NodeStatus.AVAILABLE;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/courses"
                    className="p-3 rounded-xl glass-panel border border-white/10 hover:border-primary/30 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-grow space-y-1">
                    <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary">
                        Weeks {stage.weekRange}
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">{stage.title}</h1>
                </div>
                <div className="flex items-center gap-3">
                    {isCompleted && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                            <span className="text-xs font-bold text-primary uppercase tracking-widest">Completed</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Context Section */}
            {details?.context && (
                <section className="glass-panel p-8 rounded-[2rem] border-white/5 space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Target className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold">Context</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                        {details.context}
                    </p>
                </section>
            )}

            {/* What You Will Do */}
            {details?.whatYouWillDo && details.whatYouWillDo.length > 0 && (
                <section className="glass-panel p-8 rounded-[2rem] border-white/5 space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <PlayCircle className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold">What You Will Do</h2>
                    </div>
                    <ul className="space-y-3">
                        {details.whatYouWillDo.map((task: string, index: number) => (
                            <li key={index} className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-primary">{index + 1}</span>
                                </div>
                                <span className="text-muted-foreground leading-relaxed">{task}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Tools You Will Use */}
            {details?.tools && details.tools.length > 0 && (
                <section className="glass-panel p-8 rounded-[2rem] border-white/5 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Wrench className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold">Tools You Will Use</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {details.tools.map((tool: any, index: number) => (
                            <ToolCard key={index} tool={tool} />
                        ))}
                    </div>
                </section>
            )}

            {/* Expected Outcome */}
            {details?.expectedOutcome && (
                <section className="glass-panel p-8 rounded-[2rem] border-white/5 space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold">Expected Outcome</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                        {details.expectedOutcome}
                    </p>

                    {/* Show submitted artifacts */}
                    {stage.artifacts && stage.artifacts.length > 0 && (
                        <div className="mt-6 space-y-3">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Your Artifacts</h3>
                            {stage.artifacts.map((artifact: any) => (
                                <Link
                                    key={artifact.id}
                                    href={`/dashboard/artifacts`}
                                    className="block p-4 bg-black/20 rounded-lg border border-white/5 hover:border-primary/30 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{artifact.title}</span>
                                        <span className="text-xs text-primary uppercase tracking-wider">{artifact.status}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* Offline Session Connection */}
            {details?.offlineSession && (
                <section className="glass-panel p-8 rounded-[2rem] border-white/5 space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <UsersIcon className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold">Offline Session Connection</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                        {details.offlineSession}
                    </p>
                </section>
            )}

            {/* Action Section */}
            {!isCompleted && !isLocked && (
                <div className="glass-panel p-8 rounded-[2rem] border-primary/20 bg-primary/5">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold mb-1">Ready to Start?</h3>
                            <p className="text-sm text-muted-foreground">
                                Begin working on this stage and create your first artifact.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href="/dashboard/artifacts"
                                className="px-6 py-3 bg-primary text-black rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-[1.05] transition-all inline-flex items-center gap-2"
                            >
                                Create Artifact
                                <ArrowLeft className="w-4 h-4 rotate-180" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
