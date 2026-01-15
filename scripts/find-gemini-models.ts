import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function listModels() {
    try {
        console.log("Listing available models via SDK...");
        // In @google/generative-ai, listModels is not on the genAI instance directly usually, 
        // it's a separate call or we need to use the generativeLanguage API.
        // Actually, let's just use the direct URL with the key to be sure.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        console.log("Available Models:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
