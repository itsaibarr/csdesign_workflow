import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Wrench, ExternalLink, Activity, Star, Search, Filter, Cpu, Globe, Terminal, Ghost } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function ToolsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect('/login');
    }

    const tools = await prisma.tool.findMany({
        include: {
            _count: {
                select: { usages: true }
            }
        },
        orderBy: {
            usages: {
                _count: 'desc'
            }
        }
    });

    const categories = Array.from(new Set(tools.map(t => t.category)));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-1 text-center md:text-left">
                    <h1 className="text-4xl font-extrabold tracking-tighter text-gradient">Engineering Utilities</h1>
                    <p className="text-muted-foreground font-medium">Your curated catalog of optimized tools and resources.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-2xl font-bold uppercase tracking-wider transition-all">
                    Suggest Tool
                </button>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search for tools, APIs, or libraries..."
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/30 transition-all text-white placeholder:text-muted-foreground/50"
                    />
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
                    <button className="whitespace-nowrap px-6 py-4 bg-primary text-black rounded-2xl flex items-center gap-2 text-sm font-bold uppercase tracking-widest glow-primary transition-all">
                        All Tools
                    </button>
                    {categories.map((cat, i) => (
                        <button key={i} className="whitespace-nowrap px-6 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.length > 0 ? (
                    tools.map((tool) => (
                        <div key={tool.id} className="glass-panel p-6 rounded-[2.5rem] border-white/5 group hover:border-primary/30 transition-all hover:scale-[1.02] relative overflow-hidden">
                            {/* Usage Badge */}
                            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-wider">
                                <Activity className="w-3 h-3 text-primary" />
                                {tool._count.usages} Usages
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 transition-all shrink-0">
                                        {tool.category === 'IDE' ? <Terminal className="w-7 h-7 text-primary" /> :
                                            tool.category === 'LLM' ? <Cpu className="w-7 h-7 text-primary" /> :
                                                <Globe className="w-7 h-7 text-primary" />}
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-black text-lg tracking-tight">{tool.name}</h3>
                                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                        </div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{tool.category}</p>
                                    </div>
                                </div>

                                <p className="text-sm text-muted-foreground/80 leading-relaxed line-clamp-2">
                                    Integration with the CSC platform for enhanced engineering {tool.name.toLowerCase()} workflows and automated reflections.
                                </p>

                                <div className="pt-2 flex items-center justify-between">
                                    <div className="flex -space-x-1.5">
                                        {[1, 2, 3].map(j => (
                                            <div key={j} className="w-7 h-7 rounded-full border-2 border-zinc-950 bg-zinc-800" />
                                        ))}
                                    </div>
                                    <a
                                        href={tool.url || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/40 hover:bg-primary/10 transition-all text-muted-foreground hover:text-primary"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-32 text-center pointer-events-none opacity-50">
                        <Ghost className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-bold uppercase tracking-widest text-muted-foreground">No tools deployed</h3>
                    </div>
                )}
            </div>

            {/* Community Tools Banner */}
            <div className="glass-panel p-10 rounded-[3rem] border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="space-y-4 text-center md:text-left flex-grow">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
                            Community Driven
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter leading-none">Can't find your tool?</h2>
                        <p className="text-muted-foreground max-w-lg font-medium">
                            Add custom tools to your engineering repository to track performance metrics and share best practices with your cohort.
                        </p>
                    </div>
                    <button className="shrink-0 px-10 py-5 bg-primary text-black rounded-[1.5rem] font-black uppercase tracking-widest glow-primary hover:scale-[1.05] active:scale-[0.95] transition-all">
                        Deploy New Tool
                    </button>
                </div>
            </div>
        </div>
    );
}
