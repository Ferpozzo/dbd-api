import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function requestGemini(instruction) {
    const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        contents: instruction,
        config: {
            thinkingConfig: {
                thinkingBudget: 0,
            },
        }
    });
    return response.text;
}

export { requestGemini };