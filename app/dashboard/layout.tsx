import SideNav from '@/app/ui/dashboard/sidenav';
import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.email) {
        // Let page handle redirect, or do it here. 
        // Page.tsx handles it, but layout wraps page. 
        // Safe to redirect here if needed, but let's just pass null role if no session 
        // (though dashboard usually requires auth).
        // Actually, if no session, we probably shouldn't show layout content?
        // Let's assume middleware or page-level auth handles strict protection.
    }

    let userRole = 'STUDENT';
    if (session?.user?.email) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true }
        });
        if (user?.role) {
            userRole = user.role;
        }
    }

    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-background">
            <div className="w-full flex-none md:w-72 p-4">
                <SideNav role={userRole} />
            </div>
            <div className="flex-grow p-4 md:overflow-y-auto">
                <main className="h-full w-full glass-panel rounded-[2rem] p-8 md:p-12 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
