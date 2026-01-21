import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
    try {
        // 1. Check admin authorization
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true }
        });

        if (user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
        }

        // 2. Run the discovery script in background
        console.log('🔄 Starting tool discovery job...');

        // Run async without waiting
        execAsync('npx tsx scripts/discovery-job.ts')
            .then(() => console.log('✅ Discovery job completed'))
            .catch(err => console.error('❌ Discovery job failed:', err));

        return NextResponse.json({
            success: true,
            message: 'Tool discovery job started in background'
        });

    } catch (error) {
        console.error('Error triggering discovery:', error);
        return NextResponse.json({
            error: 'Failed to start discovery job'
        }, { status: 500 });
    }
}
