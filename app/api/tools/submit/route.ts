import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { ToolCategory, PricingModel } from '@prisma/client';

export async function POST(req: NextRequest) {
    try {
        // 1. Check authentication
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, role: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Parse request body
        const body = await req.json();
        const { name, url, shortDescription, category, pricing } = body;

        // 3. Validate required fields
        if (!name || !url || !shortDescription) {
            return NextResponse.json({
                error: 'Missing required fields: name, url, shortDescription'
            }, { status: 400 });
        }

        // 4. Check for duplicates by URL or name (case-insensitive)
        const existingTool = await prisma.tool.findFirst({
            where: {
                OR: [
                    { url: url },
                    { name: { equals: name, mode: 'insensitive' } }
                ]
            }
        });

        if (existingTool) {
            return NextResponse.json({
                error: 'duplicate',
                message: `Tool already exists: "${existingTool.name}"`,
                existingTool: {
                    id: existingTool.id,
                    name: existingTool.name,
                    url: existingTool.url,
                    status: existingTool.usageStatus
                }
            }, { status: 409 }); // 409 Conflict
        }

        // 5. Create new tool with PENDING_REVIEW status
        const newTool = await prisma.tool.create({
            data: {
                name,
                url,
                shortDescription,
                category: category as ToolCategory || 'OTHER',
                pricing: pricing as PricingModel || 'FREEMIUM',
                usageStatus: 'PENDING_REVIEW',
                badges: [],
                submittedById: user.id, // Track who submitted it
            }
        });

        return NextResponse.json({
            success: true,
            tool: newTool,
            message: 'Tool submitted for review! Admins will review it soon.'
        });

    } catch (error) {
        console.error('Error submitting tool:', error);
        return NextResponse.json({
            error: 'Failed to submit tool',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
