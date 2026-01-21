'use client'

import { useState } from 'react'
import { createBranch, toggleBranchActive } from '@/app/actions/admin'
import { Plus, MapPin, Power, Loader2, School } from 'lucide-react'
import { cn } from '@/lib/utils'

type Branch = {
    id: string
    name: string
    location: string | null
    active: boolean
    _count: {
        users: number
    }
}

export function BranchManager({ initialBranches }: { initialBranches: Branch[] }) {
    const [branches, setBranches] = useState(initialBranches)
    const [isCreating, setIsCreating] = useState(false)
    const [newBranchName, setNewBranchName] = useState('')
    const [newLocation, setNewLocation] = useState('')

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        setIsCreating(true)
        try {
            await createBranch({ name: newBranchName, location: newLocation })
            // Basic heuristic update or wait for server revalidation which happens automatically with server actions + router refresh
            // But for instant feedback let's just clear form
            setNewBranchName('')
            setNewLocation('')
            // In a real app we might rely on router.refresh() 
        } finally {
            setIsCreating(false)
        }
    }

    async function handleToggle(id: string, current: boolean) {
        await toggleBranchActive(id, !current)
    }

    return (
        <div className="space-y-8">
            <div className="glass-card p-8 rounded-[2rem] border border-white/5 bg-white/[0.01]">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" />
                    Deploy New Branch
                </h2>
                <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Branch Name</label>
                        <input
                            type="text"
                            required
                            value={newBranchName}
                            onChange={e => setNewBranchName(e.target.value)}
                            placeholder="e.g. Downtown Hub"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                    <div className="flex-1 w-full space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location / ID</label>
                        <input
                            type="text"
                            value={newLocation}
                            onChange={e => setNewLocation(e.target.value)}
                            placeholder="e.g. NYC-01"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isCreating}
                        className="bg-primary text-black px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50 min-w-[140px] flex items-center justify-center"
                    >
                        {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create'}
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {branches.map(branch => (
                    <div key={branch.id} className={cn(
                        "p-6 rounded-[2rem] border transition-all flex flex-col justify-between group h-full min-h-[180px]",
                        branch.active
                            ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                            : "bg-red-500/[0.02] border-red-500/10 opacity-70"
                    )}>
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2.5 rounded-xl bg-slate-800/50 border border-white/10">
                                    <School className={cn("w-5 h-5", branch.active ? "text-slate-400" : "text-red-400")} />
                                </div>
                                <button
                                    onClick={() => handleToggle(branch.id, branch.active)}
                                    className={cn(
                                        "p-2 rounded-lg transition-colors",
                                        branch.active ? "text-green-500 hover:bg-green-500/10" : "text-slate-500 hover:text-white"
                                    )}
                                    title={branch.active ? "Deactivate" : "Activate"}
                                >
                                    <Power className="w-4 h-4" />
                                </button>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">{branch.name}</h3>
                            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                <MapPin className="w-4 h-4" />
                                {branch.location || "No Location"}
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Population</span>
                            <span className="text-white font-bold">{branch._count.users} Users</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
