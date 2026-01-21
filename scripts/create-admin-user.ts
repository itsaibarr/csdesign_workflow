import { prisma } from '../lib/prisma';

async function main() {
    const email = 'cametame001@gmail.com';

    // Upsert the user: Create if not exists, Update if exists
    const user = await prisma.user.upsert({
        where: { email },
        update: { role: 'ADMIN' },
        create: {
            email,
            name: 'Smaiyl (Admin)',
            role: 'ADMIN',
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    });

    console.log(`✅ User ${user.email} is ready with role: ${user.role}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
