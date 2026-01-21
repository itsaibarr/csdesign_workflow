'use client'

import { useState } from 'react'
import { updateUserRole, assignUserToBranch } from '@/app/actions/admin'
import { Search, Shield, User, GraduationCap, School, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Branch = {
    id: string
    name: string
}

type UserWithData = {
    id: string
    name: string
    email: string
    image: string | null
    role: "STUDENT" | "MENTOR" | "ADMIN"
    branchId: string | null
}

export function UserManager({ users, branches }: { users: UserWithData[], branches: Branch[] }) {
    const [search, setSearch] = useState('')
    const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    )

    async function handleRoleChange(userId: string, newRole: string) {
        setLoadingIds(prev => new Set(prev).add(userId))
        try {
            await updateUserRole(userId, newRole)
        } finally {
            setLoadingIds(prev => {
                const next = new Set(prev)
                next.delete(userId)
                return next
            })
        }
    }

    async function handleBranchChange(userId: string, branchId: string) {
        setLoadingIds(prev => new Set(prev).add(userId))
        try {
            await assignUserToBranch(userId, branchId === 'NONE' ? null : branchId)
        } finally {
            setLoadingIds(prev => {
                const next = new Set(prev)
                next.delete(userId)
                return next
            })
        }
    }

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                <Search className="w-5 h-5 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-white w-full font-medium"
                />
            </div>

            <div className="space-y-3">
                {filteredUsers.map(user => (
                    <div key={user.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 group hover:bg-white/[0.04] transition-colors">

                        {/* User Info */}
                        <div className="flex items-center gap-4 w-full md:w-auto overflow-hidden">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center overflow-hidden shrink-0 border border-white/10">
                                {user.image ? (
                                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-lg font-bold text-slate-500">{user.name[0]}</span>
                                )}
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-white font-bold truncate">{user.name}</h3>
                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">

                            {/* Branch Selector */}
                            <div className="relative w-full sm:w-48">
                                <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10 pointer-events-none" />
                                <select
                                    value={user.branchId || 'NONE'}
                                    onChange={(e) => handleBranchChange(user.id, e.target.value)}
                                    disabled={loadingIds.has(user.id)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-primary/50 appearance-none cursor-pointer hover:border-white/20 transition-colors uppercase tracking-wide"
                                >
                                    <option value="NONE">No Branch</option>
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Role Selector */}
                            <div className="relative w-full sm:w-40">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                                    {loadingIds.has(user.id) ? (
                                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                    ) : user.role === 'ADMIN' ? (
                                        <Shield className="w-4 h-4 text-red-500" />
                                    ) : user.role === 'MENTOR' ? (
                                        <GraduationCap className="w-4 h-4 text-purple-500" />
                                    ) : (
                                        <User className="w-4 h-4 text-blue-500" />
                                    )}
                                </div>
                                <select
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                    disabled={loadingIds.has(user.id)}
                                    className={cn(
                                        "w-full pl-10 pr-4 py-2.5 bg-black/40 border rounded-xl text-xs font-bold focus:outline-none appearance-none cursor-pointer uppercase tracking-wide transition-colors",
                                        user.role === 'ADMIN' ? "text-red-400 border-red-500/20" :
                                            user.role === 'MENTOR' ? "text-purple-400 border-purple-500/20" :
                                                "text-blue-400 border-blue-500/20"
                                    )}
                                >
                                    <option value="STUDENT">Student</option>
                                    <option value="MENTOR">Mentor</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        No users found matching "{search}"
                    </div>
                )}
            </div>
        </div>
    )
}
