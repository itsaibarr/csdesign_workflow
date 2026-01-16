'use client'

import { useState } from 'react'
import { acceptMentorship, rejectMentorship } from '@/app/actions/mentorship'
import { Check, X, Loader2, User } from 'lucide-react'

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
        <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.01] mb-8 animate-in slide-in-from-left-4 duration-500">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-light text-white">Pending Requests</h2>
                <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-1 rounded-full border border-blue-500/20">
                    {requests.length} New
                </span>
            </div>

            <div className="space-y-3">
                {requests.map(req => (
                    <div key={req.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10">
                                {req.student.image ? (
                                    <img src={req.student.image} alt={req.student.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5 text-slate-500" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">{req.student.name}</h3>
                                <p className="text-xs text-slate-500">{req.student.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleAccept(req.id)}
                                disabled={!!actionId}
                                className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors border border-green-500/20 disabled:opacity-50"
                                title="Accept Student"
                            >
                                {actionId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => handleReject(req.id)}
                                disabled={!!actionId}
                                className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors border border-red-500/20 disabled:opacity-50"
                                title="Reject Student"
                            >
                                {actionId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
