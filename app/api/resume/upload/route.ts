import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateResumeFile, getFileType } from "@/lib/resume/validator";
import { countWords } from "@/lib/resume/extractor";

// Node runtime needed for pdf-parse and mammoth
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const validation = validateResumeFile(file);
    if (!validation.valid) return NextResponse.json({ error: validation.error }, { status: 400 });

    const fileType = getFileType(file.type);

    // ── 1. Parse text FIRST (synchronous, before storage upload) ──────────────
    let extractedText = "";
    let pageCount = 1;
    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      if (fileType === "pdf") {
        const pdfParse = (await import("pdf-parse")).default;
        const data = await pdfParse(buffer);
        extractedText = data.text ?? "";
        pageCount = data.numpages ?? 1;
      } else if (fileType === "docx") {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value ?? "";
      } else {
        extractedText = buffer.toString("utf-8");
      }

      // Normalise whitespace
      extractedText = extractedText
        .replace(/\r\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    } catch (parseErr) {
      console.error("Text extraction failed:", parseErr);
      // Continue — we'll store empty text; analysis will still attempt
    }

    const wordCount = countWords(extractedText);

    // ── 2. Upload file to Supabase Storage ────────────────────────────────────
    const ext = file.name.split(".").pop();
    const storagePath = `resumes/${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(storagePath, buffer, { contentType: file.type, upsert: false });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(storagePath);

    // ── 3. Create resume record WITH extracted text already set ───────────────
    const { data: resume, error: dbError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: fileType,
        file_size_kb: Math.round(file.size / 1024),
        extracted_text: extractedText,
        word_count: wordCount,
        page_count: pageCount,
        parsed_sections: {},
      })
      .select("id")
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({
      resumeId: resume.id,
      fileUrl: urlData.publicUrl,
      fileName: file.name,
      wordCount,
      extractedLength: extractedText.length,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
