'use client'

import { useState } from 'react'
import { assignMentorToStudent } from '@/app/actions/admin'
import { Users, ChevronRight, UserPlus, ArrowRight, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

type Student = {
    id: string
    name: string
    image: string | null
    email: string
}

type Mentor = {
    id: string
    name: string
    image: string | null
    email: string
    students: Student[]
}

export function MentorWorkloadManager({ mentors, unassignedStudents }: { mentors: Mentor[], unassignedStudents: Student[] }) {
    const [expandedMentorId, setExpandedMentorId] = useState<string | null>(null)
    const [transferringStudent, setTransferringStudent] = useState<Student | null>(null)
    const [targetMentorId, setTargetMentorId] = useState<string>('')
    const [loading, setLoading] = useState(false)

    async function handleTransfer() {
        if (!transferringStudent) return

        setLoading(true)
        try {
            await assignMentorToStudent(transferringStudent.id, targetMentorId || null) // Empty string means unassign
            setTransferringStudent(null)
            setTargetMentorId('')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8">

            {/* Unassigned Pool */}
            {unassignedStudents.length > 0 && (
                <div className="glass-card p-6 rounded-[2rem] border border-orange-500/20 bg-orange-500/[0.05]">
                    <h3 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2">
                        <UserPlus className="w-5 h-5" />
                        Unassigned Students ({unassignedStudents.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {unassignedStudents.map(student => (
                            <div key={student.id} className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-orange-500/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold">
                                        {student.name[0]}
                                    </div>
                                    <span className="text-sm font-medium text-white truncate">{student.name}</span>
                                </div>
                                <button
                                    onClick={() => setTransferringStudent(student)}
                                    className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Mentors List */}
            <div className="space-y-4">
                {mentors.map(mentor => (
                    <div key={mentor.id} className="glass-card rounded-[2rem] border border-white/5 bg-white/[0.01] overflow-hidden">

                        {/* Mentor Header */}
                        <div
                            onClick={() => setExpandedMentorId(expandedMentorId === mentor.id ? null : mentor.id)}
                            className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                                    {mentor.image ? <img src={mentor.image} className="w-full h-full object-cover rounded-2xl" /> : <Sparkles className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{mentor.name}</h3>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest">{mentor.students.length} Students Assigned</p>
                                </div>
                            </div>
                            <ChevronRight className={cn("w-5 h-5 text-slate-500 transition-transform", expandedMentorId === mentor.id && "rotate-90")} />
                        </div>

                        {/* Students List (Expanded) */}
                        {expandedMentorId === mentor.id && (
                            <div className="px-6 pb-6 pt-0 border-t border-white/5 animate-in slide-in-from-top-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                                    {mentor.students.map(student => (
                                        <div key={student.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                                                    {student.name[0]}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-bold text-white truncate">{student.name}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setTransferringStudent(student); }}
                                                className="p-2 rounded-lg hover:bg-white/10 text-slate-500 group-hover:text-white transition-colors"
                                                title="Reassign"
                                            >
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {mentor.students.length === 0 && (
                                        <p className="col-span-full text-center text-slate-500 text-sm py-4">No students assigned yet.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Transfer Modal / Overlay */}
            {transferringStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

                        <h3 className="text-xl font-bold text-white mb-2">Transfer Student</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            Reassigning <span className="text-white font-bold">{transferringStudent.name}</span> to a different mentor.
                        </p>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select New Mentor</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                                    value={targetMentorId}
                                    onChange={e => setTargetMentorId(e.target.value)}
                                >
                                    <option value="" className="bg-black text-slate-500">Unassign (Move to Pool)</option>
                                    {mentors.map(m => (
                                        <option key={m.id} value={m.id} className="bg-black text-white">{m.name} ({m.students.length} active)</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setTransferringStudent(null)}
                                    className="flex-1 py-3 rounded-xl font-bold text-sm bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleTransfer}
                                    disabled={loading}
                                    className="flex-1 py-3 rounded-xl font-bold text-sm bg-primary text-black hover:brightness-110 transition-colors flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Confirm Transfer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
