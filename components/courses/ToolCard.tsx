'use client';

import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Tool {
    name: string;
    category?: string;
    description: string;
    url?: string;
}

interface ToolCardProps {
    tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
    const CardContent = (
        <div className="glass-card p-6 rounded-2xl border border-white/10 hover:border-primary/30 transition-all duration-300 h-full flex flex-col">
            <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                    <h4 className="text-lg font-bold tracking-tight">{tool.name}</h4>
                    {tool.category && (
                        <div className="text-[10px] uppercase font-bold tracking-widest text-primary/70">
                            {tool.category}
                        </div>
                    )}
                </div>
                {tool.url && (
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                )}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
                {tool.description}
            </p>
        </div>
    );

    if (tool.url) {
        return (
            <Link
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full"
            >
                {CardContent}
            </Link>
        );
    }

    return CardContent;
}
