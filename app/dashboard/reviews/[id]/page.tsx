import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, MessageSquare, Check, X } from 'lucide-react';
import Link from 'next/link';
import { ReviewInteraction } from './review-interaction';

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.email) redirect('/login');
    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true }
    });
    if (currentUser?.role !== 'MENTOR') redirect('/dashboard');

    const artifact = await prisma.artifact.findUnique({
        where: { id: id },
        include: {
            user: true,
            courseNode: true,
            artifactTools: { include: { tool: true } }
        }
    });

    if (!artifact) notFound();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
            <Link href="/dashboard/reviews" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                <ArrowLeft className="w-4 h-4" /> Back to Queue
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
                {/* Artifact Content (Left 2 cols) */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                                {artifact.type}
                            </div>
                            <span className="text-slate-500 text-sm">Created by {artifact.user.name}</span>
                        </div>
                        <h1 className="text-4xl font-black text-white mb-4 leading-tight">{artifact.title}</h1>
                        <p className="text-lg text-slate-300 leading-relaxed">{artifact.problemDescription}</p>
                    </div>

                    <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.01] space-y-6">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Goal</h3>
                            <p className="text-white">{artifact.goal}</p>
                        </div>
                        {artifact.solutionPlan && (
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Plan</h3>
                                <p className="text-white whitespace-pre-wrap">{artifact.solutionPlan}</p>
                            </div>
                        )}
                        {artifact.content && (
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Submission Content</h3>
                                <div className="p-4 bg-black/20 rounded-xl font-mono text-sm text-slate-300 whitespace-pre-wrap border border-white/5">
                                    {artifact.content}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tools Used */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Tools Utilized</h3>
                        <div className="flex flex-wrap gap-2">
                            {artifact.artifactTools.map(at => (
                                <span key={at.id} className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                                    {at.tool.name}
                                </span>
                            ))}
                            {artifact.artifactTools.length === 0 && <span className="text-slate-600 text-sm italic">No tools tagged</span>}
                        </div>
                    </div>
                </div>

                {/* Feedback Panel (Right col) */}
                <div className="lg:col-span-1">
                    <div className="sticky top-8 p-6 rounded-[2rem] border border-white/10 bg-white/[0.02] flex flex-col gap-6">
                        <ReviewInteraction artifactId={id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
