import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { uploadLeadAssetToCloudinary } from "@/lib/cloudinary/uploadLeadAsset";
import type { IntakeAssetType } from "@prisma/client";

const VALID_ASSET_TYPES: IntakeAssetType[] = [
  "SPACE_PHOTO",
  "INSPIRATION_PHOTO",
  "VIDEO",
];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const lead = await db.intakeLead.findUnique({ where: { id } });
  if (!lead) {
    return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as IntakeAssetType | null;
  const caption = formData.get("caption") as string | null;

  if (!file || !type) {
    return NextResponse.json(
      { ok: false, error: "file and type are required" },
      { status: 400 },
    );
  }

  if (!VALID_ASSET_TYPES.includes(type)) {
    return NextResponse.json(
      { ok: false, error: `type must be one of: ${VALID_ASSET_TYPES.join(", ")}` },
      { status: 400 },
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const resourceType = file.type.startsWith("video/") ? "video" : "image";

  const uploaded = await uploadLeadAssetToCloudinary(buffer, id, resourceType);

  const asset = await db.intakeLeadAsset.create({
    data: {
      leadId: id,
      type,
      url: uploaded.secureUrl,
      cloudinaryId: uploaded.publicId,
      caption: caption ?? undefined,
    },
  });

  return NextResponse.json({ ok: true, asset }, { status: 201 });
}
