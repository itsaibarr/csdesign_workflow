import { prisma } from '../lib/prisma';
import fs from 'fs';

async function main() {
    const email = 'cametame001@gmail.com';
    const logFile = 'admin_update_log.txt';

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            fs.writeFileSync(logFile, `User ${email} NOT FOUND.`);
            return;
        }

        const updated = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' }
        });

        fs.writeFileSync(logFile, `SUCCESS: User ${updated.email} is now ${updated.role}`);
    } catch (e) {
        fs.writeFileSync(logFile, `ERROR: ${JSON.stringify(e)}`);
    } finally {
        await prisma.$disconnect();
    }
}

main();
