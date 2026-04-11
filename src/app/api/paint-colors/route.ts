import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const brand = req.nextUrl.searchParams.get("brand");
  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 20, 100) : 20;

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json([]);
  }

  const brandFilter = brand && brand !== "All Brands" ? { brand } : {};

  const colors = await db.paintColor.findMany({
    where: {
      ...brandFilter,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { code: { contains: q, mode: "insensitive" } },
      ],
    },
    take: limit,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(colors);
}
