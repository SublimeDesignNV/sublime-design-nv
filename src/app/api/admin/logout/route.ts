import { NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/adminAuth";

export async function POST() {
  const response = NextResponse.json({ ok: true, redirectTo: "/admin/login" });
  clearAdminCookie(response);
  return response;
}
