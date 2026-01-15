
import { PrismaClient, ToolCategory, ToolUsageStatus, PricingModel } from '@prisma/client';

const prisma = new PrismaClient();

const DISCOVERED_TOOLS = [
    {
        name: 'Perplexity AI',
        shortDescription: 'AI-powered answer engine for deep research.',
        fullDescription: 'Perplexity AI combines large language models with real-time web search to provide accurate, cited answers to complex questions.',
        url: 'https://www.perplexity.ai',
        category: ToolCategory.RESEARCH,
        pricing: PricingModel.FREEMIUM,
        problemSolved: 'Accelerates literature review and fact-checking.',
        relevance: ['School', 'Personal Projects'],
        source: 'Product Hunt (Top AI Tools)',
        badges: ['Citation-backed', 'Real-time']
    },
    {
        name: 'Cursor',
        shortDescription: 'The AI-first code editor.',
        fullDescription: 'Built on VS Code, Cursor integrates AI deeply into the coding workflow to write, edit, and chat about code.',
        url: 'https://cursor.sh',
        category: ToolCategory.IDE,
        pricing: PricingModel.FREEMIUM,
        problemSolved: 'Drastically speeds up coding and debugging.',
        relevance: ['School', 'Personal Projects', 'Coding'],
        source: 'Product Hunt (Top AI Tools)',
        badges: ['Developer Favorite', 'VS Code Compatible']
    },
    {
        name: 'Elicit',
        shortDescription: 'Analyze research papers at superhuman speed.',
        fullDescription: 'Elcit uses language models to help you automate research workflows, like parts of literature review.',
        url: 'https://elicit.com',
        category: ToolCategory.RESEARCH,
        pricing: PricingModel.FREEMIUM,
        problemSolved: 'Finds papers, extracts data, and summarizes findings.',
        relevance: ['School', 'Research'],
        source: 'Product Hunt (Top AI Tools)',
        badges: ['Academic', 'Deep Search']
    },
    {
        name: 'BizCard',
        shortDescription: 'AI digital business card & networking.',
        fullDescription: 'Combines e-ink hardware with AI to manage contacts and networking intelligently.',
        url: 'https://bizcard.ai',
        category: ToolCategory.PRODUCTIVITY,
        pricing: PricingModel.PAID,
        problemSolved: 'Streamlines networking and contact management.',
        relevance: ['Personal Projects', 'Business'],
        source: 'Product Hunt (Jan 2026)',
        badges: ['New Launch', 'Networking']
    },
    {
        name: 'Julius AI',
        shortDescription: 'Your AI data analyst.',
        fullDescription: 'Analyze your data with natural language. create charts, graphs, and insights instantly.',
        url: 'https://julius.ai',
        category: ToolCategory.PRODUCTIVITY,
        pricing: PricingModel.FREEMIUM,
        problemSolved: 'Simplifies complex data analysis without coding.',
        relevance: ['School', 'Data Science'],
        source: 'Product Hunt (Top AI Tools)',
        badges: ['Data Viz', 'No-code']
    },
    {
        name: 'Scite',
        shortDescription: 'Smart citations for better research.',
        fullDescription: 'See how research has been cited and if it’s supported or contrasted.',
        url: 'https://scite.ai',
        category: ToolCategory.RESEARCH,
        pricing: PricingModel.PAID,
        problemSolved: 'Verifies the reliability of scientific claims.',
        relevance: ['School', 'Research'],
        source: 'Product Hunt (Top AI Tools)',
        badges: ['Citation Analysis', 'Academic']
    },
    {
        name: 'Consensus',
        shortDescription: 'Search engine for research papers.',
        fullDescription: 'Find answers in research papers. Consensus uses AI to surface findings from scientific research.',
        url: 'https://consensus.app',
        category: ToolCategory.RESEARCH,
        pricing: PricingModel.FREEMIUM,
        problemSolved: 'Quickly finds scientific consensus on topics.',
        relevance: ['School', 'Health', 'Science'],
        source: 'Product Hunt (Top AI Tools)',
        badges: ['Scientific']
    },
    {
        name: 'Figma AI',
        shortDescription: 'Design at the speed of thought.',
        fullDescription: 'Generate designs, create prototypes, and automate repetitive tasks directly in Figma.',
        url: 'https://figma.com',
        category: ToolCategory.DESIGN,
        pricing: PricingModel.FREEMIUM,
        problemSolved: 'Automates UI design and asset generation.',
        relevance: ['Design', 'Personal Projects'],
        source: 'Product Hunt (Top AI Tools)',
        badges: ['Industry Standard']
    }
];

async function main() {
    console.log('Seeding tools...');
    for (const tool of DISCOVERED_TOOLS) {
        await prisma.tool.upsert({
            where: { name: tool.name },
            update: {
                pricing: tool.pricing,
                problemSolved: tool.problemSolved,
                relevance: tool.relevance,
                source: tool.source,
            },
            create: {
                name: tool.name,
                shortDescription: tool.shortDescription,
                fullDescription: tool.fullDescription,
                url: tool.url,
                category: tool.category,
                pricing: tool.pricing,
                problemSolved: tool.problemSolved,
                relevance: tool.relevance,
                source: tool.source,
                badges: tool.badges,
                usageStatus: ToolUsageStatus.AI_DISCOVERED
            }
        });
    }
    console.log('Done!');
    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
