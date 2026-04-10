import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth, isAllowedAdminEmail } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || !isAllowedAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const media = await db.siteMedia.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json(media);
}
