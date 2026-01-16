import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.tool.count({
        where: {
            usageStatus: 'AI_DISCOVERED'
        }
    });
    console.log(`AI Discovered Tools Count: ${count}`);

    const tools = await prisma.tool.findMany({
        where: { usageStatus: 'AI_DISCOVERED' },
        take: 5
    });
    console.log('Sample Tools:', JSON.stringify(tools, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
