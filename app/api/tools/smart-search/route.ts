import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        if (!query || typeof query !== 'string') {
            return NextResponse.json({ success: false, error: 'Invalid query' }, { status: 400 });
        }

        // 1. Fetch available tools (lightweight selection)
        const tools = await prisma.tool.findMany({
            where: {
                usageStatus: {
                    in: ['COURSE_OFFICIAL', 'COMMUNITY_APPROVED', 'AI_DISCOVERED'],
                },
            },
            select: {
                id: true,
                name: true,
                shortDescription: true,
                category: true,
                problemSolved: true,
                badges: true,
                pricing: true,
            },
        });

        if (tools.length === 0) {
            return NextResponse.json({ success: true, results: [] });
        }

        // 2. Prompt Gemini to match tools (Use available model verified by script)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `
      You are an expert AI tool recommender for students/engineers.
      User Query: "${query}"

      Available Tools (JSON):
      ${JSON.stringify(tools)}

      Task:
      Analyze the query and the tool list. Identify the top 5 tools that best match the user's need.
      Return a STRICT JSON object in this format (no markdown):
      {
        "matches": [
           { "toolId": "id_here", "reason": "Short explanation why this fits (max 1 sentence)" }
        ]
      }
      Sort by relevance. If no tools match well, return empty "matches" array.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean code fences if present
        const cleanJson = text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(cleanJson);

        return NextResponse.json({ success: true, results: data.matches || [] });

    } catch (error) {
        console.error('[Smart Search] Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to search' }, { status: 500 });
    }
}
