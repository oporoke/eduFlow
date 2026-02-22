import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== "TEACHER" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { type, topic, subject, grade, contentType } = await req.json();

  if (!type || !topic) {
    return NextResponse.json({ error: "type and topic required" }, { status: 400 });
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  let prompt = "";

  if (type === "lesson") {
    prompt = `You are an expert CBC Kenya curriculum teacher. 
Create a detailed lesson on "${topic}" for ${subject || "General"} subject, ${grade || "primary"} level.

Return ONLY a JSON object with this exact structure:
{
  "title": "lesson title",
  "contentType": "${contentType || "TEXT"}",
  "text": "detailed lesson content in 3-5 paragraphs, age appropriate, engaging and aligned to CBC Kenya curriculum"
}

Make it engaging, clear and appropriate for Kenyan students.`;
  }

  if (type === "quiz") {
    prompt = `You are an expert CBC Kenya curriculum teacher.
Create 5 multiple choice questions about "${topic}" for ${subject || "General"} subject, ${grade || "primary"} level.

Return ONLY a JSON object with this exact structure:
{
  "title": "Quiz: ${topic}",
  "questions": [
    {
      "text": "question text",
      "optionA": "option A text",
      "optionB": "option B text",
      "optionC": "option C text",
      "optionD": "option D text",
      "correctAnswer": "A"
    }
  ]
}

Make questions clear, age-appropriate and aligned to CBC Kenya curriculum.`;
  }

  if (type === "summary") {
    prompt = `You are an expert CBC Kenya curriculum teacher.
Summarize the following lesson content into 3 key bullet points suitable for a student revision card:

"${topic}"

Return ONLY a JSON object:
{
  "summary": "• Point 1\\n• Point 2\\n• Point 3"
}`;
  }

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json(parsed);
  } catch (e) {
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}