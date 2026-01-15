'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LogIn, QrCode, Keyboard } from 'lucide-react';
import { joinTeamByCode } from '@/app/actions/teams';
import Link from 'next/link';

export default function JoinTeamPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [mode, setMode] = useState<'code' | 'qr'>('code');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const teamCode = formData.get('teamCode') as string;

        const result = await joinTeamByCode(teamCode);

        if (result.error) {
            setError(result.error);
            setIsLoading(false);
        } else {
            router.push(`/dashboard/team/${result.teamId}`);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Link
                href="/dashboard/team"
                className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Teams
            </Link>

            <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tighter text-gradient">Join Team</h1>
                <p className="text-muted-foreground font-medium">
                    Enter a team code to join an existing team.
                </p>
            </div>

            {/* Mode Selector */}
            <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 gap-1 max-w-md mx-auto">
                <button
                    onClick={() => setMode('code')}
                    className={`flex-1 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${mode === 'code'
                            ? 'bg-primary text-black'
                            : 'text-muted-foreground hover:text-white'
                        }`}
                >
                    <Keyboard className="w-4 h-4" />
                    Team Code
                </button>
                <button
                    onClick={() => setMode('qr')}
                    className={`flex-1 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${mode === 'qr'
                            ? 'bg-primary text-black'
                            : 'text-muted-foreground hover:text-white'
                        }`}
                >
                    <QrCode className="w-4 h-4" />
                    QR Code
                </button>
            </div>

            <div className="glass-panel p-10 rounded-[3rem] border-white/5">
                {mode === 'code' ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                Enter 6-Character Team Code
                            </label>
                            <input
                                name="teamCode"
                                required
                                maxLength={6}
                                pattern="[A-Za-z0-9]{6}"
                                placeholder="e.g., ABC123"
                                className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 focus:outline-none transition-colors text-white placeholder:text-muted-foreground/50 text-center text-2xl font-bold tracking-widest uppercase font-mono"
                                style={{ letterSpacing: '0.5em' }}
                            />
                            <p className="text-xs text-center text-muted-foreground">
                                Get the code from a team member
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 bg-primary text-black rounded-2xl font-bold uppercase tracking-widest glow-primary hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    Joining...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Join Team
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="text-center space-y-6 py-10">
                        <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto border border-white/10 border-dashed">
                            <QrCode className="w-10 h-10 text-muted-foreground/50" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xl font-bold">QR Scanner Coming Soon</p>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                QR code scanning will be available in the next update. For now, please use the team code to join.
                            </p>
                        </div>
                        <button
                            onClick={() => setMode('code')}
                            className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                        >
                            Use Team Code Instead
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
