import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminApiSession();
  if (!session) return unauthorizedResponse();

  const { id } = await params;

  await db.intakeLeadAsset.deleteMany({ where: { leadId: id } });
  await db.intakeLead.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
