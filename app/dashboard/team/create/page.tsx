'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, QrCode as QrCodeIcon } from 'lucide-react';
import { createTeam } from '@/app/actions/teams';
import Link from 'next/link';

export default function CreateTeamPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showQR, setShowQR] = useState(false);
    const [teamData, setTeamData] = useState<any>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            projectCase: formData.get('projectCase') as string || undefined,
            goal: formData.get('goal') as string || undefined
        };

        const result = await createTeam(data);

        if (result.error) {
            setError(result.error);
            setIsLoading(false);
        } else {
            setTeamData(result.team);
            setShowQR(true);
            setIsLoading(false);
        }
    }

    if (showQR && teamData) {
        return (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Link
                    href="/dashboard/team"
                    className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Teams
                </Link>

                <div className="glass-panel p-10 rounded-[3rem] border-white/5 text-center space-y-8">
                    <div className="space-y-2">
                        <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto border border-primary/20">
                            <Sparkles className="w-10 h-10 text-primary" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight">Team Created!</h1>
                        <p className="text-muted-foreground font-medium">
                            Share this QR code or team code with teammates to let them join.
                        </p>
                    </div>

                    {/* Team Info */}
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                        <h2 className="text-2xl font-black tracking-tight text-primary">{teamData.name}</h2>
                        {teamData.goal && (
                            <p className="text-sm text-muted-foreground">{teamData.goal}</p>
                        )}
                    </div>

                    {/* QR Code */}
                    {teamData.qrCodeData && (
                        <div className="bg-white p-6 rounded-2xl inline-block mx-auto">
                            <img src={teamData.qrCodeData} alt="Team QR Code" className="w-64 h-64" />
                        </div>
                    )}

                    {/* Team Code */}
                    <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Team Code
                        </p>
                        <div className="inline-flex items-center gap-2 px-8 py-4 bg-black border-2 border-primary rounded-2xl">
                            <span className="text-3xl font-black tracking-widest font-mono text-primary">
                                {teamData.teamCode}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Share this code with teammates
                        </p>
                    </div>

                    <button
                        onClick={() => router.push(`/dashboard/team/${teamData.id}`)}
                        className="w-full max-w-sm mx-auto py-4 bg-primary text-black rounded-2xl font-bold uppercase tracking-widest glow-primary hover:scale-[1.02] transition-all"
                    >
                        Go to Team Workspace
                    </button>
                </div>
            </div>
        );
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
                <h1 className="text-4xl font-extrabold tracking-tighter text-gradient">Create New Team</h1>
                <p className="text-muted-foreground font-medium">
                    Start a collaborative workspace for your project (weeks 9–12).
                </p>
            </div>

            <form onSubmit={handleSubmit} className="glass-panel p-10 rounded-[3rem] border-white/5 space-y-6">
                {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Team Name *
                    </label>
                    <input
                        name="name"
                        required
                        maxLength={50}
                        placeholder="e.g., AI Automation Squad"
                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 focus:outline-none transition-colors text-white placeholder:text-muted-foreground/50"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Project Goal
                    </label>
                    <textarea
                        name="goal"
                        rows={2}
                        maxLength={200}
                        placeholder="Brief description of your team's goal"
                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 focus:outline-none transition-colors text-white placeholder:text-muted-foreground/50 resize-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Project Case / Description
                    </label>
                    <textarea
                        name="projectCase"
                        rows={4}
                        maxLength={1000}
                        placeholder="Describe the problem you're solving or the project details..."
                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 focus:outline-none transition-colors text-white placeholder:text-muted-foreground/50 resize-none"
                    />
                </div>

                <div className="pt-4 space-y-3">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-5 bg-primary text-black rounded-2xl font-bold uppercase tracking-widest glow-primary hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                Creating Team...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Create Team
                            </>
                        )}
                    </button>

                    <p className="text-xs text-center text-muted-foreground">
                        You'll receive a QR code and team code to share with teammates (max 5 members).
                    </p>
                </div>
            </form>
        </div>
    );
}
