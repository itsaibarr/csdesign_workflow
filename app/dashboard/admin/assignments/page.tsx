import { prisma } from '@/lib/prisma';
import { MentorWorkloadManager } from '@/components/dashboard/admin/MentorWorkloadManager';
import { Component } from 'lucide-react';

export default async function AdminAssignmentsPage() {

    const [mentors, unassignedStudents] = await Promise.all([
        prisma.user.findMany({
            where: { role: 'MENTOR' },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                mentoredStudents: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        email: true
                    }
                }
            }
        }),
        prisma.user.findMany({
            where: {
                role: 'STUDENT',
                mentorId: null
            },
            select: {
                id: true,
                name: true,
                image: true,
                email: true
            }
        })
    ]);

    // Map mentors to match component interface
    const formattedMentors = mentors.map(m => ({
        ...m,
        students: m.mentoredStudents
    }));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary/80 font-bold uppercase tracking-[0.2em] text-[10px]">
                        <Component className="w-3 h-3" />
                        Resource Allocation
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                        Mentor <span className="text-primary italic">Assignments</span>
                    </h1>
                </div>
            </header>

            <MentorWorkloadManager mentors={formattedMentors} unassignedStudents={unassignedStudents} />
        </div>
    );
}
