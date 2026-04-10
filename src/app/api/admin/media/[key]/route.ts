import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth, isAllowedAdminEmail } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const media = await db.siteMedia.findUnique({ where: { key } });
  if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(media);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const session = await auth();
  if (!session?.user?.email || !isAllowedAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await params;
  const body = await req.json();
  const { url, publicId, mediaType, alt } = body as {
    url: string;
    publicId: string;
    mediaType: string;
    alt?: string;
  };

  if (!url || !publicId || !mediaType) {
    return NextResponse.json({ error: "url, publicId, and mediaType are required" }, { status: 400 });
  }

  const media = await db.siteMedia.upsert({
    where: { key },
    update: { url, publicId, mediaType, alt: alt ?? null },
    create: { key, url, publicId, mediaType, alt: alt ?? null },
  });

  revalidatePath("/");
  return NextResponse.json(media);
}
