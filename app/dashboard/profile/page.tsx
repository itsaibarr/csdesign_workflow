import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Box, Activity, Clock, Zap, Users, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Artifact, Reflection } from '@prisma/client';
import ProfileHeaderClient from './profile-header-client';
import HobbySectionClient from './hobby-section-client';

export default async function ProfilePage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect('/login');
    }

    const userData = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            team: true,
            hobbies: true,
            artifacts: {
                include: {
                    reflection: true,
                    // Include tool usages to calculate unique tools
                    artifactTools: {
                        include: {
                            tool: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 5
            },
            _count: {
                select: {
                    artifacts: true,
                    comments: true,
                }
            }
        }
    });

    if (!userData) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">User profile not found.</p>
            </div>
        );
    }

    // Calculate total time saved from reflections
    const reflections = await prisma.reflection.findMany({
        where: {
            artifact: {
                userId: userData.id
            }
        }
    });
    const totalTimeSaved = reflections.reduce((acc: number, curr: Reflection) => acc + (curr.timeSavedMinutes || 0), 0);

    // Calculate unique tools involved
    const uniqueTools = new Set<string>();
    userData.artifacts.forEach(artifact => {
        artifact.artifactTools.forEach(usage => uniqueTools.add(usage.toolId));
    });
    const involvedToolsCount = uniqueTools.size;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Interactive Profile Header */}
            <ProfileHeaderClient user={userData} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Grid */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                            { label: 'Artifacts', value: userData._count.artifacts, icon: Box, color: 'text-primary' },
                            { label: 'Time Saved', value: `${totalTimeSaved}m`, icon: Clock, color: 'text-blue-400' },
                            { label: 'Involved Tools', value: involvedToolsCount, icon: Activity, color: 'text-rose-400' },
                        ].map((stat, i) => (
                            <div key={i} className="glass-card p-6 rounded-[2rem] border-white/5 group hover:border-white/10 transition-all">
                                <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 transition-colors", `group-hover:${stat.color}`)}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <div className="text-2xl font-black tracking-tight">{stat.value}</div>
                                <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Engineering Feed / Latest Artifacts */}
                    <div className="glass-panel rounded-[2rem] p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                <Zap className="w-5 h-5 text-primary" />
                                Engineering Activity
                            </h2>
                            <Link href="/dashboard/artifacts" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">View All</Link>
                        </div>

                        <div className="space-y-4">
                            {userData.artifacts.length > 0 ? (
                                userData.artifacts.map((artifact) => (
                                    <div key={artifact.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0">
                                            <Box className="w-5 h-5" />
                                        </div>
                                        <div className="flex-grow space-y-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-sm tracking-wide">{artifact.title}</h3>
                                                <span className="text-[10px] text-muted-foreground">{new Date(artifact.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                                                    {artifact.type}
                                                </span>
                                                {artifact.reflection && (
                                                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-primary">
                                                        <Clock className="w-3 h-3" />
                                                        +{artifact.reflection.timeSavedMinutes}m saved
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center space-y-2">
                                    <Box className="w-12 h-12 text-white/5 mx-auto" />
                                    <p className="text-sm text-muted-foreground">No recent engineering activity recorded.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Team Section */}
                    <div className="glass-panel rounded-[2rem] p-6 space-y-6">
                        <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-400" />
                            Assigned Team
                        </h2>
                        {userData.team ? (
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-2">
                                    <h3 className="font-bold text-blue-400">{userData.team.name}</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{userData.team.goal || 'No objective defined for this node.'}</p>
                                </div>
                                <Link href="/dashboard/team" className="block w-full text-center py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                                    Open Team Space
                                </Link>
                            </div>
                        ) : (
                            <div className="p-6 text-center space-y-4 rounded-2xl border-2 border-dashed border-white/5">
                                <Users className="w-10 h-10 text-white/5 mx-auto" />
                                <p className="text-xs text-muted-foreground">Not assigned to any collaboration unit.</p>
                                <button className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">Request Assignment</button>
                            </div>
                        )}
                    </div>

                    {/* Interactive Hobbies Section */}
                    <HobbySectionClient hobbies={userData.hobbies} />

                    {/* Security Info (Static for now, but wired to data if present) */}
                    <div className="glass-panel rounded-[2rem] p-6 bg-gradient-to-br from-background to-white/[0.01]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <Shield className="w-4 h-4" />
                            </div>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/80">Access Integrity</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
                                <span className="text-muted-foreground">ID Status</span>
                                <span className="text-emerald-500">Verified</span>
                            </div>
                            <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
                                <span className="text-muted-foreground">Email Verified</span>
                                <span className={userData.emailVerified ? "text-emerald-500" : "text-amber-500"}>
                                    {userData.emailVerified ? 'Confirmed' : 'Pending'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
