import { NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
    try {
        const { application_id } = await req.json();

        if (!application_id) {
            return NextResponse.json({ error: "No application_id provided" }, { status: 400 });
        }

        // Fallback if no OpenAI key
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({
                content_markdown: `
# Cover Letter

Dear Hiring Manager,

With over 8 years of experience engineering high-performance interfaces and scalable backends, I am thrilled to express my profound interest in this role. My recent achievements include leading the migration of monolithic architectures to serverless Next.js deployments, which resulted in a 40% decrease in latency and significantly enhanced the user experience metrics.

I possess deep expertise across the TypeScript ecosystem, specifically leaning on React, Node, and advanced state management patterns to solve complex product requirements gracefully. The opportunity to bring this technical rigor to your engineering culture is an exciting prospect.

I look forward to discussing how my background aligns with your strategic objectives in greater detail.

Sincerely,
Executive Candidate
                `
            });
        }

        const prompt = `
        You are an expert AI Career Coach. Generate a highly calibrating, ATS-optimized Cover Letter in Markdown format for the application ID: ${application_id}.
        Write 3 compelling paragraphs highlighting senior technical leadership, impact, and precise alignment with standard modern engineering roles.
        Use professional, executive tone.
        Return ONLY the raw markdown text.
        `;

        const { text } = await generateText({
            model: openai("gpt-4o"),
            prompt: prompt,
        });

        return NextResponse.json({ content_markdown: text });

    } catch (error: any) {
        console.error("Cover Letter Error:", error);
        return NextResponse.json(
            { error: "Failed to generate cover letter" },
            { status: 500 }
        );
    }
}
