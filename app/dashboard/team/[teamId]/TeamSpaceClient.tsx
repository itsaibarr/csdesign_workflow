'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
    ArrowLeft, Users, QrCode as QrCodeIcon, Send, Sparkles,
    Plus, X, Target, Box, CheckCircle2, Crown, Edit, Trash2
} from 'lucide-react';
import Link from 'next/link';
import { submitProject, updateTeam } from '@/app/actions/teams';
import { createTask, deleteTask, moveTask } from '@/app/actions/board';
import { createReview } from '@/app/actions/reviews';
import { TaskStatus, ReviewStatus, TeamStatus } from '@prisma/client';

type TeamSpaceClientProps = {
    team: any;
    currentUserId: string;
    currentUserRole: string;
};

export default function TeamSpaceClient({ team, currentUserId, currentUserRole }: TeamSpaceClientProps) {
    const [showQRModal, setShowQRModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>(TaskStatus.TODO);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isMember = team.members.some((m: any) => m.id === currentUserId);
    const isMentor = team.mentorId === currentUserId;
    const isCreator = team.createdBy === currentUserId;

    // Group tasks by status
    const tasksByStatus = {
        TODO: team.tasks?.filter((t: any) => t.status === TaskStatus.TODO) || [],
        IN_PROGRESS: team.tasks?.filter((t: any) => t.status === TaskStatus.IN_PROGRESS) || [],
        DONE: team.tasks?.filter((t: any) => t.status === TaskStatus.DONE) || []
    };

    async function handleSubmitProject() {
        if (!confirm('Submit this project for mentor review?')) return;
        setIsSubmitting(true);
        const result = await submitProject(team.id);
        if (result.success) {
            window.location.reload();
        } else {
            alert(result.error);
            setIsSubmitting(false);
        }
    }

    async function handleCreateTask(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            title: formData.get('title') as string,
            description: formData.get('description') as string || undefined,
            status: newTaskStatus
        };

        const result = await createTask(team.id, data);
        if (result.success) {
            setShowTaskModal(false);
            window.location.reload();
        } else {
            alert(result.error);
        }
    }

    async function handleDeleteTask(taskId: string) {
        if (!confirm('Delete this task?')) return;
        const result = await deleteTask(taskId);
        if (result.success) {
            window.location.reload();
        } else {
            alert(result.error);
        }
    }

    async function handleMoveTask(taskId: string, newStatus: TaskStatus) {
        const result = await moveTask(taskId, newStatus);
        if (result.success) {
            window.location.reload();
        } else {
            alert(result.error);
        }
    }

    async function handleCreateReview(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            feedback: formData.get('feedback') as string,
            status: formData.get('status') as ReviewStatus
        };

        const result = await createReview(team.id, data);
        if (result.success) {
            setShowReviewModal(false);
            window.location.reload();
        } else {
            alert(result.error);
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <Link
                        href="/dashboard/team"
                        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Teams
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-extrabold tracking-tighter text-gradient">{team.name}</h1>
                        <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            team.status === TeamStatus.FORMING ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                team.status === TeamStatus.ACTIVE ? "bg-primary/10 text-primary border border-primary/20" :
                                    team.status === TeamStatus.SUBMITTED ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                        team.status === TeamStatus.APPROVED ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                            "bg-white/5 text-muted-foreground border border-white/10"
                        )}>
                            {team.status}
                        </span>
                    </div>
                </div>
                <div className="flex gap-3">
                    {isMember && (
                        <>
                            <button
                                onClick={() => setShowQRModal(true)}
                                className="px-5 py-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-all"
                            >
                                <QrCodeIcon className="w-4 h-4" />
                                Invite
                            </button>
                            {team.status !== TeamStatus.SUBMITTED && team.status !== TeamStatus.APPROVED && (
                                <button
                                    onClick={handleSubmitProject}
                                    disabled={isSubmitting}
                                    className="px-5 py-3 bg-primary text-black rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider glow-primary hover:scale-[1.02] disabled:opacity-50 transition-all"
                                >
                                    <Send className="w-4 h-4" />
                                    Submit Project
                                </button>
                            )}
                        </>
                    )}
                    {isMentor && team.status === TeamStatus.SUBMITTED && (
                        <button
                            onClick={() => setShowReviewModal(true)}
                            className="px-5 py-3 bg-primary text-black rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider glow-primary hover:scale-[1.02] transition-all"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Add Review
                        </button>
                    )}
                </div>
            </div>

            {/* Team Members */}
            <div className="glass-panel p-6 rounded-[2.5rem] border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                        Team Members ({team.members.length}/{team.maxMembers})
                    </h3>
                </div>
                <div className="flex flex-wrap gap-3">
                    {team.members.map((member: any) => (
                        <div key={member.id} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold">
                                {member.image ? (
                                    <img src={member.image} alt="" className="w-full h-full rounded-lg object-cover" />
                                ) : (
                                    member.name?.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-bold">{member.name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                    {member.id === team.createdBy && <><Crown className="w-3 h-3 inline mr-1" />Creator</>}
                                    {member.id !== team.createdBy && 'Member'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Project Case */}
            {team.projectCase && (
                <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                        <Target className="w-4 h-4" />
                        Project Case
                    </div>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {team.projectCase}
                    </p>
                </div>
            )}

            {/* Kanban Board */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black tracking-tight uppercase">Project Board</h2>
                    {isMember && (
                        <button
                            onClick={() => {
                                setNewTaskStatus(TaskStatus.TODO);
                                setShowTaskModal(true);
                            }}
                            className="px-4 py-2 bg-primary text-black rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:scale-[1.05] transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Add Task
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { status: TaskStatus.TODO, label: 'To Do', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                        { status: TaskStatus.IN_PROGRESS, label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                        { status: TaskStatus.DONE, label: 'Done', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
                    ].map((column) => (
                        <div key={column.status} className="space-y-4">
                            <div className={cn("px-4 py-3 rounded-xl border", column.bg, column.border)}>
                                <div className="flex items-center justify-between">
                                    <h3 className={cn("text-sm font-black uppercase tracking-wider", column.color)}>
                                        {column.label}
                                    </h3>
                                    <span className="px-2 py-1 bg-black/20 rounded-full text-xs font-bold">
                                        {tasksByStatus[column.status as keyof typeof tasksByStatus].length}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 min-h-[200px]">
                                {tasksByStatus[column.status as keyof typeof tasksByStatus].map((task: any) => (
                                    <div key={task.id} className="glass-card p-4 rounded-xl border-white/5 space-y-3 group">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-bold text-sm">{task.title}</p>
                                            {isMember && (
                                                <button
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded transition-all"
                                                >
                                                    <Trash2 className="w-3 h-3 text-red-400" />
                                                </button>
                                            )}
                                        </div>
                                        {task.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                                        )}
                                        {task.assignee && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[8px] font-bold">
                                                    {task.assignee.image ? (
                                                        <img src={task.assignee.image} alt="" className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        task.assignee.name?.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <span className="text-xs text-muted-foreground">{task.assignee.name}</span>
                                            </div>
                                        )}
                                        {isMember && column.status !== TaskStatus.DONE && (
                                            <button
                                                onClick={() => handleMoveTask(
                                                    task.id,
                                                    column.status === TaskStatus.TODO ? TaskStatus.IN_PROGRESS : TaskStatus.DONE
                                                )}
                                                className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                                            >
                                                Move to {column.status === TaskStatus.TODO ? 'In Progress' : 'Done'} →
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Team Artifacts */}
            <div className="glass-panel rounded-[2.5rem] border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-lg font-black uppercase tracking-widest">Shared Artifacts</h3>
                    <Link href="/dashboard/artifacts" className="text-xs font-bold text-primary hover:underline">
                        View All
                    </Link>
                </div>
                <div className="divide-y divide-white/5">
                    {team.artifacts?.slice(0, 5).map((artifact: any) => (
                        <div key={artifact.id} className="p-5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                <Box className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-grow">
                                <p className="font-bold text-sm">{artifact.title}</p>
                                <p className="text-xs text-muted-foreground">{artifact.status}</p>
                            </div>
                        </div>
                    ))}
                    {(!team.artifacts || team.artifacts.length === 0) && (
                        <div className="p-10 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest">
                            No team artifacts yet
                        </div>
                    )}
                </div>
            </div>

            {/* Mentor Reviews */}
            {team.reviews && team.reviews.length > 0 && (
                <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-6">
                    <h3 className="text-lg font-black uppercase tracking-widest">Mentor Reviews</h3>
                    <div className="space-y-4">
                        {team.reviews.map((review: any) => (
                            <div key={review.id} className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold">{review.mentor.name}</p>
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                        review.status === ReviewStatus.APPROVED ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                            review.status === ReviewStatus.CHANGES_REQUESTED ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                                "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                    )}>
                                        {review.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{review.feedback}</p>
                                <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* QR Modal */}
            {showQRModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowQRModal(false)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>

                        <div className="text-center space-y-6">
                            <h2 className="text-2xl font-bold tracking-tight">Invite to Team</h2>

                            {team.qrCodeData && (
                                <div className="bg-white p-4 rounded-2xl inline-block">
                                    <img src={team.qrCodeData} alt="Team QR Code" className="w-48 h-48" />
                                </div>
                            )}

                            <div className="space-y-2">
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Team Code</p>
                                <div className="inline-flex items-center gap-2 px-6 py-3 bg-black border-2 border-primary rounded-xl">
                                    <span className="text-2xl font-black tracking-widest font-mono text-primary">
                                        {team.teamCode}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Task Modal */}
            {showTaskModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowTaskModal(false)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>

                        <h2 className="text-2xl font-bold tracking-tight mb-6">Create Task</h2>

                        <form onSubmit={handleCreateTask} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Title</label>
                                <input
                                    name="title"
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 focus:outline-none transition-colors"
                                    placeholder="Task title"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</label>
                                <textarea
                                    name="description"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 focus:outline-none transition-colors min-h-[100px]"
                                    placeholder="Task description (optional)"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-primary text-black font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity"
                            >
                                Create Task
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowReviewModal(false)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>

                        <h2 className="text-2xl font-bold tracking-tight mb-6">Add Review</h2>

                        <form onSubmit={handleCreateReview} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Feedback</label>
                                <textarea
                                    name="feedback"
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 focus:outline-none transition-colors min-h-[150px]"
                                    placeholder="Provide detailed feedback..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</label>
                                <select
                                    name="status"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 focus:outline-none transition-colors"
                                >
                                    <option value={ReviewStatus.APPROVED}>Approved</option>
                                    <option value={ReviewStatus.CHANGES_REQUESTED}>Changes Requested</option>
                                    <option value={ReviewStatus.PENDING}>Pending</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-primary text-black font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity"
                            >
                                Submit Review
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
