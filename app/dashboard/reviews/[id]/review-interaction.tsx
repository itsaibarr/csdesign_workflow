'use client'

import { useState } from 'react'
import { reviewArtifact } from '@/app/actions/operational'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function ReviewInteraction({ artifactId }: { artifactId: string }) {
    const [feedback, setFeedback] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const handleReview = async (status: 'VALIDATED' | 'NEEDS_IMPROVEMENT') => {
        if (status === 'NEEDS_IMPROVEMENT' && !feedback.trim()) {
            alert("Please provide feedback when requesting changes.")
            return
        }

        setIsSubmitting(true)
        try {
            const result = await reviewArtifact(artifactId, status, feedback)
            if (result.success) {
                router.push('/dashboard/reviews')
                router.refresh()
            } else {
                alert(result.message || "Something went wrong")
            }
        } catch (error) {
            console.error(error)
            alert("An error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-white font-medium">
                Mentor Feedback
            </div>

            <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Guiding Principle</h4>
                <p className="text-xs text-primary/80 leading-relaxed">
                    Don't provide solutions. Ask <strong>reflective questions</strong> that help the student discover the answer.
                </p>
            </div>

            <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Question / Feedback</label>
                <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none disabled:opacity-50"
                    placeholder="e.g., 'Why did you choose this specific tool over the others?' or 'How does this solution handle edge cases?'"
                    disabled={isSubmitting}
                />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                <button
                    onClick={() => handleReview('NEEDS_IMPROVEMENT')}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="text-amber-500">Request Changes</span>}
                </button>
                <button
                    onClick={() => handleReview('VALIDATED')}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary hover:bg-primary/90 text-black font-bold text-xs uppercase tracking-widest transition-colors glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Approve"}
                </button>
            </div>
        </div>
    )
}
