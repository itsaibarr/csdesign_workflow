import 'dotenv/config';
import { PrismaClient, ToolUsageStatus, ToolCategory, PricingModel } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const LOG_FILE = path.join(process.cwd(), 'scripts', 'discovery.log');

// Initialize Gemini
// Ensure you have GEMINI_API_KEY in your .env
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

function log(msg: string) {
    const entry = `[${new Date().toISOString()}] ${msg}\n`;
    fs.appendFileSync(LOG_FILE, entry);
    console.log(msg);
}

async function main() {
    log('Starting AI Tool Discovery Job (GenAI Manual Generation)...');

    if (!process.env.GEMINI_API_KEY) {
        log('ERROR: GEMINI_API_KEY not found in environment variables. Make sure .env is loaded.');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `
            You are an expert AI trend analyst.
            Identify 8 distinct, high-quality, and trending AI tools or libraries that would be valuable for students and software engineers.
            Focus on "hidden gems" and rising stars in 2024/2025.
            Do not include: ChatGPT, Claude, Gemini, Midjourney, v0.dev (we already have these).
            Diverse categories: Coding, Design, Research, Productivity.

            Return a strict JSON object with this schema:
            {
                "tools": [
                    {
                        "name": "Tool Name",
                        "tagline": "Short snappy tagline",
                        "description": "2-3 sentences describing what it does and why it's cool.",
                        "url": "https://url-to-tool.com",
                        "category": "One of: LLM, AUTOMATION, DESIGN, IDE, SECURITY, RESEARCH, PRODUCTIVITY, OTHER",
                        "pricing": "One of: FREE, FREEMIUM, PAID, TRIAL",
                        "badges": ["badge1", "badge2"]
                    }
                ]
            }
        `;

        log('Querying Gemini for trending tools...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const cleanJson = text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(cleanJson);

        const tools = data.tools || [];
        log(`Gemini returned ${tools.length} tools.`);

        for (const tool of tools) {
            const existing = await prisma.tool.findUnique({
                where: { name: tool.name }
            });

            if (existing) {
                log(`Skipping ${tool.name} (Already exists)`);
                continue;
            }

            // Map category string to enum if needed, or rely on exact match if prompt is good
            let category: ToolCategory = ToolCategory.OTHER;
            if (Object.values(ToolCategory).includes(tool.category as ToolCategory)) {
                category = tool.category as ToolCategory;
            }

            let pricing: PricingModel = PricingModel.FREEMIUM;
            if (Object.values(PricingModel).includes(tool.pricing as PricingModel)) {
                pricing = tool.pricing as PricingModel;
            }

            await prisma.tool.create({
                data: {
                    name: tool.name,
                    shortDescription: tool.tagline,
                    fullDescription: `${tool.description}\n\n(AI Discovered)`,
                    url: tool.url,
                    category: category,
                    usageStatus: ToolUsageStatus.AI_DISCOVERED,
                    pricing: pricing,
                    source: "Gemini AI Trends",
                    relevance: ["work", "tech", "student"],
                    badges: tool.badges || ["Trending"]
                }
            });
            log(`CREATED: ${tool.name}`);
        }

    } catch (error: any) {
        log(`CRITICAL ERROR: ${error.message}`);
        console.error(error);

        log('Falling back to HARDCODED mock data due to API failure...');
        const fallbackTools = [
            {
                name: "Cursor",
                tagline: "The AI Code Editor",
                description: "Built for pair-programming with AI. Cursor serves as a drop-in replacement for VS Code with built-in AI chat and code generation features.",
                url: "https://cursor.sh",
                category: ToolCategory.IDE,
                pricing: PricingModel.FREEMIUM,
                badges: ["Trending", "Top Pick"]
            },
            {
                name: "Perplexity",
                tagline: "Where Knowledge Begins",
                description: "An AI powered answer engine that provides accurate, trusted and real-time answers to your questions.",
                url: "https://perplexity.ai",
                category: ToolCategory.RESEARCH,
                pricing: PricingModel.FREEMIUM,
                badges: ["Research", "Search"]
            },
            {
                name: "Midjourney v6",
                tagline: "Text to Image Generation",
                description: "The latest version of Midjourney offering hyper-realistic image generation with improved prompt adherence.",
                url: "https://midjourney.com",
                category: ToolCategory.DESIGN,
                pricing: PricingModel.PAID,
                badges: ["Creative", "Art"]
            },
            {
                name: "Claude 3.5 Sonnet",
                tagline: "Anthropic's Most Intelligent Model",
                description: "State-of-the-art AI model with advanced reasoning, coding, and multilingual capabilities.",
                url: "https://claude.ai",
                category: ToolCategory.LLM,
                pricing: PricingModel.FREEMIUM,
                badges: ["SOTA", "Reasoning"]
            },
            {
                name: "V0.dev",
                tagline: "Generative UI System",
                description: "Generate UI components and websites from text prompts using Vercel's AI capabilities.",
                url: "https://v0.dev",
                category: ToolCategory.DESIGN,
                pricing: PricingModel.FREEMIUM,
                badges: ["Frontend", "Vercel"]
            }
        ];

        for (const tool of fallbackTools) {
            const existing = await prisma.tool.findUnique({ where: { name: tool.name } });
            if (existing) continue;

            await prisma.tool.create({
                data: {
                    name: tool.name,
                    shortDescription: tool.tagline,
                    fullDescription: `${tool.description}\n\n(Fallback Data)`,
                    url: tool.url,
                    category: tool.category,
                    usageStatus: ToolUsageStatus.AI_DISCOVERED,
                    pricing: tool.pricing,
                    source: "System Fallback",
                    relevance: ["work", "tech"],
                    badges: tool.badges
                }
            });
            log(`CREATED (Fallback): ${tool.name}`);
        }

    } finally {
        await prisma.$disconnect();
    }
}

main();
