import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import MentorChat from './MentorChat';

export default async function MentorPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            UserNodeProgress: {
                include: {
                    node: true
                }
            }
        }
    });

    const currentProgress = user?.UserNodeProgress.find(p => p.status === 'IN_PROGRESS')
        || user?.UserNodeProgress.filter(p => p.status === 'COMPLETED').sort((a, b) => b.node.order - a.node.order)[0]
        || user?.UserNodeProgress.find(p => p.status === 'AVAILABLE');

    const currentStageName = currentProgress?.node.title || "The Foundation";

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Back to Mission Control</span>
                </Link>
                <div className="px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(var(--primary),0.1)]">
                    <Sparkles className="w-3 h-3 animate-pulse" />
                    Mentor AI Sequence Active
                </div>
            </div>

            <div className="space-y-2">
                <h1 className="text-5xl font-black tracking-tighter uppercase transition-all">
                    AI Mentor <span className="text-primary italic">Assistant</span>
                </h1>
                <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-2xl">
                    Get guidance, technical clarification, or planning help for your current stage.
                </p>
            </div>

            <MentorChat currentStageName={currentStageName} />
        </div>
    );
}
