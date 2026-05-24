import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: report, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", params.reportId)
    .eq("user_id", user.id)
    .single();

  if (error || !report) return NextResponse.json({ error: "Report not found" }, { status: 404 });
  return NextResponse.json({ report });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("reports")
    .delete()
    .eq("id", params.reportId)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
