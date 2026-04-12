import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { buildFacetCanonical } from "@/lib/seo";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Local Material Suppliers | Las Vegas Custom Cabinetry | Sublime Design NV",
  description:
    "The local Las Vegas suppliers we source from — Intermountain Wood Products, Peterman Lumber, EB Bradley, Royal Plywood, and more. Quality sheet goods and hardwood for custom cabinetry.",
  alternates: { canonical: buildFacetCanonical("/suppliers") },
  keywords: "lumber suppliers Las Vegas, cabinet materials Las Vegas, sheet goods Las Vegas NV",
};

export default async function SuppliersPage() {
  const suppliers = await db.supplier.findMany({
    include: { _count: { select: { pricing: true } } },
    orderBy: { name: "asc" },
  }).catch(() => []);

  return (
    <>
      <LocalBusinessSchema />
      <main className="bg-white pb-24 pt-24">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <p className="font-ui text-sm font-semibold uppercase tracking-[0.18em] text-red">
            Where We Source
          </p>
          <h1 className="mt-3 text-4xl text-charcoal md:text-5xl">Our Material Suppliers</h1>
          <p className="mt-4 max-w-2xl text-base text-gray-mid">
            We source from established Las Vegas-area suppliers to keep lead times short and quality consistent.
          </p>

          {suppliers.length > 0 ? (
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {suppliers.map((s) => (
                <Link
                  key={s.id}
                  href={`/suppliers/${s.slug}`}
                  className="group rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
                >
                  <h2 className="font-ui text-lg font-bold text-charcoal group-hover:text-red">
                    {s.name}
                  </h2>
                  {(s.city || s.state) && (
                    <p className="mt-0.5 font-ui text-xs text-gray-mid">
                      {[s.city, s.state].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {s.description && (
                    <p className="mt-2 font-ui text-sm text-gray-mid line-clamp-2">
                      {s.description}
                    </p>
                  )}
                  {s._count.pricing > 0 && (
                    <p className="mt-3 font-ui text-xs font-semibold text-red">
                      {s._count.pricing} material{s._count.pricing === 1 ? "" : "s"} →
                    </p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-xl border border-gray-200 bg-cream px-8 py-16 text-center">
              <p className="font-ui text-base text-gray-mid">Supplier directory loading soon.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
