
import { PrismaClient, NodeType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Course Data...');

    const courseData = {
        title: 'AI Productivity & Adaptation',
        slug: 'ai-productivity-adaptation',
        description: 'A 12-week journey to master AI tools, automation, and adapting to the new digital landscape.',
        nodes: [
            {
                order: 1,
                title: 'Introduction to AI & Hobby Selection',
                weekRange: '1-2',
                nodeType: 'FOUNDATION',
                description: 'Understanding the AI landscape and selecting a personal hobby to optimize.',
                requiredActions: JSON.stringify(['Select a Hobby', 'Create Initial Reflection']),
            },
            {
                order: 2,
                title: 'Prompt Engineering Fundamentals',
                weekRange: '3-4',
                nodeType: 'SKILL',
                description: 'Mastering the art of communicating with LLMs to get precise results.',
                requiredActions: JSON.stringify(['Create Prompt Library', 'Optimize Hobby Tasks']),
            },
            {
                order: 3,
                title: 'Automation & AI Agents',
                weekRange: '5-6',
                nodeType: 'AUTOMATION',
                description: 'Building autonomous workflows to handle repetitive tasks.',
                requiredActions: JSON.stringify(['Build Simple Agent', 'Automate One Workflow']),
            },
            {
                order: 4,
                title: 'Tool Discovery & Adaptation',
                weekRange: '7-8',
                nodeType: 'EXPLORATION',
                description: 'Exploring and integrating new AI tools specific to your domain.',
                requiredActions: JSON.stringify(['Test 3 New Tools', 'Integrate Best Tool']),
            },
            {
                order: 5,
                title: 'Team Project',
                weekRange: '9-10',
                nodeType: 'TEAM',
                description: 'Collaborating with peers to solve a larger problem using AI.',
                requiredActions: JSON.stringify(['Join Team', 'Define Team Goal', 'Submit Team Artifact']),
            },
            {
                order: 6,
                title: 'Final Artifact & Presentation',
                weekRange: '11-12',
                nodeType: 'FINAL',
                description: 'Showcasing your transformation and efficiency gains.',
                requiredActions: JSON.stringify(['Final Presentation', 'Submit Final Reflection']),
            },
        ],
    };

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
        where: { slug: courseData.slug },
    });

    if (existingCourse) {
        console.log(`Course '${courseData.title}' already exists.`);
        // Optional: Update nodes if needed, for now just skip
    } else {
        // Create Course
        const course = await prisma.course.create({
            data: {
                title: courseData.title,
                slug: courseData.slug,
                description: courseData.description,
                nodes: {
                    create: courseData.nodes.map(node => ({
                        title: node.title,
                        weekRange: node.weekRange,
                        nodeType: node.nodeType as NodeType,
                        description: node.description,
                        order: node.order,
                        requiredActions: node.requiredActions,
                    })),
                },
            },
        });
        console.log(`Created course: ${course.title}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
