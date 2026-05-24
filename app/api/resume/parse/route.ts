import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { countWords } from "@/lib/resume/extractor";

export async function POST(request: NextRequest) {
  const supabase = await createAdminClient();

  try {
    const { resumeId, fileUrl, fileType } = await request.json();
    if (!resumeId || !fileUrl) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // Call Python parser service
    const parserUrl = process.env.PYTHON_PARSER_URL || "http://localhost:8000";
    const parserRes = await fetch(`${parserUrl}/parse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_url: fileUrl, file_type: fileType }),
    });

    if (!parserRes.ok) {
      console.error("Parser error:", await parserRes.text());
      return NextResponse.json({ error: "Parsing failed" }, { status: 500 });
    }

    const parsed = await parserRes.json();
    const wordCount = countWords(parsed.extracted_text || "");

    await supabase
      .from("resumes")
      .update({
        extracted_text: parsed.extracted_text,
        parsed_sections: parsed.sections,
        word_count: wordCount,
        page_count: parsed.page_count,
        updated_at: new Date().toISOString(),
      })
      .eq("id", resumeId);

    return NextResponse.json({ success: true, wordCount });
  } catch (error) {
    console.error("Parse error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
