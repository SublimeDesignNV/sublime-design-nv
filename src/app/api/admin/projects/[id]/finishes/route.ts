import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { ProjectFinish } from "@/types/project";

function validateFinishes(data: unknown): { ok: true; finishes: ProjectFinish[] } | { ok: false; error: string } {
  if (!Array.isArray(data)) {
    return { ok: false, error: "finishes must be an array." };
  }
  for (const item of data) {
    if (typeof item !== "object" || item === null) {
      return { ok: false, error: "Each finish must be an object." };
    }
    const f = item as Record<string, unknown>;
    if (typeof f.id !== "string" || !f.id) {
      return { ok: false, error: "Each finish must have an id." };
    }
    if (typeof f.name !== "string" || !f.name.trim()) {
      return { ok: false, error: "Each finish must have a name." };
    }
    const valid = ["wood", "paint", "stain", "hardware", "lighting", "product", "other"];
    if (typeof f.category !== "string" || !valid.includes(f.category)) {
      return { ok: false, error: `Invalid category: ${String(f.category)}` };
    }
  }
  return { ok: true, finishes: data as ProjectFinish[] };
}

export async function GET(
  _request: NextRequest,
  context: { params: { id: string } },
) {
  if (!(await requireAdminApiSession())) {
    return unauthorizedResponse();
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is not configured." }, { status: 503 });
  }

  const project = await db.project.findUnique({
    where: { id: context.params.id },
    select: { finishes: true },
  });

  if (!project) {
    return NextResponse.json({ ok: false, error: "Project not found." }, { status: 404 });
  }

  const finishes = Array.isArray(project.finishes) ? project.finishes : [];
  return NextResponse.json({ ok: true, finishes });
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } },
) {
  if (!(await requireAdminApiSession())) {
    return unauthorizedResponse();
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is not configured." }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as { finishes?: unknown };
  const validation = validateFinishes(body.finishes ?? []);
  if (!validation.ok) {
    return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
  }

  try {
    await db.project.update({
      where: { id: context.params.id },
      data: { finishes: validation.finishes as unknown as Prisma.InputJsonValue },
    });
    return NextResponse.json({ ok: true, finishes: validation.finishes });
  } catch {
    return NextResponse.json({ ok: false, error: "Project not found." }, { status: 404 });
  }
}
