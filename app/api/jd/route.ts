import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { job_title, company_name, description_text, role_category } = body;

    if (!job_title || !description_text) {
      return NextResponse.json({ error: "job_title and description_text are required" }, { status: 400 });
    }

    const { data: jd, error } = await supabase
      .from("job_descriptions")
      .insert({ user_id: user.id, job_title, company_name, description_text, role_category })
      .select("id")
      .single();

    if (error) throw error;
    return NextResponse.json({ jdId: jd.id });
  } catch (error) {
    console.error("JD create error:", error);
    return NextResponse.json({ error: "Failed to save job description" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("job_descriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ jobDescriptions: data });
}
