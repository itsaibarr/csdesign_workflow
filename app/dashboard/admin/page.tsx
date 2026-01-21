import { prisma } from '@/lib/prisma';
import { Users, FileText, Component, Layers, Wrench, Activity, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function AdminOverviewPage() {
    // Parallel data fetching for performance
    const [
        totalBranches,
        totalStudents,
        totalMentors,
        pendingReviews,
        pendingTools,
    ] = await Promise.all([
        prisma.branch.count(),
        prisma.user.count({ where: { role: 'STUDENT' } }),
        prisma.user.count({ where: { role: 'MENTOR' } }),
        prisma.artifact.count({ where: { status: 'SUBMITTED' } }),
        prisma.tool.count({ where: { usageStatus: 'PENDING_REVIEW' } }),
    ]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary/80 font-bold uppercase tracking-[0.2em] text-[10px]">
                        <Activity className="w-3 h-3" />
                        System Active — Admin Level
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                        <span className="text-primary italic">Ops Center</span> Overview
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg">
                        Platform status and health checks.
                    </p>
                </div>
                <div className="w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl text-red-400 text-xs font-bold uppercase tracking-widest">
                        <AlertCircle className="w-4 h-4" />
                        Restricted Access
                    </div>
                </div>
            </header>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Branches */}
                <div className="glass-card p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
                            <Layers className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Branches</span>
                    </div>
                    <p className="text-4xl font-black text-white">{totalBranches}</p>
                    <p className="text-xs text-slate-500 mt-2">Active Locations</p>
                </div>

                {/* Users (Students + Mentors) */}
                <div className="glass-card p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                            <Users className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Userbase</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <p className="text-4xl font-black text-white">{totalStudents + totalMentors}</p>
                        <span className="text-sm text-slate-500 font-semibold">Total</span>
                    </div>
                    <div className="flex gap-3 mt-2 text-xs text-slate-400 font-medium">
                        <span>{totalStudents} Students</span>
                        <span>•</span>
                        <span>{totalMentors} Mentors</span>
                    </div>
                </div>

                {/* Pending Reviews */}
                <div className="glass-card p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                            <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Reviews</span>
                    </div>
                    <p className="text-4xl font-black text-white">{pendingReviews}</p>
                    <p className="text-xs text-slate-500 mt-2">Artifacts Awaiting Review</p>
                </div>

                {/* Pending Tools */}
                <Link href="/dashboard/admin/tools">
                    <div className="glass-card p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group bg-white/[0.01] hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer h-full">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 group-hover:text-primary group-hover:bg-primary/20 transition-colors">
                                <Wrench className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold group-hover:text-primary/70 transition-colors">Tools</span>
                        </div>
                        <p className="text-4xl font-black text-white group-hover:text-primary transition-colors">{pendingTools}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <p className="text-xs text-slate-500 group-hover:text-primary/70 transition-colors">Needs Moderation</p>
                            {pendingTools > 0 && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                        </div>
                    </div>
                </Link>

            </div>

            {/* Quick Actions / Navigation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/dashboard/admin/branches" className="group">
                    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all h-full flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 rounded-3xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20 group-hover:scale-110 transition-transform">
                            <Layers className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white mb-1">Manage Branches</h3>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Configure School Locations</p>
                        </div>
                    </div>
                </Link>

                <Link href="/dashboard/admin/users" className="group">
                    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all h-full flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:scale-110 transition-transform">
                            <Users className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white mb-1">User Roles</h3>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Assignments & Access</p>
                        </div>
                    </div>
                </Link>

                <Link href="/dashboard/admin/assignments" className="group">
                    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all h-full flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 rounded-3xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20 group-hover:scale-110 transition-transform">
                            <Component className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white mb-1">Mentor Load</h3>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Balance Responsibility</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
