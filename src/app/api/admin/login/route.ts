import { NextResponse } from "next/server";
import { isAdminTokenValid, setAdminCookie } from "@/lib/adminAuth";

type LoginRequestBody = {
  token?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginRequestBody;
  const token = body.token;

  if (!isAdminTokenValid(token)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  setAdminCookie(response, token as string);
  return response;
}
