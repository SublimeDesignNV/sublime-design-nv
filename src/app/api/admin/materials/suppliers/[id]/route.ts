import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  await prisma.supplier.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
