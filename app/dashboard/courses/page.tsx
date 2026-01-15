import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import { redirect } from 'next/navigation';
import { BookOpen, Clock, Users, PlayCircle } from 'lucide-react';
import { getCourseData } from '@/app/actions/courses';
import { StageCard } from '@/components/courses/StageCard';

export default async function CoursesPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect('/login');
    }

    // Fetch real course data
    const data = await getCourseData();

    // Handle error or missing course
    if ('error' in data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <h2 className="text-2xl font-bold">Course Not Found</h2>
                <p className="text-muted-foreground">The AI Productivity & Adaptation course is currently unavailable.</p>
            </div>
        );
    }

    const { course } = data;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="space-y-1 text-center md:text-left">
                <h1 className="text-4xl font-extrabold tracking-tighter text-gradient">Learning Pathways</h1>
                <p className="text-muted-foreground font-medium">Navigating the engineering curriculum through outcome-based stages.</p>
            </div>

            {/* Course Content */}
            <div className="space-y-8">
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
                        {course.nodes.map((node) => (
                            <StageCard
                                key={node.id}
                                id={node.id}
                                title={node.title}
                                description={node.description}
                                weekRange={node.weekRange}
                                status={node.status}
                                requiredActions={node.requiredActions}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
