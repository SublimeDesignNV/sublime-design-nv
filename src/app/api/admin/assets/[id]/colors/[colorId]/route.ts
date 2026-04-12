import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; colorId: string } },
) {
  // colorId is the AssetPaintColor join record id (tagId)
  await prisma.assetPaintColor.deleteMany({
    where: { id: params.colorId, assetId: params.id },
  });

  return NextResponse.json({ success: true });
}
