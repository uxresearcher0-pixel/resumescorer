import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "resume-fit-ai",
    timestamp: new Date().toISOString(),
  });
}
