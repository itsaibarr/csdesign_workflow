import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { CheckCircle, Clock, XCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function MySubmissionsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.email) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });

    if (!user) {
        redirect('/login');
    }

    // Fetch tools submitted by this user
    const mySubmissions = await prisma.tool.findMany({
        where: {
            submittedById: user.id
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMMUNITY_APPROVED':
            case 'COURSE_OFFICIAL':
                return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'PENDING_REVIEW':
                return <Clock className="w-5 h-5 text-yellow-400" />;
            case 'AI_DISCOVERED':
                return <Sparkles className="w-5 h-5 text-cyan-400" />;
            case 'REJECTED':
                return <XCircle className="w-5 h-5 text-red-400" />;
            default:
                return <Clock className="w-5 h-5 text-muted-foreground" />;
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'COMMUNITY_APPROVED':
            case 'COURSE_OFFICIAL':
                return 'bg-green-500/10 border-green-500/20 text-green-400';
            case 'PENDING_REVIEW':
                return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
            case 'AI_DISCOVERED':
                return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
            case 'REJECTED':
                return 'bg-red-500/10 border-red-500/20 text-red-400';
            default:
                return 'bg-white/5 border-white/10 text-white';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary/80 font-bold uppercase tracking-[0.2em] text-[10px]">
                        <Sparkles className="w-3 h-3" />
                        Your Contributions
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                        My <span className="text-primary italic">Submissions</span>
                    </h1>
                    <p className="text-muted-foreground font-medium text-sm mt-2">
                        Track the status of tools you've submitted to the CSC library.
                    </p>
                </div>
            </header>

            {/* Submissions List */}
            {mySubmissions.length === 0 ? (
                <div className="glass-panel p-12 rounded-[3rem] border-white/5 text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-muted-foreground mx-auto mb-6">
                        <Sparkles className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">No Submissions Yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        You haven't submitted any tools yet. Share a tool that helped you improve your workflow!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {mySubmissions.map((tool) => (
                        <div
                            key={tool.id}
                            className="glass-panel p-6 rounded-[2rem] border-white/5 hover:border-white/10 transition-all"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-grow space-y-3">
                                    {/* Tool Name & Status */}
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h3 className="text-xl font-black text-white">{tool.name}</h3>
                                        <div className={cn(
                                            "px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5",
                                            getStatusStyles(tool.usageStatus)
                                        )}>
                                            {getStatusIcon(tool.usageStatus)}
                                            {tool.usageStatus.replace('_', ' ')}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {tool.shortDescription}
                                    </p>

                                    {/* URL */}
                                    {tool.url && (
                                        <a
                                            href={tool.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-primary hover:underline inline-block"
                                        >
                                            {tool.url}
                                        </a>
                                    )}

                                    {/* Meta Info */}
                                    <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                                        <span className="px-2 py-1 bg-white/5 rounded-md">
                                            {tool.category}
                                        </span>
                                        <span className="px-2 py-1 bg-white/5 rounded-md">
                                            {tool.pricing}
                                        </span>
                                        <span className="px-2 py-1 bg-white/5 rounded-md">
                                            Submitted {new Date(tool.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
