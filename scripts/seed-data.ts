import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const student = await prisma.user.findUnique({
        where: { email: 'student@csc.com' }
    })

    if (!student) {
        console.log('Student user not found. Please run seed-users first.')
        return
    }

    console.log('Seeding demo data for:', student.email)

    // 1. Create a Team
    const team = await prisma.team.create({
        data: {
            name: 'Alpha Engineering Unit',
            goal: 'Develop a high-performance cognitive interface for engineering growth metrics.',
            members: {
                connect: { id: student.id }
            }
        }
    })
    console.log('Created team:', team.name)

    // 2. Create Hobbies
    const hobbies = await Promise.all([
        prisma.hobby.create({
            data: {
                name: 'Classical Guitar',
                userId: student.id
            }
        }),
        prisma.hobby.create({
            data: {
                name: 'Cyberpunk Literature',
                userId: student.id
            }
        }),
        prisma.hobby.create({
            data: {
                name: 'Amateur Astronomy',
                userId: student.id
            }
        })
    ])
    console.log('Created hobbies:', hobbies.length)

    // 3. Create Tools
    const tools = await Promise.all([
        prisma.tool.upsert({
            where: { name: 'Cursor API' },
            update: {},
            create: { name: 'Cursor API', category: 'IDE', url: 'https://cursor.com' }
        }),
        prisma.tool.upsert({
            where: { name: 'Claude 3.5 Sonnet' },
            update: {},
            create: { name: 'Claude 3.5 Sonnet', category: 'LLM', url: 'https://anthropic.com' }
        }),
        prisma.tool.upsert({
            where: { name: 'Better Auth' },
            update: {},
            create: { name: 'Better Auth', category: 'Security', url: 'https://better-auth.com' }
        })
    ])
    console.log('Created/Upserted tools:', tools.length)

    // 4. Create Artifacts with Reflections
    const artifacts = [
        {
            title: 'Initial Database Schema Design',
            type: 'SCHOOL' as const,
            status: 'VALIDATED' as const,
            problemDescription: 'Legacy authentication was insecure and difficult to maintain.',
            goal: 'Integrate Better Auth for secure, scalable authentication.',
            content: 'Refactoring the CSC platform schema for Better Auth integration.',
            reflection: {
                beforeState: 'Manual SQL migrations and basic User models with passwords.',
                afterState: 'Automated Prisma migrations and integrated Auth models with Better Auth adapters.',
                timeSavedMinutes: 120,
                workSimplificationNote: 'Eliminated manual boilerplate and reduced risk of auth security flaws.'
            }
        },
        {
            title: 'Glassmorphism Design System',
            type: 'SCHOOL' as const,
            status: 'VALIDATED' as const,
            problemDescription: 'Inconsistent UI styling across the application leading to poor user experience.',
            goal: 'Create a unified design system that is both beautiful and functional.',
            content: 'Building a library of reusable glassmorphic components using Tailwind utility classes.',
            reflection: {
                beforeState: 'Basic CSS modules and fragmented styling patterns.',
                afterState: 'Unified design system with consistent blurs, gradients, and typography.',
                timeSavedMinutes: 240,
                workSimplificationNote: 'Faster UI iteration and consistent look and feel across the app.'
            }
        },
        {
            title: 'Cyberpunk Short Story Collection',
            type: 'PERSONAL' as const,
            status: 'DRAFT' as const,
            problemDescription: 'Lack of creative outlet for exploring futuristic themes.',
            goal: 'Write a series of short stories exploring the intersection of AI and humanity.',
            content: 'Drafting stories about AI-augmented engineering in Neo-Tokyo.',
            hobbyId: hobbies[1].id
        }
    ]

    for (const art of artifacts) {
        const { reflection, hobbyId, ...artData } = art
        const createdArt = await prisma.artifact.create({
            data: {
                ...artData,
                userId: student.id,
                hobbyId: hobbyId,
                reflection: reflection ? {
                    create: reflection
                } : undefined
            }
        })

        // Add some tool usage
        if (reflection) {
            await prisma.toolUsage.create({
                data: {
                    toolId: tools[Math.floor(Math.random() * tools.length)].id,
                    artifactId: createdArt.id
                }
            })
        }
    }
    console.log('Created artifacts and reflections.')

    console.log('Seed completed successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
