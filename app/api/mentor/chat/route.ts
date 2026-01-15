import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { message, history } = await req.json();

        // Fetch user context for the prompt
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                UserNodeProgress: {
                    include: {
                        node: true
                    }
                }
            }
        });

        const currentProgress = user?.UserNodeProgress.find(p => p.status === 'IN_PROGRESS')
            || user?.UserNodeProgress.filter(p => p.status === 'COMPLETED').sort((a, b) => b.node.order - a.node.order)[0]
            || user?.UserNodeProgress.find(p => p.status === 'AVAILABLE');

        const stageTitle = currentProgress?.node.title || "The Foundation";
        const stageDescription = currentProgress?.node.description || "Initial setup and mindset shift.";

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const systemPrompt = `You are the CSC Mentor Assistant, an elite AI coach for the "AI Productivity & Adaptation" course. 
Your goal is to help students navigate their learning path, build artifacts, and adapt to AI workflows.
Do NOT use generic advice. Be extremely practical, hands-on, and concise.

STUDENT CONTEXT:
- Current Stage: ${stageTitle}
- Stage Focus: ${stageDescription}

INSTRUCTIONS:
1. If the student is stuck, suggest a specific next step related to their stage.
2. If they ask about tools, recommend modern AI-first options (Cursor, v0, Perplexity, etc).
3. Keep responses energetic and industrial-themed (using terms like 'build', 'sequence', 'trajectory', 'artifact').
4. Use Markdown formatting (bold, lists, etc) to make responses readable and highlight key terms.
5. Answer in the same language as the user.`;

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "Acknowledged. I am ready to guide the student through their CSC trajectory." }] },
                ...history.map((h: any) => ({
                    role: h.role === 'user' ? 'user' : 'model',
                    parts: [{ text: h.content }]
                }))
            ],
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        return NextResponse.json({ content: responseText });
    } catch (error) {
        console.error("Mentor Chat Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
