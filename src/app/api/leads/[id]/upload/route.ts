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

  console.log("[upload-route] POST /api/leads/[id]/upload — leadId:", id);

  try {
    const lead = await db.intakeLead.findUnique({ where: { id } });
    if (!lead) {
      console.error("[upload-route] Lead not found:", id);
      return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (err) {
      console.error("[upload-route] Failed to parse formData:", err);
      return NextResponse.json({ ok: false, error: "Failed to read upload — file may be too large" }, { status: 400 });
    }

    const file = formData.get("file") as File | null;
    const type = formData.get("type") as IntakeAssetType | null;
    const caption = formData.get("caption") as string | null;

    console.log("[upload-route] file:", file?.name, "size:", file?.size, "type field:", type);

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

    console.log("[upload-route] uploading to Cloudinary, resourceType:", resourceType, "bytes:", buffer.length);

    let uploaded;
    try {
      uploaded = await uploadLeadAssetToCloudinary(buffer, id, resourceType);
    } catch (err) {
      console.error("[upload-route] Cloudinary upload failed:", err);
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        { ok: false, error: `Upload failed: ${message}` },
        { status: 500 },
      );
    }

    console.log("[upload-route] Cloudinary upload success, publicId:", uploaded.publicId);

    const asset = await db.intakeLeadAsset.create({
      data: {
        leadId: id,
        type,
        url: uploaded.secureUrl,
        cloudinaryId: uploaded.publicId,
        caption: caption ?? undefined,
      },
    });

    console.log("[upload-route] asset saved, assetId:", asset.id);

    return NextResponse.json({ ok: true, asset }, { status: 201 });
  } catch (err) {
    console.error("[upload-route] Unexpected error:", err);
    return NextResponse.json(
      { ok: false, error: "Unexpected server error during upload" },
      { status: 500 },
    );
  }
}
