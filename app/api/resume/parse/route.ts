import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { countWords } from "@/lib/resume/extractor";

// Ensure Node.js runtime — pdf-parse and mammoth use Node APIs
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const supabase = await createAdminClient();

  try {
    const { resumeId, fileUrl, fileType } = await request.json();
    if (!resumeId || !fileUrl) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Download the file from Supabase Storage (public URL)
    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) {
      throw new Error(`Failed to download file: ${fileRes.status}`);
    }
    const buffer = Buffer.from(await fileRes.arrayBuffer());

    let extractedText = "";
    let pageCount = 1;
    const type = (fileType || "").toLowerCase();

    if (type === "pdf") {
      // Dynamic import avoids pdf-parse's test-file read at module load time
      // which causes issues in Next.js bundling
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buffer);
      extractedText = data.text;
      pageCount = data.numpages ?? 1;
    } else if (type === "docx") {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else {
      // Plain text / fallback
      extractedText = buffer.toString("utf-8");
    }

    // Normalise whitespace from PDF extraction
    extractedText = extractedText
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    const wordCount = countWords(extractedText);

    await supabase
      .from("resumes")
      .update({
        extracted_text: extractedText,
        parsed_sections: {},
        word_count: wordCount,
        page_count: pageCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", resumeId);

    return NextResponse.json({ success: true, wordCount });
  } catch (error) {
    console.error("Parse error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
