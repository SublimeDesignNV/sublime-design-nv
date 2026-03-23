import { NextResponse } from "next/server";
import { getPublicBuildInfo } from "@/lib/buildInfo";

export async function GET() {
  return NextResponse.json({
    ok: true,
    ...getPublicBuildInfo(),
  });
}
