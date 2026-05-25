import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildAnalysisPrompt } from "@/lib/openai/prompts";
import { parseAnalysisResponse } from "@/lib/openai/parser";
import { calculateOverallScore, clampScore } from "@/lib/scoring/engine";
import { calculateATSScore } from "@/lib/scoring/ats";

// ── Models tried in order until one works ─────────────────────────────────────
// Confirmed working models for this API key (tested live May 2026)
const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-flash-lite-latest",
  "gemini-2.0-flash",
];

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { resumeId, jobDescriptionId } = await request.json();
    if (!resumeId || !jobDescriptionId) {
      return NextResponse.json(
        { error: "resumeId and jobDescriptionId are required" },
        { status: 400 }
      );
    }

    // Check scan limit for free plan
    const { data: profile } = await supabase
      .from("profiles")
      .select("scans_used, scans_limit, plan")
      .eq("id", user.id)
      .single();

    if (profile && profile.plan === "free" && (profile.scans_used ?? 0) >= (profile.scans_limit ?? 3)) {
      return NextResponse.json(
        { error: "Scan limit reached. Upgrade to Pro for unlimited scans." },
        { status: 403 }
      );
    }

    // Fetch resume and JD in parallel
    const [resumeRes, jdRes] = await Promise.all([
      supabase.from("resumes").select("*").eq("id", resumeId).eq("user_id", user.id).single(),
      supabase.from("job_descriptions").select("*").eq("id", jobDescriptionId).eq("user_id", user.id).single(),
    ]);

    if (!resumeRes.data || !jdRes.data) {
      return NextResponse.json({ error: "Resume or job description not found" }, { status: 404 });
    }

    // Create report in "processing" state
    const { data: report, error: createError } = await supabase
      .from("reports")
      .insert({
        user_id: user.id,
        resume_id: resumeId,
        job_description_id: jobDescriptionId,
        status: "processing",
      })
      .select("id")
      .single();

    if (createError) throw createError;

    // Increment scan counter
    await supabase
      .from("profiles")
      .update({ scans_used: (profile?.scans_used ?? 0) + 1 })
      .eq("id", user.id);

    // Fire-and-forget analysis
    runAnalysis(report.id, resumeRes.data, jdRes.data).catch(async (err) => {
      console.error("Analysis pipeline failed:", err);
      const adminSupabase = await createAdminClient();
      await adminSupabase
        .from("reports")
        .update({ status: "failed", error_message: String(err.message) })
        .eq("id", report.id);
    });

    return NextResponse.json({ reportId: report.id, status: "processing" });
  } catch (error) {
    console.error("Report create error:", error);
    return NextResponse.json({ error: "Failed to start analysis" }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Core analysis pipeline
// ─────────────────────────────────────────────────────────────────────────────
async function runAnalysis(reportId: string, resume: any, jd: any) {
  const start = Date.now();
  const adminSupabase = await createAdminClient();

  // ── 1. Get extracted text (parsed inline during upload) ──────────────────
  let extractedText = resume.extracted_text || "";
  if (!extractedText) {
    // Short wait in case of rare upload race condition
    await new Promise((r) => setTimeout(r, 3000));
    const { data } = await adminSupabase
      .from("resumes")
      .select("extracted_text")
      .eq("id", resume.id)
      .single();
    extractedText = data?.extracted_text || "";
  }

  if (!extractedText || extractedText.trim().length < 50) {
    throw new Error("Resume text is empty or too short. Please upload a readable PDF or DOCX file.");
  }

  // ── 2. Call Gemini with model fallback + retry ────────────────────────────
  const rawResponse = await callGeminiWithFallback(
    buildAnalysisPrompt(extractedText, jd.description_text)
  );

  // ── 3. Parse AI response ──────────────────────────────────────────────────
  const aiResult = parseAnalysisResponse(rawResponse);

  // ── 4. Calculate scores ───────────────────────────────────────────────────
  const atsResult = calculateATSScore({
    fileType: resume.file_type,
    wordCount: resume.word_count,
    pageCount: resume.page_count,
    extractedText,
  });

  const allAtsIssues = [
    ...atsResult.issues.map((i) => ({
      issue: i.issue,
      severity: i.severity,
      recommendation: "",
    })),
    ...aiResult.ats_issues,
  ];

  const categoryScores = {
    ats:        clampScore(atsResult.score),
    keyword:    clampScore(aiResult.scores.keyword),
    skills:     clampScore(aiResult.scores.skills),
    experience: clampScore(aiResult.scores.experience),
    impact:     clampScore(aiResult.scores.impact),
    formatting: clampScore(85),
  };

  const overallScore = calculateOverallScore(categoryScores);

  // ── 5. Save completed report ──────────────────────────────────────────────
  await (adminSupabase.from("reports") as any)
    .update({
      status:              "completed",
      overall_score:       overallScore,
      ats_score:           categoryScores.ats,
      keyword_score:       categoryScores.keyword,
      skills_score:        categoryScores.skills,
      experience_score:    categoryScores.experience,
      impact_score:        categoryScores.impact,
      formatting_score:    categoryScores.formatting,
      strengths:           aiResult.strengths,
      weaknesses:          aiResult.weaknesses,
      ats_issues:          allAtsIssues as any,
      matched_keywords:    aiResult.keyword_match.matched,
      missing_keywords:    aiResult.keyword_match.missing as any,
      skills_matched:      aiResult.skills.matched,
      skills_missing:      aiResult.skills.missing,
      bullet_rewrites:     aiResult.bullet_rewrites as any,
      section_suggestions: aiResult.section_suggestions as any,
      failure_reasons:     aiResult.failure_reasons as any,
      gap_analysis:        aiResult.gap_analysis as any,
      improvement_roadmap: aiResult.improvement_roadmap as any,
      processing_time_ms:  Date.now() - start,
      ai_tokens_used:      null,
    })
    .eq("id", reportId);
}

// ─────────────────────────────────────────────────────────────────────────────
// Gemini call with model fallback list + per-model retry
// ─────────────────────────────────────────────────────────────────────────────
async function callGeminiWithFallback(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

  const gemini = new GoogleGenerativeAI(apiKey);
  let lastError: Error | null = null;

  for (const modelName of GEMINI_MODELS) {
    const model = gemini.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json",
      },
    });

    // Try each model up to 3 times (handles transient 429s)
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (text && text.length > 10) {
          console.log(`✓ Gemini success: ${modelName} (attempt ${attempt})`);
          return text;
        }
        throw new Error("Empty response from Gemini");
      } catch (err: any) {
        lastError = err;
        const msg = err.message || "";

        // 404 = model not available for this key → try next model immediately
        if (msg.includes("404") || msg.includes("not found")) {
          console.warn(`Model ${modelName} not available, trying next...`);
          break;
        }

        // 429 rate limit → wait and retry (same model)
        if (msg.includes("429") || msg.includes("Too Many Requests")) {
          if (attempt < 3) {
            const waitMs = attempt * 3000; // 3s, 6s
            console.warn(`Rate limited on ${modelName}, waiting ${waitMs}ms...`);
            await new Promise((r) => setTimeout(r, waitMs));
            continue;
          }
          // After 3 retries on this model → try next model
          console.warn(`${modelName} rate limit exhausted, trying next model...`);
          break;
        }

        // Other errors → retry once, then move on
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        break;
      }
    }
  }

  throw new Error(
    `AI analysis failed after trying all models. Last error: ${lastError?.message || "Unknown error"}`
  );
}
