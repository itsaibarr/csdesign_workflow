import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import { prisma } from '@/lib/prisma';
import { Users, FileText, AlertCircle, CheckCircle, Clock, ChevronRight, Activity, Sparkles, Target, Zap, LayoutGrid, Search } from 'lucide-react';
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
        <main className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Identity & Context Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary/80 font-bold uppercase tracking-[0.2em] text-[10px]">
                        <Activity className="w-3 h-3" />
                        System Active — Ops Center
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                        {user.name.split(' ')[0]}'s <span className="text-primary italic">Command Deck</span>
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg">
                        Context: <span className="text-white">Mentorship & Review Ops</span>
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Search or Actions could go here */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 flex items-center gap-2 text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-widest">Online</span>
                    </div>
                </div>
            </header>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* KPI 1: Students */}
                <div className="glass-card p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users className="w-24 h-24 text-primary" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between min-h-[120px]">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                                <Users className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Students</span>
                        </div>
                        <p className="text-5xl font-black text-white tracking-tight">{totalStudents}</p>
                    </div>
                </div>

                {/* KPI 2: Reviews */}
                <div className="glass-card p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <FileText className="w-24 h-24 text-blue-400" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between min-h-[120px]">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <FileText className="w-4 h-4 text-blue-400" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pending Reviews</span>
                        </div>
                        <p className="text-5xl font-black text-white tracking-tight">{totalReviews}</p>
                    </div>
                </div>

                {/* KPI 3: Teams */}
                <div className="glass-card p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <LayoutGrid className="w-24 h-24 text-purple-400" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between min-h-[120px]">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                <LayoutGrid className="w-4 h-4 text-purple-400" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Teams</span>
                        </div>
                        <p className="text-5xl font-black text-white tracking-tight">{activeTeams}</p>
                    </div>
                </div>
            </div>

            {/* Mentorship Requests List (if any) */}
            {mentorshipRequests.length > 0 && (
                <div className="relative">
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-12 bg-amber-500 rounded-full" />
                    <MentorshipRequestsList requests={mentorshipRequests} />
                </div>
            )}


            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Review Radar (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="glass-card rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-8 min-h-[500px] relative overflow-hidden">

                        {/* Header for section */}
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                                <Target className="w-6 h-6 text-primary" />
                                Review Radar
                            </h2>
                            <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                                View Full Queue <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Decoration */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

                        {/* List */}
                        {artifactsToReview.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center py-20 relative z-10">
                                <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6">
                                    <CheckCircle className="w-10 h-10 text-green-500/40" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">All Clear</h3>
                                <p className="text-slate-500 max-w-sm">No artifacts currently pending review. Check in on your students or browse the community.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 relative z-10">
                                {artifactsToReview.map(artifact => (
                                    <Link href={`/dashboard/reviews/${artifact.id}`} key={artifact.id}>
                                        <div className="group p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all flex items-center justify-between">
                                            <div className="flex items-center gap-5">
                                                {/* Type Icon */}
                                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                                    <FileText className="w-5 h-5 text-blue-400" />
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                                            {artifact.type}
                                                        </span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                                                            By {artifact.user.name.split(' ')[0]}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-white group-hover:text-blue-200 transition-colors">
                                                        {artifact.title}
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Submitted</p>
                                                    <div className="flex items-center gap-1.5 text-slate-300 text-xs font-medium">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{new Date(artifact.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                                                    <ChevronRight className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Roster / Quick Access (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-8 h-full flex flex-col relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-3">
                                <Users className="w-5 h-5 text-purple-400" />
                                Roster
                            </h2>
                            <Link href="/dashboard/students" className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                                Manage All
                            </Link>
                        </div>

                        {assignedStudents.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center text-sm text-slate-500 relative z-10">
                                <p>No students assigned.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 relative z-10">
                                {assignedStudents.slice(0, 5).map(student => {
                                    const currentProgress = student.UserNodeProgress?.find((p: any) => p.status === 'IN_PROGRESS');
                                    const stage = currentProgress?.node.title || "Not Started";

                                    return (
                                        <Link href={`/dashboard/students/${student.id}`} key={student.id} className="block group">
                                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-xs font-black text-purple-400 border border-purple-500/20">
                                                        {student.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">{student.name}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider line-clamp-1 max-w-[120px]">{stage}</p>
                                                    </div>
                                                </div>
                                                <div className="w-2 h-2 rounded-full bg-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                                            </div>
                                        </Link>
                                    );
                                })}
                                {assignedStudents.length > 5 && (
                                    <Link href="/dashboard/students" className="block text-center text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white py-4">
                                        + {assignedStudents.length - 5} More Students
                                    </Link>
                                )}
                            </div>
                        )}

                        {/* Decorative bottom fade */}
                        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                    </div>
                </div>
            </div>
        </main>
    );
}
