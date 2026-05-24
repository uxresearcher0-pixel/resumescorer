import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getGeminiClient, DEFAULT_MODEL } from "@/lib/openai/client";
import { buildAnalysisPrompt } from "@/lib/openai/prompts";
import { parseAnalysisResponse } from "@/lib/openai/parser";
import { calculateOverallScore, clampScore } from "@/lib/scoring/engine";
import { calculateATSScore } from "@/lib/scoring/ats";

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

    // Create report in "processing" state immediately so frontend can poll
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

    // Fire-and-forget analysis (non-blocking)
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

// ─────────────────────────────────────────────
// Core analysis pipeline (runs asynchronously)
// ─────────────────────────────────────────────
async function runAnalysis(reportId: string, resume: any, jd: any) {
  const start = Date.now();
  const adminSupabase = await createAdminClient();

  // Wait for text extraction if not ready yet (poll up to 20s)
  let extractedText = resume.extracted_text || "";
  if (!extractedText) {
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const { data } = await adminSupabase
        .from("resumes")
        .select("extracted_text")
        .eq("id", resume.id)
        .single();
      if (data?.extracted_text) {
        extractedText = data.extracted_text;
        break;
      }
    }
    if (!extractedText) throw new Error("Resume text extraction timed out after 20s");
  }

  // ── Gemini API call ──────────────────────────────────────────
  const gemini = getGeminiClient();
  const model = gemini.getGenerativeModel({
    model: DEFAULT_MODEL,
    generationConfig: {
      temperature: 0.3,
      responseMimeType: "application/json",   // forces JSON output
    },
  });

  const prompt = buildAnalysisPrompt(extractedText, jd.description_text);
  const result = await model.generateContent(prompt);
  const rawResponse = result.response.text();

  // ── Parse + score ─────────────────────────────────────────────
  const aiResult = parseAnalysisResponse(rawResponse);

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

  // ── Write completed report ────────────────────────────────────
  await adminSupabase
    .from("reports")
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
      processing_time_ms:  Date.now() - start,
      ai_tokens_used:      null, // Gemini free tier doesn't expose token count
    })
    .eq("id", reportId);
}
