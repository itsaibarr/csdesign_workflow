'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Layers, Box, Users, Wrench, LogOut, Zap, User, Sparkles, FileText, CheckCircle, Activity } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface SideNavProps {
    role?: string;
}

export default function SideNav({ role = 'STUDENT' }: SideNavProps) {
    const pathname = usePathname();
    const { data: session } = authClient.useSession();

    const links = useMemo(() => {
        if (role === 'MENTOR') {
            return [
                { name: 'Overview', href: '/dashboard', icon: Home },
                { name: 'Students', href: '/dashboard/students', icon: Users },
                { name: 'Teams', href: '/dashboard/teams', icon: Box },
                { name: 'Reviews', href: '/dashboard/reviews', icon: FileText },
                { name: 'Profile', href: '/dashboard/profile', icon: User },
            ];
        }

        if (role === 'ADMIN') {
            return [
                { name: 'Overview', href: '/dashboard/admin', icon: Activity },
                { name: 'Branches', href: '/dashboard/admin/branches', icon: Layers },
                { name: 'Users', href: '/dashboard/admin/users', icon: Users },
                { name: 'Assignments', href: '/dashboard/admin/assignments', icon: Box },
                { name: 'Tools', href: '/dashboard/admin/tools', icon: Wrench },
            ];
        }

        // Default to Student
        return [
            { name: 'Overview', href: '/dashboard', icon: Home },
            { name: 'Courses', href: '/dashboard/courses', icon: Layers },
            { name: 'Artifacts', href: '/dashboard/artifacts', icon: Box },
            { name: 'Mentor', href: '/dashboard/mentor', icon: Sparkles },
            { name: 'Community', href: '/dashboard/team', icon: Users },
            { name: 'Resources', href: '/dashboard/tools', icon: Wrench },
            { name: 'Profile', href: '/dashboard/profile', icon: User },
        ];
    }, [role]);

    return (
        <div className="flex h-full flex-col glass-panel rounded-[2rem] overflow-hidden">
            <div className="flex h-24 items-center gap-3 px-8">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center glow-primary">
                    <Zap className="text-black w-6 h-6 fill-black" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-gradient">CSC Platform</h1>
            </div>

            <div className="flex-grow flex flex-col justify-between py-6 px-4">
                <nav className="space-y-2">
                    {links.map((link) => {
                        const LinkIcon = link.icon;

                        // More precise active detection
                        const isActive = pathname === link.href ||
                            (link.href !== '/dashboard' &&
                                link.href !== '/dashboard/admin' &&
                                pathname.startsWith(link.href + '/'));

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3.5 font-medium transition-all duration-300 rounded-2xl group",
                                    isActive
                                        ? "bg-primary text-black glow-primary"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <LinkIcon className={cn(
                                    "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                                    isActive ? "text-black" : "text-muted-foreground group-hover:text-primary"
                                )} />
                                <span className="text-sm tracking-wide">{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="space-y-4">
                    {session?.user && (
                        <Link
                            href="/dashboard/profile"
                            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary overflow-hidden">
                                {session.user.image ? (
                                    <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-4 h-4" />
                                )}
                            </div>
                            <div className="flex-grow overflow-hidden">
                                <p className="text-xs font-bold text-white truncate">{session.user.name}</p>
                                <p className="text-[10px] text-muted-foreground truncate uppercase tracking-tighter">
                                    {role === 'ADMIN' ? 'Admin Access' : role === 'MENTOR' ? 'Mentor Account' : 'Student Account'}
                                </p>
                            </div>
                        </Link>
                    )}

                    <button
                        onClick={async () => {
                            await authClient.signOut();
                            window.location.href = '/login';
                        }}
                        className="w-full flex items-center gap-3 px-4 py-4 font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all rounded-2xl group"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm uppercase tracking-widest font-bold">Disconnect</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
