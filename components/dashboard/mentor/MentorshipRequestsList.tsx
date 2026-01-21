'use client'

import { useState } from 'react'
import { acceptMentorship, rejectMentorship } from '@/app/actions/mentorship'
import { Check, X, Loader2, User, MessageSquarePlus } from 'lucide-react'

type RequestWithStudent = {
    id: string
    student: {
        id: string
        name: string
        email: string
        image: string | null
    }
    createdAt: Date
}

export function MentorshipRequestsList({ requests }: { requests: RequestWithStudent[] }) {
    const [actionId, setActionId] = useState<string | null>(null)

    async function handleAccept(id: string) {
        setActionId(id)
        await acceptMentorship(id)
        setActionId(null)
    }

    async function handleReject(id: string) {
        setActionId(id)
        await rejectMentorship(id)
        setActionId(null)
    }

    if (requests.length === 0) return null

    return (
        <div className="glass-card p-8 rounded-[2.5rem] border border-amber-500/20 bg-amber-500/[0.02] mb-8 animate-in slide-in-from-left-4 duration-700 relative overflow-hidden">
            {/* Ambient Background Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                        <MessageSquarePlus className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-white uppercase">Incoming Transmissions</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Pending Mentorship Requests</p>
                    </div>
                </div>
                <div className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest animate-pulse">
                    {requests.length} Active
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                {requests.map(req => (
                    <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-3xl bg-black/40 border border-white/5 hover:border-amber-500/30 transition-colors gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                                {req.student.image ? (
                                    <img src={req.student.image} alt={req.student.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-6 h-6 text-slate-500" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-base">{req.student.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold bg-white/5 px-2 py-0.5 rounded-md">
                                        Student
                                    </span>
                                    <span className="text-xs text-slate-500">{req.student.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                            <div className="flex-1 sm:flex-initial grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleReject(req.id)}
                                    disabled={!!actionId}
                                    className="px-4 py-2.5 rounded-xl bg-white/[0.02] text-slate-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all border border-white/10 disabled:opacity-50 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                                >
                                    {actionId === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                                    Ignore
                                </button>
                                <button
                                    onClick={() => handleAccept(req.id)}
                                    disabled={!!actionId}
                                    className="px-6 py-2.5 rounded-xl bg-white text-black hover:bg-amber-400 transition-colors disabled:opacity-50 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(251,191,36,0.4)]"
                                >
                                    {actionId === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                    Approve
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
