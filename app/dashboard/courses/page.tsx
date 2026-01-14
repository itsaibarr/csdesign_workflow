import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { BookOpen, CheckCircle2, Lock, ArrowRight, Star, Clock, Users, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function CoursesPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect('/login');
    }

    // placeholder course data until we have real ones in DB
    const courses = [
        {
            id: '1',
            title: 'Modern Software Engineering',
            description: 'Master the full stack from system design to high-performance UI implementation.',
            progress: 35,
            stages: [
                { title: 'The Identity Framework', status: 'COMPLETED', week: 1 },
                { title: 'Data Sovereignty & Neon', status: 'IN_PROGRESS', week: 2 },
                { title: 'Action Loops & Artifacts', status: 'LOCKED', week: 3 },
                { title: 'Collaboration Architecture', status: 'LOCKED', week: 4 },
                { title: 'Production Velocity', status: 'LOCKED', week: 5 },
            ]
        }
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-1 text-center md:text-left">
                    <h1 className="text-4xl font-extrabold tracking-tighter text-gradient">Learning Pathways</h1>
                    <p className="text-muted-foreground font-medium">Navigating the engineering curriculum through outcome-based stages.</p>
                </div>
                <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
                    <button className="px-5 py-2.5 bg-primary text-black rounded-xl text-xs font-bold uppercase tracking-wider">Active</button>
                    <button className="px-5 py-2.5 text-muted-foreground rounded-xl text-xs font-bold uppercase tracking-wider hover:text-white transition-colors">Catalog</button>
                </div>
            </div>

            {/* Course Content */}
            {courses.map((course) => (
                <div key={course.id} className="space-y-8">
                    {/* Course Card */}
                    <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center glow-primary flex-shrink-0 rotate-3">
                                <BookOpen className="text-black w-10 h-10" />
                            </div>
                            <div className="space-y-4 flex-grow">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl font-black tracking-tight">{course.title}</h2>
                                        <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">In Progress</span>
                                    </div>
                                    <p className="text-muted-foreground max-w-2xl">{course.description}</p>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        <span>Node Completion</span>
                                        <span>{course.progress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                                        <div
                                            className="h-full bg-primary glow-primary transition-all duration-1000 ease-out"
                                            style={{ width: `${course.progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4 pt-2">
                                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        <Clock className="w-4 h-4 text-primary" />
                                        12 Weeks
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        <Users className="w-4 h-4 text-primary" />
                                        Cohort Alpha
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        <Star className="w-4 h-4 text-primary" />
                                        4.9 Rating
                                    </div>
                                </div>
                            </div>
                            <button className="flex-shrink-0 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl flex items-center gap-2 font-bold uppercase tracking-widest text-xs transition-all">
                                <PlayCircle className="w-5 h-5" />
                                Continue
                            </button>
                        </div>
                    </div>

                    {/* Visual Learning Map */}
                    <div className="relative pt-10 pb-20">
                        {/* Connecting Line */}
                        <div className="absolute left-[50%] md:left-24 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-white/5 to-transparent" />

                        <div className="space-y-16">
                            {course.stages.map((stage, i) => (
                                <div key={i} className="relative flex flex-col md:flex-row items-center md:items-start group">
                                    {/* Timeline Marker */}
                                    <div className={cn(
                                        "absolute left-[50%] md:left-24 -translate-x-1/2 w-4 h-4 rounded-full border-4 z-10 transition-all duration-500",
                                        stage.status === 'COMPLETED' ? "bg-primary border-black glow-primary scale-125" :
                                            stage.status === 'IN_PROGRESS' ? "bg-black border-primary animate-pulse" : "bg-zinc-800 border-zinc-700"
                                    )} />

                                    {/* Content Card */}
                                    <div className={cn(
                                        "w-full md:ml-36 p-8 rounded-[2rem] border transition-all duration-500 max-w-xl",
                                        stage.status === 'COMPLETED' ? "glass-card border-primary/20 bg-primary/5" :
                                            stage.status === 'IN_PROGRESS' ? "glass-panel border-primary shadow-2xl scale-[1.02]" : "bg-white/[0.02] border-white/5 opacity-50 grayscale"
                                    )}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="space-y-1">
                                                <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary">Week {stage.week}</div>
                                                <h3 className="text-xl font-bold tracking-tight">{stage.title}</h3>
                                            </div>
                                            {stage.status === 'COMPLETED' ? (
                                                <CheckCircle2 className="w-6 h-6 text-primary" />
                                            ) : stage.status === 'LOCKED' ? (
                                                <Lock className="w-6 h-6 text-muted-foreground" />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                            )}
                                        </div>

                                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                                            {stage.status === 'LOCKED'
                                                ? 'Unlock this stage by completing previous outcome prerequisites.'
                                                : 'Analyze and document your progress through artifacts and reflections.'}
                                        </p>

                                        <div className="flex justify-between items-center">
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(j => (
                                                    <div key={j} className="w-6 h-6 rounded-full border border-black bg-zinc-800" />
                                                ))}
                                                <div className="w-6 h-6 rounded-full border border-black bg-zinc-700 flex items-center justify-center text-[8px] font-bold">+12</div>
                                            </div>
                                            <button
                                                disabled={stage.status === 'LOCKED'}
                                                className={cn(
                                                    "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all inline-flex items-center gap-2",
                                                    stage.status === 'LOCKED' ? "bg-white/5 text-muted-foreground" : "bg-primary text-black hover:scale-[1.05]"
                                                )}
                                            >
                                                {stage.status === 'COMPLETED' ? 'Review Node' : stage.status === 'IN_PROGRESS' ? 'Resume Unit' : 'Locked'}
                                                <ArrowRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
