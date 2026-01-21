import { prisma } from '../lib/prisma';

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error('❌ Error: Please provide an email address.');
        console.log('Usage: npx tsx scripts/make-admin.ts <email>');
        process.exit(1);
    }

    // 1. Check if user exists first
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (!existingUser) {
        console.error(`❌ Error: User with email "${email}" not found in the database.`);

        // 2. List available users to help debugging
        console.log('\n🔍 Checking for existing users...');
        const count = await prisma.user.count();

        if (count === 0) {
            console.log('⚠️  Database is empty. No users found.');
            console.log('👉 Tip: Sign up in the app first, or run `npx prisma db seed` if you have seed data.');
        } else {
            console.log(`Found ${count} users. Here are the first 5:`);
            const users = await prisma.user.findMany({
                take: 5,
                select: { email: true, role: true, name: true }
            });
            users.forEach(u => console.log(`   - ${u.email} [${u.role}] (${u.name || 'No Name'})`));
        }
        process.exit(1);
    }

    // 3. Update the user
    const updatedUser = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' },
    });

    console.log(`\n✅ Success! User details updated:`);
    console.log(`   - Email: ${updatedUser.email}`);
    console.log(`   - Role: ${updatedUser.role}`);
    console.log(`   - ID: ${updatedUser.id}`);
}

main()
    .catch((e) => {
        console.error('Unexpected error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
