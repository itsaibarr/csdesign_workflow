
'use client';

import { useState } from 'react';
import ToolCard from '@/components/tools/ToolCard';
import { approveTool, rejectTool } from '../actions';
import { Check, X, Loader2 } from 'lucide-react';
import { ToolCategory, ToolUsageStatus } from '@prisma/client';

type Props = {
    tools: any[];
};

export default function ToolAdminClient({ tools }: Props) {
    const [processing, setProcessing] = useState<string | null>(null);

    const handleApprove = async (id: string) => {
        setProcessing(id);
        const res = await approveTool(id);
        if (!res.success) {
            console.error("Failed to approve tool.");
        }
        setProcessing(null);
    };

    const handleReject = async (id: string) => {
        setProcessing(id);
        const res = await rejectTool(id);
        if (!res.success) {
            console.error("Failed to reject tool.");
        }
        setProcessing(null);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.length === 0 && (
                <div className="col-span-full py-20 text-center text-muted-foreground">
                    <p className="text-xl font-bold uppercase tracking-widest">All caught up!</p>
                    <p>No new tools to review.</p>
                </div>
            )}

            {tools.map(tool => (
                <ToolCard
                    key={tool.id}
                    tool={{
                        ...tool,
                        _count: { artifactTools: 0 } // Default for admin view if not fetched
                    }}
                    actions={
                        <div className="flex gap-2 w-full pt-2">
                            <button
                                onClick={() => handleReject(tool.id)}
                                disabled={processing === tool.id}
                                className="flex-1 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all"
                            >
                                {processing === tool.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                Reject
                            </button>
                            <button
                                onClick={() => handleApprove(tool.id)}
                                disabled={processing === tool.id}
                                className="flex-1 px-4 py-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all"
                            >
                                {processing === tool.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Approve
                            </button>
                        </div>
                    }
                />
            ))}
        </div>
    );
}
