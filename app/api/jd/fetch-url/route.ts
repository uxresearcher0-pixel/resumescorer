import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGeminiClient, DEFAULT_MODEL } from "@/lib/openai/client";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Strategy 1: Try Jina.ai reader — works on LinkedIn, Greenhouse, Lever, Workday, etc.
    // Strategy 2: Fall back to direct HTML fetch for simpler sites
    let pageText = "";

    const jinaUrl = `https://r.jina.ai/${parsedUrl.toString()}`;
    try {
      const jinaRes = await fetch(jinaUrl, {
        headers: {
          "Accept": "text/plain",
          "X-Return-Format": "text",
        },
        signal: AbortSignal.timeout(20000),
      });

      if (jinaRes.ok) {
        const jinaText = await jinaRes.text();
        if (jinaText && jinaText.length > 200) {
          pageText = jinaText.slice(0, 10000);
        }
      }
    } catch {
      // Jina failed — will try direct fetch below
    }

    // Fall back to direct fetch if Jina didn't return useful content
    if (!pageText) {
      try {
        const pageRes = await fetch(parsedUrl.toString(), {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
          },
          signal: AbortSignal.timeout(14000),
        });

        if (!pageRes.ok) {
          return NextResponse.json(
            { error: `Could not access this job posting (site returned ${pageRes.status}). Copy the job description manually instead.` },
            { status: 422 }
          );
        }

        const html = await pageRes.text();
        pageText = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
          .replace(/<!--[\s\S]*?-->/g, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s{3,}/g, "\n\n")
          .trim()
          .slice(0, 9000);
      } catch (fetchErr: any) {
        if (fetchErr.name === "TimeoutError" || fetchErr.name === "AbortError") {
          return NextResponse.json(
            { error: "Request timed out. Copy the job description manually instead." },
            { status: 422 }
          );
        }
        throw fetchErr;
      }
    }

    if (pageText.length < 100) {
      return NextResponse.json(
        { error: "Could not read enough content from this page. Copy the job description manually instead." },
        { status: 422 }
      );
    }

    // Use Gemini to extract structured job info from the raw text
    const gemini = getGeminiClient();
    const model = gemini.getGenerativeModel({
      model: DEFAULT_MODEL,
      generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
    });

    const prompt = `You are a job posting parser. Extract the job information from this webpage text and return ONLY valid JSON.

Return this exact structure:
{
  "job_title": "string or null",
  "company_name": "string or null",
  "description_text": "full job description text including all responsibilities, requirements and qualifications (minimum 200 chars)",
  "role_category": "one of: Engineering, Design, Marketing, Sales, Finance, Operations, HR, Legal, Product, Data, Other — or null"
}

Rules:
- If this is NOT a job posting, return: { "error": "Not a job posting" }
- description_text must include the full requirements and responsibilities — do not truncate
- Remove navigation menus, cookie notices, headers/footers from description_text
- Return ONLY the JSON, no prose

WEBPAGE TEXT:
---
${pageText}
---`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Could not parse the job information. Try copying the description manually." },
        { status: 422 }
      );
    }

    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 422 });
    }

    if (!parsed.description_text || parsed.description_text.length < 100) {
      return NextResponse.json(
        { error: "Could not extract enough job details. Copy the description manually for best results." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      job_title: parsed.job_title || "",
      company_name: parsed.company_name || "",
      description_text: parsed.description_text,
      role_category: parsed.role_category || "",
    });
  } catch (error) {
    console.error("fetch-url error:", error);
    return NextResponse.json(
      { error: "Failed to fetch URL. Try copying the job description manually." },
      { status: 500 }
    );
  }
}
