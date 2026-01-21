const { prisma } = require('../lib/prisma');

async function main() {
    const email = 'cametame001@gmail.com';

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            accounts: true
        }
    });

    if (!user) {
        console.log('❌ User not found');
        return;
    }

    console.log('\n=== USER DETAILS ===');
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Role:', user.role);
    console.log('ID:', user.id);
    console.log('\n=== ACCOUNTS ===');
    console.log('Total accounts:', user.accounts.length);
    user.accounts.forEach((acc, i) => {
        console.log(`\nAccount ${i + 1}:`);
        console.log('  Provider:', acc.providerId);
        console.log('  Has Password:', !!acc.password);
        console.log('  Account ID:', acc.accountId);
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
