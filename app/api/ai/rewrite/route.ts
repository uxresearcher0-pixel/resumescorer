import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGeminiClient, DEFAULT_MODEL } from "@/lib/openai/client";
import { buildBulletRewritePrompt } from "@/lib/openai/prompts";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { originalBullet, jobTitle, section } = await request.json();
    if (!originalBullet || !jobTitle) {
      return NextResponse.json(
        { error: "originalBullet and jobTitle are required" },
        { status: 400 }
      );
    }

    const gemini = getGeminiClient();
    const model = gemini.getGenerativeModel({
      model: DEFAULT_MODEL,
      generationConfig: { temperature: 0.7, maxOutputTokens: 150 },
    });

    const prompt = buildBulletRewritePrompt(
      originalBullet,
      jobTitle,
      section || "Experience"
    );

    const result = await model.generateContent(prompt);
    const rewritten = result.response.text().trim();

    return NextResponse.json({ rewritten });
  } catch (error) {
    console.error("Rewrite error:", error);
    return NextResponse.json({ error: "Rewrite failed" }, { status: 500 });
  }
}
