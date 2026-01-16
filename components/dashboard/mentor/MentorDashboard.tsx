import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import { prisma } from '@/lib/prisma';
import { Users, FileText, AlertCircle, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Prisma } from '@prisma/client'; // Assuming this exists

import { MentorshipRequestsList } from './MentorshipRequestsList';

export default async function MentorDashboard() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.email) return null;

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) return null;
    const mentorId = user.id;

    // Fetch Pending Mentorship Requests
    const mentorshipRequests = await (prisma as any).mentorshipRequest.findMany({
        where: {
            mentorId: mentorId,
            status: 'PENDING'
        },
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // Fetch Assigned Students directly
    const assignedStudents = await prisma.user.findMany({
        where: { mentorId: mentorId } as any,
        include: {
            UserNodeProgress: {
                include: { node: true }
            }
        }
    });

    // Fetch Mentored Teams
    const mentoredTeams = await prisma.team.findMany({
        where: { mentorId: mentorId },
        include: { members: true }
    });

    // Fetch Artifacts waiting for review (from assigned students)
    const artifactsToReview = await prisma.artifact.findMany({
        where: {
            status: 'SUBMITTED',
            user: {
                mentorId: mentorId
            }
        },
        include: {
            user: true,
            courseNode: true
        },
        orderBy: {
            updatedAt: 'asc'
        }
    });

    // Stats
    const totalStudents = assignedStudents.length;
    const totalReviews = artifactsToReview.length;
    const activeTeams = mentoredTeams.filter(t => t.status === 'ACTIVE').length;
    const studentsNeedingAttention = 0;

    return (
        <main className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Minimal Header */}
            <div className="flex items-end justify-between border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-3xl font-medium tracking-tight text-white">
                        Mentor <span className="text-slate-400">Overview</span>
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {totalStudents} Students under supervision across {activeTeams} Active Teams
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Current Status</p>
                        <p className="text-sm font-bold text-green-400 flex items-center justify-end gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            Active
                        </p>
                    </div>
                </div>
            </div>

            {/* Mentorship Requests List */}
            <MentorshipRequestsList requests={mentorshipRequests} />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-3 mb-4 text-slate-400">
                        <Users className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Students</span>
                    </div>
                    <p className="text-4xl font-light text-white">{totalStudents}</p>
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-3 mb-4 text-slate-400">
                        <FileText className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Pending Reviews</span>
                    </div>
                    <p className="text-4xl font-light text-white">{totalReviews}</p>
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-3 mb-4 text-slate-400">
                        <Users className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Active Teams</span>
                    </div>
                    <p className="text-4xl font-light text-white">{activeTeams}</p>
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-3 mb-4 text-amber-500/80">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Needs Attention</span>
                    </div>
                    <p className="text-4xl font-light text-white">{studentsNeedingAttention}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Artifact Review Queue */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-light text-white">Review Queue</h2>
                        <button className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">View All</button>
                    </div>

                    {artifactsToReview.length === 0 ? (
                        <div className="p-12 rounded-[2rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                            <CheckCircle className="w-12 h-12 text-green-500/20 mb-4" />
                            <p className="text-slate-400">All caught up. No artifacts pending review.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {artifactsToReview.map(artifact => (
                                <Link href={`/dashboard/reviews/${artifact.id}`} key={artifact.id}>
                                    <div className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full border border-blue-500/20">
                                                    {artifact.type}
                                                </span>
                                                <span className="text-xs text-slate-500">•</span>
                                                <span className="text-xs text-slate-400">Submitted by {artifact.user.name}</span>
                                            </div>
                                            <h3 className="text-lg font-medium text-white group-hover:text-blue-200 transition-colors">
                                                {artifact.title}
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                                                {artifact.problemDescription}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-1 text-slate-500 text-xs">
                                                <Clock className="w-3 h-3" />
                                                <span>{new Date(artifact.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Students List */}
                <div className="space-y-6">
                    <h2 className="text-xl font-light text-white">Students</h2>
                    <div className="rounded-[2rem] border border-white/5 bg-white/[0.01] overflow-hidden">
                        {assignedStudents.length === 0 ? (
                            <div className="p-8 text-center text-sm text-slate-500">No students assigned yet.</div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {assignedStudents.map(student => {
                                    // Determine status based on progress (dummy logic for now)
                                    const currentProgress = student.UserNodeProgress?.find(p => p.status === 'IN_PROGRESS');
                                    const stage = currentProgress?.node.title || "Not Started";

                                    return (
                                        <Link href={`/dashboard/students/${student.id}`} key={student.id} className="block hover:bg-white/[0.02] transition-colors p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                                                        {student.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{student.name}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{stage}</p>
                                                    </div>
                                                </div>
                                                <div className="w-2 h-2 rounded-full bg-green-500/50" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                        <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                            <Link href="/dashboard/students" className="block text-center text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                                View Full Roster
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
