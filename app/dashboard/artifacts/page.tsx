import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Box, Plus, Search, Filter, Clock, ArrowUpRight, Zap, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import ArtifactsClientPage from './ArtifactsClientPage';

export default async function ArtifactsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect('/login');
    }

    const artifacts = await prisma.artifact.findMany({
        where: { userId: session.user.id },
        include: {
            reflection: true,
            team: true,
            hobby: true,
            artifactTools: {
                include: {
                    tool: {
                        select: {
                            id: true,
                            name: true,
                            category: true
                        }
                    }
                }
            },
            comments: {
                orderBy: {
                    createdAt: 'desc'
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const tools = await prisma.tool.findMany({
        where: {
            usageStatus: {
                not: 'PENDING_REVIEW' as any
            }
        },
        select: {
            id: true,
            name: true,
            category: true
        }
    });

    return (
        <ArtifactsClientPage
            initialArtifacts={artifacts}
            userId={session.user.id}
            userRole={session.user.role}
            availableTools={tools}
        />
    );
}

