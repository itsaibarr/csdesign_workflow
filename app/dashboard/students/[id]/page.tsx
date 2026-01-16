import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Box } from 'lucide-react';
import Link from 'next/link';

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    // Auth Check
    if (!session?.user?.email) redirect('/login');
    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true }
    });
    if (currentUser?.role !== 'MENTOR') redirect('/dashboard');

    // Fetch Student
    const student = await prisma.user.findUnique({
        where: { id: id },
        include: {
            UserNodeProgress: { include: { node: true } },
            artifacts: { orderBy: { updatedAt: 'desc' }, include: { courseNode: true } },
            team: true
        }
    });

    if (!student) notFound();

    // Authorization: Strict Mentor-Student Assignment Check
    if (student.mentorId !== currentUser.id) {
        // Double check if student is in a team supervised by this mentor (optional flexibility)
        const isTeamSupervised = student.team?.mentorId === currentUser.id;

        if (!isTeamSupervised) {
            redirect('/dashboard/students');
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Link href="/dashboard/students" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                <ArrowLeft className="w-4 h-4" /> Back to Roster
            </Link>

            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-black text-white">{student.name}</h1>
                    <p className="text-xl text-slate-400 mt-2">{student.email}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Team</p>
                    <p className="text-white font-bold">{student.team?.name || "Unassigned"}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Progression */}
                <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.01]">
                    <h2 className="text-xl font-light text-white mb-6">Course Progression</h2>
                    <div className="space-y-4">
                        {student.UserNodeProgress.sort((a, b) => a.node.order - b.node.order).map(p => (
                            <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02]">
                                <div>
                                    <p className="text-sm font-bold text-white">{p.node.title}</p>
                                    <p className="text-xs text-slate-500">Week {p.node.weekRange}</p>
                                </div>
                                <div className={`text-[10px] font-black uppercase px-2 py-1 rounded ${p.status === 'COMPLETED' ? 'bg-green-500/20 text-green-500' :
                                    p.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-500' : 'bg-slate-800 text-slate-500'
                                    }`}>
                                    {p.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Artifacts */}
                <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.01]">
                    <h2 className="text-xl font-light text-white mb-6">Artifact History</h2>
                    <div className="space-y-4">
                        {student.artifacts.map(art => (
                            <Link href={`/dashboard/reviews/${art.id}`} key={art.id} className="block group">
                                <div className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors border border-white/5">
                                    <div className="flex justify-between mb-2">
                                        <h4 className="font-bold text-white group-hover:text-primary transition-colors">{art.title}</h4>
                                        <span className="text-[10px] uppercase text-slate-500">{art.status}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 line-clamp-2">{art.problemDescription}</p>
                                </div>
                            </Link>
                        ))}
                        {student.artifacts.length === 0 && <p className="text-slate-500 text-sm">No artifacts yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
