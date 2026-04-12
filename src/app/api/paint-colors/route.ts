import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const ALLOWED_ORIGINS = [
  "https://fieldmetriq.com",
  "https://www.fieldmetriq.com",
  "http://localhost:3001",
  "http://localhost:3000",
];

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : "",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "";
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "";
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const brand = req.nextUrl.searchParams.get("brand");
  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 20, 100) : 20;

  if (!q || q.length < 2) {
    return NextResponse.json([], { headers: corsHeaders(origin) });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json([], { headers: corsHeaders(origin) });
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

  return NextResponse.json(colors, { headers: corsHeaders(origin) });
}
