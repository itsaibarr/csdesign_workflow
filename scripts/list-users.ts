import { prisma } from '../lib/prisma';
import fs from 'fs';

async function main() {
    const logFile = 'user_list_log.txt';
    try {
        const users = await prisma.user.findMany();
        const content = users.map(u => `${u.email} (${u.role})`).join('\n');
        fs.writeFileSync(logFile, `Found ${users.length} users:\n${content}`);
    } catch (e) {
        fs.writeFileSync(logFile, `ERROR: ${JSON.stringify(e)}`);
    } finally {
        await prisma.$disconnect();
    }
}

main();
