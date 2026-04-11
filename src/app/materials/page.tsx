import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { buildFacetCanonical } from "@/lib/seo";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wood Species & Materials | Custom Cabinetry Las Vegas | Sublime Design NV",
  description:
    "Browse Walnut, White Oak, Hard Maple, Cherry, and more wood species used in custom cabinets, built-ins, and shelves in Las Vegas. Real project photos for every material.",
  alternates: { canonical: buildFacetCanonical("/materials") },
  keywords:
    "wood species Las Vegas, walnut cabinets, white oak built-ins, maple shelves, custom wood Las Vegas NV",
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default async function MaterialsPage() {
  // Pull all unique materials from published assets and count them
  let materialCounts: { material: string; count: number }[] = [];

  try {
    const assets = await db.asset.findMany({
      where: { published: true, kind: "IMAGE" },
      select: { materials: true },
    });

    const counts = new Map<string, number>();
    for (const asset of assets) {
      for (const mat of asset.materials ?? []) {
        const m = mat.trim();
        if (m) counts.set(m, (counts.get(m) ?? 0) + 1);
      }
    }
    materialCounts = Array.from(counts.entries())
      .map(([material, count]) => ({ material, count }))
      .sort((a, b) => b.count - a.count);
  } catch {
    // DB unavailable
  }

  // Preferred order for wood species
  const FEATURED = ["Walnut", "White Oak", "Hard Maple", "Cherry", "Hickory", "Red Oak", "Maple"];
  const featured = FEATURED.filter((m) => materialCounts.some((c) => c.material === m));
  const others = materialCounts.filter((c) => !FEATURED.includes(c.material));

  return (
    <>
      <LocalBusinessSchema />
      <main className="bg-white pb-24 pt-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <p className="font-ui text-sm font-semibold uppercase tracking-[0.18em] text-red">
            Material Reference
          </p>
          <h1 className="mt-3 text-4xl text-charcoal md:text-5xl">
            Wood Species & Materials
          </h1>
          <p className="mt-4 max-w-2xl text-base text-gray-mid">
            Every species and substrate we work with — click any material to see real Las Vegas
            projects built with it and get a free quote.
          </p>

          {/* Featured wood species */}
          {featured.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl text-charcoal">Featured Wood Species</h2>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {featured.map((mat) => {
                  const count = materialCounts.find((c) => c.material === mat)?.count ?? 0;
                  return (
                    <Link
                      key={mat}
                      href={`/materials/${slugify(mat)}`}
                      className="group overflow-hidden rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
                    >
                      <p className="font-ui text-base font-bold text-charcoal group-hover:text-red">
                        {mat}
                      </p>
                      {count > 0 && (
                        <p className="mt-1 font-ui text-xs text-gray-mid">
                          {count} photo{count === 1 ? "" : "s"}
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* All other materials */}
          {others.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl text-charcoal">Substrates & Sheet Goods</h2>
              <div className="mt-6 flex flex-wrap gap-3">
                {others.map(({ material, count }) => (
                  <Link
                    key={material}
                    href={`/materials/${slugify(material)}`}
                    className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 font-ui text-sm text-charcoal transition-colors hover:border-red hover:text-red"
                  >
                    {material}
                    {count > 0 && (
                      <span className="font-ui text-xs text-gray-mid">{count}</span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {materialCounts.length === 0 && (
            <div className="mt-12 rounded-xl border border-gray-200 bg-cream px-8 py-16 text-center">
              <p className="font-ui text-base text-gray-mid">Material index loading soon.</p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 rounded-xl border border-gray-200 bg-cream px-8 py-10 text-center">
            <p className="font-ui text-xs font-semibold uppercase tracking-[0.18em] text-red">
              Let&apos;s Build
            </p>
            <h2 className="mt-3 text-2xl text-charcoal">Have a material in mind?</h2>
            <p className="mt-2 font-ui text-sm text-gray-mid">
              Tell us the species or substrate and we&apos;ll source it and build to spec.
            </p>
            <Link
              href="/quote"
              className="mt-5 inline-flex rounded-sm bg-red px-6 py-3 font-ui text-sm font-semibold text-white transition hover:opacity-90"
            >
              Get a Free Quote
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
