import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public endpoint — no auth required
// Used by upload form MaterialTypePicker to build dynamic category→manufacturer→supplier→product hierarchy
export async function GET() {
  const categories = await db.materialCategory.findMany({
    include: {
      materials: {
        where: { isPublic: true },
        include: {
          manufacturer: { select: { id: true, name: true, slug: true } },
          pricing: {
            include: { supplier: { select: { id: true, name: true, slug: true } } },
            orderBy: [{ isPreferred: "desc" }],
          },
        },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  // Transform into the hierarchy the picker needs:
  // category → manufacturers (with their suppliers) → materials per manufacturer
  const result = categories.map((cat) => {
    const mfgMap = new Map<
      string,
      {
        id: string;
        name: string;
        slug: string;
        suppliers: { id: string; name: string; slug: string }[];
        materials: { id: string; name: string; sku: string | null; sheen: string | null; slug: string }[];
      }
    >();

    for (const mat of cat.materials) {
      const mfg = mat.manufacturer;
      if (!mfgMap.has(mfg.id)) {
        mfgMap.set(mfg.id, { ...mfg, suppliers: [], materials: [] });
      }
      const entry = mfgMap.get(mfg.id)!;
      // Add material
      entry.materials.push({ id: mat.id, name: mat.name, sku: mat.sku, sheen: mat.sheen, slug: mat.slug });
      // Collect unique suppliers for this manufacturer
      for (const pricing of mat.pricing) {
        if (!entry.suppliers.find((s) => s.id === pricing.supplier.id)) {
          entry.suppliers.push(pricing.supplier);
        }
      }
    }

    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      manufacturers: Array.from(mfgMap.values()),
    };
  });

  return NextResponse.json(result, {
    headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
  });
}
