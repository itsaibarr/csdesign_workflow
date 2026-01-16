import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function MentorReviewsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.email) redirect('/login');

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true }
    });

    if (user?.role !== 'MENTOR') {
        redirect('/dashboard');
    }

    const artifacts = await prisma.artifact.findMany({
        where: {
            // Show Submitted (Pending Review) and In Progress (Observation)
            status: { in: ['SUBMITTED', 'IN_PROGRESS', 'VALIDATED'] },
            user: { mentorId: user.id } as any
        },
        include: { user: true, courseNode: true },
        orderBy: { updatedAt: 'desc' }
    });

    const pending = artifacts.filter(a => a.status === 'SUBMITTED');
    const active = artifacts.filter(a => a.status === 'IN_PROGRESS');
    const history = artifacts.filter(a => a.status === 'VALIDATED');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-medium tracking-tight text-white mb-2">Artifact Review Hub</h1>
                <p className="text-muted-foreground">Validate student work and provide guidance.</p>
            </div>

            {/* Pending Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <h2 className="text-xl font-light text-white">Pending Review ({pending.length})</h2>
                </div>

                {pending.length === 0 ? (
                    <div className="p-8 border border-white/5 bg-white/[0.01] rounded-2xl text-slate-500 text-sm">
                        No artifacts currently awaiting review.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pending.map(artifact => (
                            <Link href={`/dashboard/reviews/${artifact.id}`} key={artifact.id}>
                                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-primary/30 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 block">
                                                {artifact.courseNode?.title || "Project"}
                                            </span>
                                            <h3 className="text-lg font-medium text-white group-hover:text-primary transition-colors">
                                                {artifact.title}
                                            </h3>
                                        </div>
                                        <div className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-amber-500/20">
                                            Submitted
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                                        {artifact.problemDescription}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-slate-500 border-t border-white/5 pt-4">
                                        <span className="flex items-center gap-1">
                                            <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white">
                                                {artifact.user.name[0]}
                                            </div>
                                            {artifact.user.name}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(artifact.updatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Active / In Progress */}
            <section className="space-y-4 pt-8 border-t border-white/5">
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <h2 className="text-xl font-light text-white">Active drafts ({active.length})</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {active.map(artifact => (
                        <div key={artifact.id} className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 opacity-75">
                            <h4 className="font-medium text-white mb-1">{artifact.title}</h4>
                            <p className="text-xs text-slate-500 mb-2">by {artifact.user.name}</p>
                            <div className="text-[10px] uppercase font-bold text-slate-600 border border-slate-800 px-2 py-1 rounded inline-block">
                                In Progress
                            </div>
                        </div>
                    ))}
                    {active.length === 0 && <p className="text-slate-500 text-sm">No active drafts found.</p>}
                </div>
            </section>

        </div>
    );
}
