const { prisma } = require('../lib/prisma');
const bcrypt = require('bcryptjs');

console.log('Script started...');

async function main() {
    try {
        const email = 'cametame001@gmail.com';
        const rawPassword = 'password123';

        console.log(`Checking user: ${email}...`);

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            console.error('❌ User not found!');
            process.exit(1);
        }

        console.log(`User found. Hashing password...`);
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        await prisma.account.upsert({
            where: {
                userId_providerId: {
                    userId: user.id,
                    providerId: 'credential'
                }
            },
            update: { password: hashedPassword },
            create: {
                userId: user.id,
                accountId: email,
                providerId: 'credential',
                password: hashedPassword,
                accessToken: 'mock_token',
            }
        });

        console.log(`✅ PASSWORD SET: ${rawPassword}`);
    } catch (error) {
        console.error('Script Error:', error);
    }
}

main().finally(() => prisma.$disconnect());
