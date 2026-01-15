'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, PlayCircle, BookOpen, Layers, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface MentorChatProps {
    currentStageName: string;
    initialMessage?: string;
}

export default function MentorChat({ currentStageName, initialMessage }: MentorChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: initialMessage || `Hello! I'm your CSC Mentor Assistant. I'm here to help you navigate through **${currentStageName}**. What can I help you focus on today?`
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/mentor/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages
                })
            });

            if (!response.ok) throw new Error('Failed to fetch response');

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
        } catch (error) {
            console.error('Chat Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "I encountered a synchronization error. Please try again or re-initiate the link." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status Column */}
            <div className="md:col-span-1 space-y-4">
                <div className="glass-card p-6 rounded-[2rem] border-white/5 space-y-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Current Context</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-primary">
                                <Layers className="w-5 h-5 text-black" />
                            </div>
                            <div className="font-bold text-sm tracking-tight">{currentStageName}</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quick Actions</p>
                        <button
                            onClick={() => { setInput("Can you review my solution plan for this stage?"); handleSubmit(); }}
                            className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center gap-3 transition-all text-left group"
                        >
                            <PlayCircle className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Review Plan</span>
                        </button>
                        <button
                            onClick={() => { setInput("What AI tools should I prioritize for this module?"); handleSubmit(); }}
                            className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center gap-3 transition-all text-left group"
                        >
                            <BookOpen className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Explain Tools</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Chat Column */}
            <div className="md:col-span-2 flex flex-col h-[600px] glass-panel rounded-[2.5rem] border-white/5 relative overflow-hidden bg-black/40">
                <div ref={scrollRef} className="flex-grow p-8 space-y-6 overflow-y-auto custom-scrollbar">
                    {messages.map((m, i) => (
                        <div key={i} className={cn("flex gap-4", m.role === 'user' ? "flex-row-reverse" : "")}>
                            <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg",
                                m.role === 'assistant' ? "bg-primary text-black" : "bg-white/10 text-white/50"
                            )}>
                                {m.role === 'assistant' ? <Sparkles className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                            </div>
                            <div className={cn(
                                "p-5 rounded-2xl border max-w-[85%] text-sm leading-relaxed prose prose-invert prose-sm",
                                m.role === 'assistant'
                                    ? "bg-white/5 rounded-tl-none border-white/10 text-white/90"
                                    : "bg-primary/10 rounded-tr-none border-primary/20 text-white"
                            )}>
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        strong: ({ node, ...props }) => <span className="font-bold text-primary" {...props} />,
                                        ul: ({ node, ...props }) => <ul className="list-disc ml-4 space-y-1 mb-2" {...props} />,
                                        ol: ({ node, ...props }) => <ol className="list-decimal ml-4 space-y-1 mb-2" {...props} />,
                                        li: ({ node, ...props }) => <li className="mb-0.5" {...props} />,
                                        code: ({ node, ...props }) => <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs text-primary-foreground font-mono" {...props} />,
                                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                    }}
                                >
                                    {m.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                                <Loader2 className="w-4 h-4 text-black animate-spin" />
                            </div>
                            <div className="bg-white/5 p-5 rounded-2xl rounded-tl-none border border-white/10">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
                                    <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-white/5 bg-black/20 backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="relative group">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask your mentor anything..."
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white/[0.05] transition-all placeholder:text-muted-foreground/50"
                        />
                        <button
                            disabled={isLoading || !input.trim()}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-primary text-black rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg glow-primary"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
