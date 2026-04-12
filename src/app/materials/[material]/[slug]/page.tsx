import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { buildFacetCanonical, getSiteUrl } from "@/lib/seo";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";
import BreadcrumbTrail from "@/components/seo/BreadcrumbTrail";

export const dynamic = "force-dynamic";

type Props = {
  params: { material: string; slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const material = await db.material.findUnique({
    where: { slug: params.slug },
    include: { category: true, manufacturer: true },
  }).catch(() => null);

  if (!material) return {};

  const siteUrl = getSiteUrl();
  const title = `${material.name} by ${material.manufacturer.name} | Las Vegas Custom Cabinetry`;
  const description = material.description ?? `${material.name} — ${material.category.name} by ${material.manufacturer.name}. Used in custom cabinetry, built-ins, and millwork throughout Las Vegas, NV.`;

  return {
    title,
    description,
    alternates: { canonical: buildFacetCanonical(`/materials/${params.material}/${params.slug}`) },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/materials/${params.material}/${params.slug}`,
    },
  };
}

export default async function MaterialDetailPage({ params }: Props) {
  const material = await db.material.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      manufacturer: true,
      pricing: {
        where: {},
        include: { supplier: true },
        orderBy: [{ isPreferred: "desc" }, { createdAt: "asc" }],
      },
    },
  }).catch(() => null);

  if (!material || material.category.slug !== params.material) notFound();

  const specs = [
    material.grade && { label: "Grade", value: material.grade },
    material.sheen && { label: "Sheen", value: material.sheen },
    material.finish && { label: "Finish", value: material.finish },
    material.thickness && { label: "Thickness", value: material.thickness },
    material.sku && { label: "SKU", value: material.sku },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <>
      <LocalBusinessSchema />
      <main className="bg-white pb-24 pt-24">
        <div className="mx-auto max-w-4xl px-4 md:px-8">
          <BreadcrumbTrail
            crumbs={[
              { label: "Home", href: "/" },
              { label: "Materials", href: "/materials" },
              { label: material.category.name, href: `/materials/${params.material}` },
              { label: material.name, href: `/materials/${params.material}/${params.slug}` },
            ]}
          />

          <p className="font-ui text-sm font-semibold uppercase tracking-[0.18em] text-red">
            {material.category.name}
          </p>
          <h1 className="mt-3 text-4xl text-charcoal md:text-5xl">{material.name}</h1>
          <p className="mt-1 font-ui text-base text-gray-mid">by {material.manufacturer.name}</p>

          {material.description && (
            <p className="mt-5 max-w-2xl text-base text-gray-mid">{material.description}</p>
          )}

          {/* Specs */}
          {specs.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {specs.map(({ label, value }) => (
                <div key={label} className="rounded-lg border border-gray-200 bg-cream px-4 py-3">
                  <p className="font-ui text-xs font-semibold uppercase tracking-[0.12em] text-gray-mid">
                    {label}
                  </p>
                  <p className="mt-0.5 font-ui text-sm font-medium text-charcoal">{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Supplier pricing */}
          {material.pricing.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-semibold text-charcoal">Available From</h2>
              <div className="mt-4 space-y-3">
                {material.pricing.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-ui text-sm font-semibold text-charcoal">
                        {p.supplier.name}
                        {p.isPreferred && (
                          <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 font-ui text-xs font-medium text-green-700">
                            Preferred
                          </span>
                        )}
                      </p>
                      {p.unit && (
                        <p className="font-ui text-xs text-gray-mid">Unit: {p.unit}</p>
                      )}
                      {p.notes && (
                        <p className="mt-1 font-ui text-xs text-gray-mid">{p.notes}</p>
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
                        {p.cutPrice && (
                          <p className="font-ui text-sm text-gray-mid">
                            ${p.cutPrice.toFixed(2)} / {p.cutUnit ?? "cut"}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Manufacturer info */}
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-charcoal">Manufacturer</h2>
            <div className="mt-3 rounded-lg border border-gray-200 bg-cream px-5 py-4">
              <p className="font-ui text-sm font-semibold text-charcoal">{material.manufacturer.name}</p>
              {material.manufacturer.description && (
                <p className="mt-1 font-ui text-xs text-gray-mid">{material.manufacturer.description}</p>
              )}
              {material.manufacturer.website && (
                <a
                  href={material.manufacturer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block font-ui text-xs font-semibold text-red hover:underline"
                >
                  Visit Website →
                </a>
              )}
            </div>
          </section>

          {/* CTA */}
          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              href={`/quote?material=${encodeURIComponent(material.name)}`}
              className="font-ui inline-flex rounded-sm bg-red px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Quote a Project Using {material.name}
            </Link>
            <Link
              href={`/materials/${params.material}`}
              className="font-ui inline-flex rounded-sm border border-gray-200 px-6 py-3 text-sm font-semibold text-charcoal transition hover:border-red hover:text-red"
            >
              ← {material.category.name}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
