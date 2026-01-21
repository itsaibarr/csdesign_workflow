'use client'

import { useState } from 'react'
import { Plus, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
    isOpen: boolean
    onClose: () => void
}

export default function ToolSubmissionModal({ isOpen, onClose }: Props) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        url: '',
        shortDescription: '',
        category: 'OTHER',
        pricing: 'FREEMIUM'
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const res = await fetch('/api/tools/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (!res.ok) {
                if (data.error === 'duplicate') {
                    setError(`This tool already exists: "${data.existingTool.name}". Status: ${data.existingTool.status}`)
                } else {
                    setError(data.message || data.error || 'Failed to submit tool')
                }
                return
            }

            setSuccess(true)
            setTimeout(() => {
                onClose()
                setFormData({
                    name: '',
                    url: '',
                    shortDescription: '',
                    category: 'OTHER',
                    pricing: 'FREEMIUM'
                })
                setSuccess(false)
            }, 2000)

        } catch (err) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
        >
            <div
                className="glass-panel p-8 rounded-[2.5rem] border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-[101]"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight mb-2">
                            Suggest a <span className="text-primary italic">Tool</span>
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Share a tool that helped you. Admins will review it before adding to the library.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Tool Name */}
                    <div>
                        <label className="block text-sm font-bold text-white mb-2">
                            Tool Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Claude, Cursor, Notion"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none transition-colors"
                        />
                    </div>

                    {/* URL */}
                    <div>
                        <label className="block text-sm font-bold text-white mb-2">
                            Website URL *
                        </label>
                        <input
                            type="url"
                            required
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            placeholder="https://example.com"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-white mb-2">
                            Short Description *
                        </label>
                        <textarea
                            required
                            value={formData.shortDescription}
                            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                            placeholder="Briefly describe what this tool does and why it's useful..."
                            rows={3}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none transition-colors resize-none"
                        />
                    </div>

                    {/* Category & Pricing */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-white mb-2">
                                Category
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary/50 focus:outline-none transition-colors"
                            >
                                <option value="LLM">LLM</option>
                                <option value="IDE">IDE</option>
                                <option value="AUTOMATION">Automation</option>
                                <option value="DESIGN">Design</option>
                                <option value="SECURITY">Security</option>
                                <option value="RESEARCH">Research</option>
                                <option value="PRODUCTIVITY">Productivity</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-white mb-2">
                                Pricing
                            </label>
                            <select
                                value={formData.pricing}
                                onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary/50 focus:outline-none transition-colors"
                            >
                                <option value="FREE">Free</option>
                                <option value="FREEMIUM">Freemium</option>
                                <option value="PAID">Paid</option>
                                <option value="TRIAL">Trial</option>
                            </select>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl space-y-2">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-green-400 font-bold">Tool submitted successfully!</p>
                                    <p className="text-xs text-green-400/80 mt-1">
                                        Admins will review it soon. Track the status in <span className="font-bold underline">My Submissions</span>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            "w-full px-6 py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                            loading
                                ? "bg-white/5 text-muted-foreground cursor-not-allowed"
                                : "bg-primary hover:bg-primary/90 text-black shadow-[0_0_20px_-5px_var(--primary)]"
                        )}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Plus className="w-5 h-5" />
                                Submit Tool
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
