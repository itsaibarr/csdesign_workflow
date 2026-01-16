import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function MentorStudentsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.email) redirect('/login');

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true }
    });

    if (user?.role !== 'MENTOR') {
        redirect('/dashboard');
    }

    const students = await prisma.user.findMany({
        where: { mentorId: user.id },
        include: {
            team: true,
            UserNodeProgress: {
                include: { node: true }
            }
        }
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-medium tracking-tight text-white mb-2">My Students</h1>
                <p className="text-muted-foreground">Managing {students.length} students.</p>
            </div>

            <div className="rounded-[2rem] border border-white/5 bg-white/[0.01] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Student</th>
                            <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Team</th>
                            <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Stage</th>
                            <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {students.map(student => {
                            const currentProgress = student.UserNodeProgress?.find((p: any) => p.status === 'IN_PROGRESS');
                            const stage = currentProgress?.node.title || "Not Started";

                            return (
                                <tr key={student.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                                                {student.name[0]}
                                            </div>
                                            <span className="font-medium text-white">{student.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-sm text-slate-400">{student.team?.name || "Unassigned"}</td>
                                    <td className="p-6 text-sm text-slate-400">{stage}</td>
                                    <td className="p-6 text-right">
                                        <Link href={`/dashboard/students/${student.id}`} className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">
                                            View Profile
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {students.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        No students found.
                    </div>
                )}
            </div>
        </div>
    );
}
