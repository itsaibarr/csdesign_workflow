const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.tool.count({
            where: { usageStatus: 'AI_DISCOVERED' }
        });
        console.log('AI_DISCOVERED Tools Count:', count);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
