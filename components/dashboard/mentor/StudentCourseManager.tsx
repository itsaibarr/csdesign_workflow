'use client';

import { useState } from 'react';
import { NodeStatusToggle } from './NodeStatusToggle';
import { X, Settings } from 'lucide-react';
import { NodeStatus } from '@prisma/client';

interface CourseNode {
    id: string;
    title: string;
    weekRange: string;
    order: number;
}

interface UserNodeProgress {
    id: string;
    nodeId: string;
    status: NodeStatus;
    node: CourseNode;
}

interface StudentCourseManagerProps {
    studentId: string;
    studentName: string;
    progress: UserNodeProgress[];
}

export function StudentCourseManager({ studentId, studentName, progress }: StudentCourseManagerProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Ensure nodes are sorted
    const sortedProgress = [...progress].sort((a, b) => a.node.order - b.node.order);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-2"
            >
                <Settings className="w-3 h-3" />
                Manage Access
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-6 m-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white">Manage Course Access</h3>
                        <p className="text-sm text-slate-400">For {studentName}</p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {sortedProgress.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">No course nodes found for this student.</p>
                    ) : (
                        sortedProgress.map((p) => (
                            <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                <div>
                                    <p className="text-sm font-bold text-white">{p.node.title}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Week {p.node.weekRange}</p>
                                </div>
                                <NodeStatusToggle
                                    studentId={studentId}
                                    nodeId={p.nodeId}
                                    initialStatus={p.status}
                                />
                            </div>
                        ))
                    )}
                </div>

                <div className="pt-4 border-t border-white/5 text-center">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                    >
                        Close Manager
                    </button>
                </div>
            </div>
        </div>
    );
}
