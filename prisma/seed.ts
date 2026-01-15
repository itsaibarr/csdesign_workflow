import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Better Auth uses bcrypt for password hashing
async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10
    return await bcrypt.hash(password, saltRounds)
}

async function main() {
    console.log('🌱 Seeding database with demo users...')

    // Create Demo Student
    const student = await prisma.user.upsert({
        where: { email: 'student@csc.com' },
        update: {},
        create: {
            email: 'student@csc.com',
            name: 'Demo Student',
            role: 'STUDENT',
            emailVerified: true,
        },
    })

    // Delete existing account if any and create fresh one with bcrypt hash
    await prisma.account.deleteMany({
        where: {
            userId: student.id,
            providerId: 'credential'
        }
    })

    await prisma.account.create({
        data: {
            userId: student.id,
            accountId: student.email,
            providerId: 'credential',
            password: await hashPassword('password123'),
        },
    })

    console.log('✅ Created student: student@csc.com / password123')

    // Create Demo Mentor
    const mentor = await prisma.user.upsert({
        where: { email: 'mentor@csc.com' },
        update: {},
        create: {
            email: 'mentor@csc.com',
            name: 'Demo Mentor',
            role: 'MENTOR',
            emailVerified: true,
        },
    })

    // Delete existing account if any and create fresh one with bcrypt hash
    await prisma.account.deleteMany({
        where: {
            userId: mentor.id,
            providerId: 'credential'
        }
    })

    await prisma.account.create({
        data: {
            userId: mentor.id,
            accountId: mentor.email,
            providerId: 'credential',
            password: await hashPassword('password123'),
        },
    })

    console.log('✅ Created mentor: mentor@csc.com / password123')

    // Create AI Productivity & Adaptation Course
    const course = await prisma.course.upsert({
        where: { slug: 'ai-productivity-adaptation' },
        update: {},
        create: {
            title: 'AI Productivity & Adaptation',
            slug: 'ai-productivity-adaptation',
            description: 'A 12-week offline-first AI course focused on practical application, personal hobbies, and real-world productivity gains.',
            nodes: {
                create: [
                    {
                        title: 'Introduction to AI & Hobby Selection',
                        description: 'Discover how AI can transform your personal interests and chosen hobby into measurable productivity gains.',
                        weekRange: '1-2',
                        nodeType: 'FOUNDATION',
                        order: 1,
                        requiredActions: JSON.stringify({
                            context: 'AI is not just for tech companies. It starts with what you already care about—your hobby, your daily work, your creative projects. This stage helps you identify one area where AI can make a tangible difference.',
                            whatYouWillDo: [
                                'Choose one personal hobby or interest area (e.g., photography, music, writing, design, fitness)',
                                'Research how AI is currently used in that domain',
                                'Define one specific problem or inefficiency in your hobby',
                                'Document your current workflow (the "before" state)'
                            ],
                            tools: [
                                { name: 'ChatGPT', category: 'Conversational AI', description: 'For brainstorming hobby ideas and researching AI applications', url: 'https://chat.openai.com' },
                                { name: 'Notion', category: 'Documentation', description: 'To organize your research and document your workflow', url: 'https://notion.so' }
                            ],
                            expectedOutcome: 'A documented hobby selection with a clear problem statement and current workflow visualization. This becomes your first artifact.',
                            offlineSession: 'We will discuss everyone\'s hobby choices, share examples of AI applications, and help refine problem statements. Come prepared with 2-3 hobby ideas.'
                        })
                    },
                    {
                        title: 'Prompt Engineering Fundamentals',
                        description: 'Master the art of communicating with AI to get consistent, high-quality results for your specific use case.',
                        weekRange: '3-4',
                        nodeType: 'SKILL',
                        order: 2,
                        requiredActions: JSON.stringify({
                            context: 'The quality of AI output depends on how you frame your request. This stage teaches you to write prompts that are clear, specific, and reproducible—essential for building reliable workflows.',
                            whatYouWillDo: [
                                'Learn prompt engineering frameworks (role, context, task, format)',
                                'Write 5 different prompts for your hobby use case',
                                'Test and iterate on prompts to improve output quality',
                                'Create a personal prompt library with your best results',
                                'Apply prompts to solve your identified hobby problem'
                            ],
                            tools: [
                                { name: 'ChatGPT', category: 'LLM', description: 'Primary tool for testing and refining prompts' },
                                { name: 'Claude', category: 'LLM', description: 'Alternative AI for comparison and specific use cases', url: 'https://claude.ai' },
                                { name: 'Notion AI', category: 'Integrated AI', description: 'For documentation-based prompting within your workspace' }
                            ],
                            expectedOutcome: 'A prompt library (minimum 5 tested prompts) with before/after examples showing quality improvement. Document time saved and efficiency gains in your artifact.',
                            offlineSession: 'Live prompt engineering workshop. Bring your hobby problem and we\'ll craft effective prompts together. Peer review session to improve each other\'s prompts.'
                        })
                    },
                    {
                        title: 'Automation & AI Agents',
                        description: 'Build automated workflows that run AI tasks without manual intervention, freeing up your time for creative work.',
                        weekRange: '5-6',
                        nodeType: 'AUTOMATION',
                        order: 3,
                        requiredActions: JSON.stringify({
                            context: 'Once you have working prompts, the next step is automation. Instead of manually running AI tasks, you create agents that work for you—triggered by events, schedules, or conditions.',
                            whatYouWillDo: [
                                'Identify repetitive tasks in your hobby workflow',
                                'Design an automation flow (trigger → AI processing → output)',
                                'Build your first AI automation using Make or Zapier',
                                'Test and refine the automation for reliability',
                                'Measure time saved vs. time spent building'
                            ],
                            tools: [
                                { name: 'Make', category: 'Automation', description: 'Visual workflow builder connecting AI APIs to other services', url: 'https://make.com' },
                                { name: 'Zapier', category: 'Automation', description: 'Alternative automation platform with extensive integrations', url: 'https://zapier.com' },
                                { name: 'OpenAI API', category: 'AI Service', description: 'Direct API access for custom integrations' }
                            ],
                            expectedOutcome: 'A working automation that runs without your intervention. Document the workflow, show the efficiency gains (time/cost saved), and include screenshots or demo video.',
                            offlineSession: 'Hands-on automation building session. Bring laptops. We\'ll troubleshoot common issues and share integration patterns that work.'
                        })
                    },
                    {
                        title: 'Tool Discovery & Adaptation',
                        description: 'Explore specialized AI tools for your domain and learn to evaluate, adapt, and integrate new technologies into your workflow.',
                        weekRange: '7-8',
                        nodeType: 'EXPLORATION',
                        order: 4,
                        requiredActions: JSON.stringify({
                            context: 'Beyond ChatGPT, there are thousands of specialized AI tools. This stage teaches you how to discover, evaluate, and adopt tools that match your specific needs—without getting overwhelmed by hype.',
                            whatYouWillDo: [
                                'Research 5+ AI tools relevant to your hobby domain',
                                'Test at least 3 tools with real use cases',
                                'Compare features, pricing, and integration options',
                                'Choose 1-2 tools to integrate into your workflow',
                                'Document why these tools work better than generic AI'
                            ],
                            tools: [
                                { name: 'There\'s An AI For That', category: 'Discovery', description: 'Database of AI tools across all categories', url: 'https://theresanaiforthat.com' },
                                { name: 'Futurepedia', category: 'Discovery', description: 'Curated AI tool directory with reviews', url: 'https://futurepedia.io' },
                                { name: 'Product Hunt AI', category: 'Discovery', description: 'Latest AI product launches and community reviews' }
                            ],
                            expectedOutcome: 'A tool evaluation report comparing 3+ AI tools for your hobby. Include trial results, cost-benefit analysis, and final recommendation with reasoning.',
                            offlineSession: 'Tool showcase and demo day. Each student presents their top 2 tools and explains why they chose them. Learn from each other\'s discoveries.'
                        })
                    },
                    {
                        title: 'Team Project',
                        description: 'Collaborate with peers to solve a real-world case study using AI, combining individual skills into a team solution.',
                        weekRange: '9-10',
                        nodeType: 'TEAM',
                        order: 5,
                        requiredActions: JSON.stringify({
                            context: 'Real-world AI adoption happens in teams. This stage simulates a professional environment where you must collaborate, divide work, integrate different AI tools, and present results to stakeholders (mentors).',
                            whatYouWillDo: [
                                'Form teams of 3-5 members',
                                'Receive a real-world business case study from mentors',
                                'Analyze the problem and propose an AI-driven solution',
                                'Divide tasks among team members',
                                'Build the solution using AI tools and automation',
                                'Present findings and demonstrate working prototype'
                            ],
                            tools: [
                                { name: 'Notion', category: 'Collaboration', description: 'Shared workspace for team documentation and project management' },
                                { name: 'Figma', category: 'Design', description: 'For creating solution mockups and user flows' },
                                { name: 'Loom', category: 'Communication', description: 'Record async updates and demos for the team' },
                                { name: 'AI tools of choice', category: 'Mixed', description: 'Each team selects tools based on their case study' }
                            ],
                            expectedOutcome: 'A complete team project artifact including: problem analysis, proposed solution, working prototype/automation, team roles breakdown, and final presentation deck. Mentor review required.',
                            offlineSession: 'Team formation and case study assignment. Mid-point check-in to troubleshoot blockers. Final presentations with mentor feedback.'
                        })
                    },
                    {
                        title: 'Final Project & Demo Day',
                        description: 'Synthesize everything you\'ve learned into a comprehensive personal AI-enhanced workflow, ready to showcase.',
                        weekRange: '11-12',
                        nodeType: 'FINAL',
                        order: 6,
                        requiredActions: JSON.stringify({
                            context: 'This is your capstone. You\'ve chosen a hobby, mastered prompts, built automations, discovered tools, and worked in a team. Now, create your definitive showcase—an AI-enhanced workflow that you\'ll continue using after the course.',
                            whatYouWillDo: [
                                'Integrate all your learning into one cohesive workflow',
                                'Refine and optimize your hobby AI automation from earlier stages',
                                'Measure and document total efficiency gains (time, cost, quality)',
                                'Create a portfolio-ready case study of your AI journey',
                                'Prepare a 5-minute demo for Demo Day',
                                'Reflect on lessons learned and future AI adoption plans'
                            ],
                            tools: [
                                { name: 'All previous tools', category: 'Mixed', description: 'Combine everything you\'ve learned' },
                                { name: 'Gamma', category: 'Presentation', description: 'AI-powered presentation builder for Demo Day', url: 'https://gamma.app' },
                                { name: 'Screen Studio', category: 'Recording', description: 'Professional screen recording for demos' }
                            ],
                            expectedOutcome: 'Your digital profile: a comprehensive portfolio piece showing your complete AI-enhanced workflow, efficiency metrics, and personal growth. This artifact becomes part of your professional portfolio.',
                            offlineSession: 'Demo Day—the grand finale. Each student presents their final project to the cohort, mentors, and invited guests. Celebration and course completion ceremony.'
                        })
                    }
                ]
            }
        },
    })

    console.log('✅ Created course:', course.title)


    // ... existing course/node unlocking ...

    console.log('\n🛠️ Seeding AI Tools...')

    const tools = [
        // LLMs & Chat
        {
            name: 'ChatGPT',
            url: 'https://chatgpt.com',
            category: 'LLM',
            shortDescription: 'The leading conversational AI by OpenAI, capable of writing, coding, and reasoning.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Claude',
            url: 'https://claude.ai',
            category: 'LLM',
            shortDescription: 'Anthropic\'s AI model known for nuanced writing, large context windows, and code analysis.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Google Gemini',
            url: 'https://gemini.google.com',
            category: 'LLM',
            shortDescription: 'Google\'s multimodal AI assistant integrated with the Google ecosystem.',
            pricing: 'FREE',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Microsoft Copilot',
            url: 'https://copilot.microsoft.com',
            category: 'LLM',
            shortDescription: 'AI companion integrated into Windows and Microsoft 365.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Perplexity',
            url: 'https://perplexity.ai',
            category: 'RESEARCH',
            shortDescription: 'AI-powered answer engine that provides cited sources for real-time research.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'DeepSeek',
            url: 'https://deepseek.com',
            category: 'LLM',
            shortDescription: 'Advanced open-source LLM focusing on coding and math capabilities.',
            pricing: 'FREE',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Grok',
            url: 'https://x.ai',
            category: 'LLM',
            shortDescription: 'AI with a rebellious streak and real-time access to X (Twitter) data.',
            pricing: 'PAID',
            usageStatus: 'COURSE_OFFICIAL'
        },
        // Design & Creative
        {
            name: 'Midjourney',
            url: 'https://midjourney.com',
            category: 'DESIGN',
            shortDescription: 'Top-tier generative AI for creating hyper-realistic and artistic images.',
            pricing: 'PAID',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Canva (Magic Studio)',
            url: 'https://canva.com',
            category: 'DESIGN',
            shortDescription: 'All-in-one design platform with powerful integrated AI tools.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Adobe Firefly',
            url: 'https://firefly.adobe.com',
            category: 'DESIGN',
            shortDescription: 'Generative AI for creators, integrated into Photoshop and Creative Cloud.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Figma',
            url: 'https://figma.com',
            category: 'DESIGN',
            shortDescription: 'Collaborative interface design tool with AI features for layout and copy.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Runway',
            url: 'https://runwayml.com',
            category: 'DESIGN',
            shortDescription: 'Leading AI video generation and editing platform.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Leonardo.ai',
            url: 'https://leonardo.ai',
            category: 'DESIGN',
            shortDescription: 'AI image generator optimized for game assets and artistic control.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Sora',
            url: 'https://openai.com/sora',
            category: 'DESIGN',
            shortDescription: 'OpenAI\'s text-to-video model capable of highly detailed scenes.',
            pricing: 'PAID',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Krea AI',
            url: 'https://krea.ai',
            category: 'DESIGN',
            shortDescription: 'Real-time AI image generation and enhancement tool.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Recraft',
            url: 'https://recraft.ai',
            category: 'DESIGN',
            shortDescription: 'AI design tool for generated vector art and icons.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        },
        // Coding & IDE
        {
            name: 'Cursor',
            url: 'https://cursor.com',
            category: 'IDE',
            shortDescription: 'The AI-first code editor designed to pair program with you.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'GitHub Copilot',
            url: 'https://github.com/features/copilot',
            category: 'IDE',
            shortDescription: 'The world\'s most widely adopted AI developer tool.',
            pricing: 'PAID',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Replit',
            url: 'https://replit.com',
            category: 'IDE',
            shortDescription: 'Collaborative browser-based IDE with integrated AI assistant.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'v0.dev',
            url: 'https://v0.dev',
            category: 'IDE',
            shortDescription: 'Generative UI system by Vercel for building React components.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Bolt.new',
            url: 'https://bolt.new',
            category: 'IDE',
            shortDescription: 'In-browser full-stack web development agent.',
            pricing: 'FREE',
            usageStatus: 'COURSE_OFFICIAL'
        },
        // Productivity & Writing
        {
            name: 'Notion AI',
            url: 'https://notion.so',
            category: 'PRODUCTIVITY',
            shortDescription: 'Connected assistant for your notes, docs, and projects.',
            pricing: 'PAID',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Grammarly',
            url: 'https://grammarly.com',
            category: 'PRODUCTIVITY',
            shortDescription: 'AI writing assistant for clear and mistake-free communication.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Jasper',
            url: 'https://jasper.ai',
            category: 'PRODUCTIVITY',
            shortDescription: 'AI marketing copilot for enterprise content creation.',
            pricing: 'PAID',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Otter.ai',
            url: 'https://otter.ai',
            category: 'PRODUCTIVITY',
            shortDescription: 'AI meeting assistant that records, transcribes, and summarizes.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'NotebookLM',
            url: 'https://notebooklm.google.com',
            category: 'RESEARCH',
            shortDescription: 'Personalized AI research assistant grounded in your documents.',
            pricing: 'FREE',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Copy.ai',
            url: 'https://copy.ai',
            category: 'PRODUCTIVITY',
            shortDescription: 'GTM AI platform for marketing and sales content.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Gamma',
            url: 'https://gamma.app',
            category: 'PRODUCTIVITY',
            shortDescription: 'AI-powered medium for generating presentations and websites.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        },
        // Automation
        {
            name: 'Zapier',
            url: 'https://zapier.com',
            category: 'AUTOMATION',
            shortDescription: 'Automation platform connecting thousands of apps with AI integration.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Make',
            url: 'https://make.com',
            category: 'AUTOMATION',
            shortDescription: 'Visual automation platform for designing complex workflows.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'n8n',
            url: 'https://n8n.io',
            category: 'AUTOMATION',
            shortDescription: 'Workflow automation tool for technical people.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        },
        // Audio & Voice
        {
            name: 'ElevenLabs',
            url: 'https://elevenlabs.io',
            category: 'DESIGN',
            shortDescription: 'The most realistic AI text-to-speech and voice cloning.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Suno',
            url: 'https://suno.com',
            category: 'DESIGN',
            shortDescription: 'Generative audio platform for creating music and songs.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Udio',
            url: 'https://udio.com',
            category: 'DESIGN',
            shortDescription: 'AI music generator known for high fidelity.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        },
        // Research & Other
        {
            name: 'Elicit',
            url: 'https://elicit.com',
            category: 'RESEARCH',
            shortDescription: 'AI research assistant that analyzes research papers.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Consensus',
            url: 'https://consensus.app',
            category: 'RESEARCH',
            shortDescription: 'Search engine that uses AI to find answers in scientific research.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Arc Search',
            url: 'https://arc.net',
            category: 'RESEARCH',
            shortDescription: 'Browser with "Browse for Me" AI summarization features.',
            pricing: 'FREE',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Hugging Face',
            url: 'https://huggingface.co',
            category: 'OTHER',
            shortDescription: 'The platform where the machine learning community collaborates.',
            pricing: 'FREE',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Character.ai',
            url: 'https://character.ai',
            category: 'OTHER',
            shortDescription: 'Chat with AI characters that have distinct personalities.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        },
        {
            name: 'Luma Dream Machine',
            url: 'https://lumalabs.ai',
            category: 'DESIGN',
            shortDescription: 'High-quality AI video generation model.',
            pricing: 'FREEMIUM',
            usageStatus: 'COURSE_OFFICIAL'
        }
    ]

    for (const tool of tools) {
        await prisma.tool.upsert({
            where: { name: tool.name },
            update: {
                // Update specific fields if needed, but keeping existing data is usually safer
                // unless we want to enforce description updates.
                shortDescription: tool.shortDescription,
                category: tool.category as any,
                pricing: tool.pricing as any,
                usageStatus: tool.usageStatus as any,
                url: tool.url
            },
            create: {
                name: tool.name,
                url: tool.url,
                category: tool.category as any,
                shortDescription: tool.shortDescription,
                pricing: tool.pricing as any,
                usageStatus: tool.usageStatus as any,
                problemSolved: 'Automatically seeded top tool.',
                badges: ['Top 50', 'Popular'],
                relevance: ['General'],
                usageContexts: ['General']
            }
        })
    }
    console.log(`✅ Seeded ${tools.length} AI Tools`)
    console.log('\n🔓 Unlocking all stages for demo...')

    const allNodes = await prisma.courseNode.findMany({
        where: { courseId: course.id },
        orderBy: { order: 'asc' }
    })

    for (const node of allNodes) {
        await prisma.userNodeProgress.upsert({
            where: {
                userId_nodeId: {
                    userId: student.id,
                    nodeId: node.id
                }
            },
            update: {
                status: 'AVAILABLE'
            },
            create: {
                userId: student.id,
                nodeId: node.id,
                status: 'AVAILABLE', // All stages available for demo
            }
        })
        console.log(`   ✅ Unlocked: ${node.title}`)
    }

    console.log('\n🎉 Seeding complete!')
    console.log('\n📋 Demo Credentials:')
    console.log('   Student: student@csc.com / password123')
    console.log('   Mentor:  mentor@csc.com / password123')
    console.log('\n🎯 All 6 stages are now AVAILABLE for demo testing')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error('❌ Error seeding database:', e)
        await prisma.$disconnect()
        process.exit(1)
    })
