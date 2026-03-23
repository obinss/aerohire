import { NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
    try {
        const { job_id } = await req.json();

        if (!job_id) {
            return NextResponse.json({ error: "No job_id provided" }, { status: 400 });
        }

         // Fallback if no OpenAI key
         if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({
                score: 88,
                explanation: "The candidate's extensive experience with scaling React architectures and Node.js microservices directly correlates with the Staff Engineering requirements. However, container orchestration experience was not distinctly highlighted, slightly reducing the match vector."
            });
       }

        const prompt = `
        You are an expert AI Headhunter calculating a Match Score between a candidate and a job.
        (For this demo, assume the candidate is highly qualified for job ID: ${job_id}).
        
        Return ONLY valid JSON with the following keys:
        - score: A number between 0 and 100 representing the match alignment.
        - explanation: A short, 2-3 sentence executive summary explaining the match score and why it's highly aligned for this particular role.

        Make the score realistic but high (e.g. 85-98).
        `;

        const { text } = await generateText({
            model: openai("gpt-4o-mini"),
            prompt: prompt,
        });

        const cleaned = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        return NextResponse.json(parsed);

    } catch (error: any) {
        console.error("Match Score Error:", error);
        return NextResponse.json(
            { error: "Failed to compute match score" },
            { status: 500 }
        );
    }
}
