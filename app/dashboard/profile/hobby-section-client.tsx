'use client';

import { useState } from 'react';
import { Heart, Plus, X, Loader2, Trash2 } from 'lucide-react';
import { createHobby, deleteHobby } from '@/app/actions/profile';
import { useRouter } from 'next/navigation';

interface Hobby {
    id: string;
    name: string;
}

interface HobbySectionClientProps {
    hobbies: Hobby[];
}

export default function HobbySectionClient({ hobbies }: HobbySectionClientProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [newHobbyName, setNewHobbyName] = useState('');
    const router = useRouter();

    const handleCreate = async () => {
        if (!newHobbyName.trim()) return;
        setIsLoading(true);
        try {
            await createHobby({ name: newHobbyName });
            setNewHobbyName('');
            setIsAdding(false);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to add hobby");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this personal node?")) return;
        try {
            await deleteHobby(id);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to remove hobby");
        }
    };

    return (
        <div className="glass-panel rounded-[2rem] p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-400" />
                    Personal Nodes
                </h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {hobbies.length > 0 ? (
                    hobbies.map((hobby) => (
                        <div
                            key={hobby.id}
                            className="group relative px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-muted-foreground hover:border-rose-400/30 hover:text-rose-400 transition-all cursor-default pr-8"
                        >
                            {hobby.name}
                            <button
                                onClick={() => handleDelete(hobby.id)}
                                className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 hover:text-rose-500 transition-all"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-muted-foreground italic px-2">No personal interests indexed.</p>
                )}
            </div>

            {/* Add Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-sm bg-[#0F0F12] border border-white/10 rounded-[2rem] p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-lg font-bold tracking-tight mb-4">Add Personal Node</h3>

                        <div className="space-y-4">
                            <input
                                type="text"
                                value={newHobbyName}
                                onChange={(e) => setNewHobbyName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-rose-400/50 focus:ring-1 focus:ring-rose-400/50 outline-none transition-all placeholder:text-white/20"
                                placeholder="e.g. Scifi Literature"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            />

                            <button
                                onClick={handleCreate}
                                disabled={isLoading || !newHobbyName.trim()}
                                className="w-full py-3 rounded-xl bg-white/10 border border-white/5 text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Node'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
