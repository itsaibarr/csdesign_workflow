import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import { prisma } from '@/lib/prisma';
import StudentDashboard from '@/components/dashboard/student/StudentDashboard';
import MentorDashboard from '@/components/dashboard/mentor/MentorDashboard';
import { redirect } from 'next/navigation';

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.email) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true }
    });

    if (!user) return null;

    if (user.role === 'ADMIN') {
        redirect('/dashboard/admin');
    }

    if (user.role === 'MENTOR') {
        return <MentorDashboard />;
    }

    return <StudentDashboard />;
}
