import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  const pricing = await prisma.supplierPricing.findMany({
    where: { materialId: id },
    include: {
      supplier: { select: { name: true } },
    },
    orderBy: [{ isPreferred: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(pricing);
}
