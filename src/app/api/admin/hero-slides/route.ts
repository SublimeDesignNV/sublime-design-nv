import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth, isAllowedAdminEmail } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || !isAllowedAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slides = await db.heroSlide.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(slides);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email || !isAllowedAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url, publicId, mediaType, alt } = await req.json() as {
    url: string;
    publicId: string;
    mediaType: string;
    alt?: string;
  };

  const last = await db.heroSlide.findFirst({ orderBy: { order: "desc" } });
  const slide = await db.heroSlide.create({
    data: { url, publicId, mediaType, alt, order: (last?.order ?? -1) + 1 },
  });
  return NextResponse.json(slide);
}
