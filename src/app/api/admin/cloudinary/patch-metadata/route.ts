import { type NextRequest, NextResponse } from "next/server";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { addAssetTags, updateAssetContext } from "@/lib/cloudinary.server";

type PatchMetadataBody = {
  publicIds?: string[];
  context?: Record<string, string>;
  addTags?: string[];
};

function normalizeContext(input: unknown) {
  if (!input || typeof input !== "object") return {};

  const entries: Array<[string, string]> = [];
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (!key.trim() || typeof value !== "string") continue;
    const trimmedValue = value.trim();
    if (!trimmedValue) continue;
    entries.push([key.trim(), trimmedValue]);
  }

  return Object.fromEntries(entries);
}

function normalizeTags(input: unknown) {
  if (!Array.isArray(input)) return [];

  return Array.from(
    new Set(
      input
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

export async function POST(request: NextRequest) {
  if (!(await requireAdminApiSession())) {
    return unauthorizedResponse();
  }

  const body = (await request.json().catch(() => ({}))) as PatchMetadataBody;
  const publicIds = Array.from(
    new Set(
      (body.publicIds ?? [])
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );

  if (!publicIds.length || publicIds.length > 50) {
    return NextResponse.json(
      { ok: false, error: "publicIds must contain 1 to 50 values" },
      { status: 400 },
    );
  }

  const context = normalizeContext(body.context);
  const addTags = normalizeTags(body.addTags);

  if (!Object.keys(context).length && addTags.length === 0) {
    return NextResponse.json(
      { ok: false, error: "context and/or addTags are required" },
      { status: 400 },
    );
  }

  let updated = 0;
  const failed: { public_id: string; error: string }[] = [];

  for (const publicId of publicIds) {
    try {
      if (Object.keys(context).length) {
        await updateAssetContext(publicId, context);
      }

      if (addTags.length) {
        await addAssetTags(publicId, addTags);
      }

      updated += 1;
    } catch (error) {
      failed.push({
        public_id: publicId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({ ok: true, updated, failed });
}
