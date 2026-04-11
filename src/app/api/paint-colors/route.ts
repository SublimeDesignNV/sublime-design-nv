import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const brand = req.nextUrl.searchParams.get("brand") ?? "Sherwin-Williams";

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json([]);
  }

  const colors = await db.paintColor.findMany({
    where: {
      brand,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { code: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 20,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(colors);
}
