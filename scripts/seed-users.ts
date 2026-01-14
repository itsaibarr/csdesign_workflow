import { auth } from '../lib/auth';
import { prisma } from '../lib/prisma'; // Only needed if we want to manually check/update

async function main() {
    console.log('Seeding users via Better Auth...');

    const users = [
        {
            email: 'student@csc.com',
            password: 'password123',
            name: 'Demo Student',
            role: 'STUDENT'
        },
        {
            email: 'mentor@csc.com',
            password: 'password123',
            name: 'Demo Mentor',
            role: 'MENTOR'
        }
    ];

    for (const user of users) {
        try {
            // Check if user exists first to avoid error spam
            const existing = await prisma.user.findUnique({
                where: { email: user.email }
            });

            if (existing) {
                console.log(`User ${user.email} already exists.`);
                // Ideally check password/account but for now skip
                continue;
            }

            console.log(`Creating ${user.email}...`);
            await auth.api.signUpEmail({
                body: {
                    email: user.email,
                    password: user.password,
                    name: user.name,
                    role: user.role, // Pass custom field
                }
            });
            console.log(`Created ${user.email}`);

        } catch (error: any) {
            console.error(`Failed to create ${user.email}:`, error.message || error);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
