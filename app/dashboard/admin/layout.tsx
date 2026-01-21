import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.email) redirect('/login');

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {children}
        </div>
    );
}
