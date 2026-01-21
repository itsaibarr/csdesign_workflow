'use client';

import { useState, useTransition } from 'react';
import { updateNodeStatus } from '@/app/actions/mentor';
import { NodeStatus } from '@prisma/client';
import { Loader2, Lock, Unlock, CheckCircle, CircleDashed } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NodeStatusToggleProps {
    studentId: string;
    nodeId: string;
    initialStatus: NodeStatus;
}

export function NodeStatusToggle({ studentId, nodeId, initialStatus }: NodeStatusToggleProps) {
    const [status, setStatus] = useState<NodeStatus>(initialStatus);
    const [isPending, startTransition] = useTransition();

    const handleStatusChange = (newStatus: NodeStatus) => {
        setStatus(newStatus); // Optimistic update
        startTransition(async () => {
            try {
                await updateNodeStatus(studentId, nodeId, newStatus);
            } catch (error) {
                console.error("Failed to update status", error);
                setStatus(status); // Revert on error
                // Ideally show a toast here
            }
        });
    };

    const getStatusColor = (s: NodeStatus) => {
        switch (s) {
            case 'COMPLETED': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'IN_PROGRESS': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'AVAILABLE': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'LOCKED': return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
            default: return 'text-slate-500';
        }
    };

    const getIcon = (s: NodeStatus) => {
        switch (s) {
            case 'COMPLETED': return <CheckCircle className="w-3 h-3" />;
            case 'IN_PROGRESS': return <Loader2 className="w-3 h-3 animate-spin" />; // Or activity icon
            case 'AVAILABLE': return <Unlock className="w-3 h-3" />;
            case 'LOCKED': return <Lock className="w-3 h-3" />;
            default: return <CircleDashed className="w-3 h-3" />;
        }
    };

    return (
        <div className={cn(
            "relative inline-flex items-center gap-2 px-2 py-1 rounded-md border transition-all",
            getStatusColor(status)
        )}>
            {isPending ? <Loader2 className="w-3 h-3 animate-spin opacity-50" /> : getIcon(status)}

            <select
                disabled={isPending}
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as NodeStatus)}
                className="appearance-none bg-transparent text-[10px] font-bold uppercase tracking-widest cursor-pointer focus:outline-none pr-4"
            >
                <option value="LOCKED" className="bg-slate-900 text-slate-400">Locked</option>
                <option value="AVAILABLE" className="bg-slate-900 text-amber-500">Available</option>
                <option value="IN_PROGRESS" className="bg-slate-900 text-blue-500">In Progress</option>
                <option value="COMPLETED" className="bg-slate-900 text-green-500">Completed</option>
            </select>

            {/* Custom dropdown arrow if needed, but select default is fine for MVP */}
        </div>
    );
}
