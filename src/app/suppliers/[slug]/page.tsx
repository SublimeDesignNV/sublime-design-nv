import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { buildFacetCanonical, getSiteUrl } from "@/lib/seo";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";
import BreadcrumbTrail from "@/components/seo/BreadcrumbTrail";

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supplier = await db.supplier.findUnique({ where: { slug: params.slug } }).catch(() => null);
  if (!supplier) return {};

  const siteUrl = getSiteUrl();
  const title = `${supplier.name} | Material Supplier Las Vegas | Sublime Design NV`;
  const description = supplier.description ?? `${supplier.name} — material supplier serving Las Vegas custom woodwork and cabinetry contractors.`;

  return {
    title,
    description,
    alternates: { canonical: buildFacetCanonical(`/suppliers/${params.slug}`) },
    openGraph: { title, description, url: `${siteUrl}/suppliers/${params.slug}` },
  };
}

export default async function SupplierDetailPage({ params }: Props) {
  const supplier = await db.supplier.findUnique({
    where: { slug: params.slug },
    include: {
      pricing: {
        include: {
          material: {
            include: {
              category: { select: { name: true, slug: true } },
              manufacturer: { select: { name: true } },
            },
          },
        },
        orderBy: [{ isPreferred: "desc" }, { material: { name: "asc" } }],
      },
    },
  }).catch(() => null);

  if (!supplier) notFound();

  return (
    <>
      <LocalBusinessSchema />
      <main className="bg-white pb-24 pt-24">
        <div className="mx-auto max-w-4xl px-4 md:px-8">
          <BreadcrumbTrail
            crumbs={[
              { label: "Home", href: "/" },
              { label: "Suppliers", href: "/suppliers" },
              { label: supplier.name, href: `/suppliers/${params.slug}` },
            ]}
          />

          <p className="font-ui text-sm font-semibold uppercase tracking-[0.18em] text-red">
            Material Supplier
          </p>
          <h1 className="mt-3 text-4xl text-charcoal md:text-5xl">{supplier.name}</h1>

          {(supplier.city || supplier.state) && (
            <p className="mt-1 font-ui text-base text-gray-mid">
              {[supplier.city, supplier.state].filter(Boolean).join(", ")}
            </p>
          )}

          {supplier.description && (
            <p className="mt-5 max-w-2xl text-base text-gray-mid">{supplier.description}</p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            {supplier.website && (
              <a
                href={supplier.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-ui inline-flex rounded-sm border border-gray-200 px-4 py-2 text-sm font-semibold text-charcoal transition hover:border-red hover:text-red"
              >
                Visit Website →
              </a>
            )}
            {supplier.phone && (
              <a
                href={`tel:${supplier.phone}`}
                className="font-ui inline-flex rounded-sm border border-gray-200 px-4 py-2 text-sm font-semibold text-charcoal transition hover:border-red hover:text-red"
              >
                {supplier.phone}
              </a>
            )}
          </div>

          {/* Materials available from this supplier */}
          {supplier.pricing.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-semibold text-charcoal">
                Materials Available from {supplier.name}
              </h2>
              <div className="mt-5 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
                {supplier.pricing.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <Link
                        href={`/materials/${p.material.category.slug}/${p.material.slug}`}
                        className="font-ui text-sm font-semibold text-charcoal hover:text-red"
                      >
                        {p.material.name}
                        {p.isPreferred && (
                          <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 font-ui text-xs font-medium text-green-700">
                            Preferred
                          </span>
                        )}
                      </Link>
                      <p className="font-ui text-xs text-gray-mid">
                        {p.material.category.name} · {p.material.manufacturer.name}
                      </p>
                      {p.notes && (
                        <p className="mt-0.5 font-ui text-xs text-gray-mid">{p.notes}</p>
                      )}
                    </div>
                    {(p.sheetPrice || p.cutPrice) && (
                      <div className="text-right">
                        {p.sheetPrice && (
                          <p className="font-ui text-sm font-semibold text-charcoal">
                            ${p.sheetPrice.toFixed(2)}
                            <span className="ml-1 font-normal text-gray-mid">/ sheet</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
