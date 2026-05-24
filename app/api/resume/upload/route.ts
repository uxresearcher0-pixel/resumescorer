import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateResumeFile, getFileType } from "@/lib/resume/validator";

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

    // Upload to Supabase Storage
    const ext = file.name.split(".").pop();
    const storagePath = `resumes/${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(storagePath, file, { contentType: file.type, upsert: false });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(storagePath);

    // Create resume record
    const { data: resume, error: dbError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: getFileType(file.type),
        file_size_kb: Math.round(file.size / 1024),
      })
      .select("id")
      .single();

    if (dbError) throw dbError;

    // Trigger text extraction async (fire and forget)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/resume/parse`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` },
      body: JSON.stringify({ resumeId: resume.id, fileUrl: urlData.publicUrl, fileType: getFileType(file.type) }),
    }).catch(console.error);

    return NextResponse.json({ resumeId: resume.id, fileUrl: urlData.publicUrl, fileName: file.name });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
