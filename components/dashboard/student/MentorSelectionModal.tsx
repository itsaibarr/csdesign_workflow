'use client'

import { useState, useEffect } from 'react'
import { getAvailableMentors, requestMentorship } from '@/app/actions/mentorship'
import { User } from 'lucide-react'
import { Loader2 } from 'lucide-react'

// Simple type for UI
type MentorProfile = {
    id: string
    name: string
    image: string | null
    email: string
}

export function MentorSelectionModal({ existingRequestStatus }: { existingRequestStatus?: string }) {
    const [mentors, setMentors] = useState<MentorProfile[]>([])
    const [selectedMentor, setSelectedMentor] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [status, setStatus] = useState<string | undefined>(existingRequestStatus)

    useEffect(() => {
        async function fetchMentors() {
            try {
                const data = await getAvailableMentors()
                setMentors(data)
            } catch (err) {
                setError("Failed to load mentors")
            } finally {
                setLoading(false)
            }
        }
        fetchMentors()
    }, [])

    async function handleRequest() {
        if (!selectedMentor) return
        setSubmitting(true)
        const result = await requestMentorship(selectedMentor)
        if (result.success) {
            setStatus('PENDING')
        } else {
            setError(result.message)
        }
        setSubmitting(false)
    }

    // If waiting for approval, show distinct state
    if (status === 'PENDING') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Application Sent</h2>
                    <p className="text-slate-400">
                        Your request has been sent to the mentor. Please wait for them to accept your application.
                        You will be notified here once approved.
                    </p>
                    <div className="pt-4">
                        <span className="inline-block px-4 py-2 rounded-full bg-white/5 text-slate-500 text-sm border border-white/5">
                            Status: Pending Approval
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    // If no request and not assigned, show selection
    if (loading) return null // Or a loader, but main page handles generic loading usually

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-500">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />

                <h1 className="text-3xl font-black text-white mb-2">Select Your Mentor</h1>
                <p className="text-slate-400 mb-8">
                    Choose a mentor to guide you through your journey. This choice will define your team and tailored feedback.
                </p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {mentors.map(mentor => (
                        <button
                            key={mentor.id}
                            onClick={() => setSelectedMentor(mentor.id)}
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left group ${selectedMentor === mentor.id
                                    ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500'
                                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                                }`}
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-white/10">
                                {mentor.image ? (
                                    <img src={mentor.image} alt={mentor.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-6 h-6 text-slate-500" />
                                )}
                            </div>
                            <div>
                                <h3 className={`font-bold ${selectedMentor === mentor.id ? 'text-blue-400' : 'text-white group-hover:text-white'}`}>
                                    {mentor.name}
                                </h3>
                                <p className="text-xs text-slate-500 truncate max-w-[150px]">{mentor.email}</p>
                            </div>
                            {selectedMentor === mentor.id && (
                                <div className="ml-auto w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleRequest}
                        disabled={!selectedMentor || submitting}
                        className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {submitting ? 'Sending Request...' : 'Apply for Mentorship'}
                    </button>
                </div>
            </div>
        </div>
    )
}
