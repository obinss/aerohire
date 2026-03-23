import { NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
    try {
        const { cv_text } = await req.json();

        if (!cv_text) {
            return NextResponse.json({ error: "No CV text provided" }, { status: 400 });
        }

        // Check if OpenAI API key exists, otherwise fallback to mock
        if (!process.env.OPENAI_API_KEY) {
             console.warn("OPENAI_API_KEY is not set. Using mock parse structure.");
             return NextResponse.json({
                 skills: ["React", "TypeScript", "Node.js", "System Design"],
                 experience_years: 8,
                 education: ["BSc Computer Science"],
                 tools: ["Docker", "Figma", "Git"]
             });
        }

        const prompt = `
        You are an expert HR ATS Parser. Extract the following from this CV text:
        - List of technical skills (array of strings)
        - Total years of experience (number)
        - Education history summaries (array of strings)
        - Tools used (array of strings)
        
        Return ONLY valid JSON with keys: skills, experience_years, education, tools.

        CV Text:
        ${cv_text.substring(0, 4000)}
        `;

        const { text } = await generateText({
            model: openai("gpt-4o-mini"),
            prompt: prompt,
        });

        // Strip markdown blocks if they exist
        const cleaned = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        return NextResponse.json(parsed);

    } catch (error: any) {
        console.error("Parse CV Error:", error);
        return NextResponse.json(
            { error: "Failed to parse CV" },
            { status: 500 }
        );
    }
}
