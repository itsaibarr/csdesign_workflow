import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Create a Demo Student
    const student = await prisma.user.upsert({
        where: { email: 'student@csc.com' },
        update: {},
        create: {
            email: 'student@csc.com',
            name: 'Demo Student',
            role: 'STUDENT',
            // Password removed as it is not in the User model
        },
    })

    // Create a Demo Mentor
    const mentor = await prisma.user.upsert({
        where: { email: 'mentor@csc.com' },
        update: {},
        create: {
            email: 'mentor@csc.com',
            name: 'Demo Mentor',
            role: 'MENTOR',
        },
    })

    // Create Core Course Structure
    const course = await prisma.course.upsert({
        where: { slug: 'ai-csc-2026' },
        update: {},
        create: {
            title: 'AI Engineering & Strategy',
            slug: 'ai-csc-2026',
            description: 'The flagship course for the Computer Science Club.',
            stages: {
                create: [
                    {
                        title: 'The Foundation',
                        order: 1,
                        weeks: {
                            create: [
                                { title: 'Week 1: Mindset', order: 1 },
                                { title: 'Week 2: Tools', order: 2 }
                            ]
                        }
                    },
                    {
                        title: 'The Builder',
                        order: 2,
                        weeks: {
                            create: [
                                { title: 'Week 3: Proto', order: 1 },
                                { title: 'Week 4: Ship', order: 2 }
                            ]
                        }
                    }
                ]
            }
        },
    })

    console.log({ student, mentor, course })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
