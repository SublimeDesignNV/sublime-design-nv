import Link from "next/link";
import { getSiteUrl } from "@/lib/seo";

export type BreadcrumbCrumb = {
  label: string;
  href: string;
};

export default function BreadcrumbTrail({ crumbs }: { crumbs: BreadcrumbCrumb[] }) {
  if (!crumbs.length) return null;

  const siteUrl = getSiteUrl();
  const itemListElement = crumbs.map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.label,
    item: `${siteUrl}${crumb.href}`,
  }));

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-mid">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <span key={`${crumb.href}-${crumb.label}`} className="flex items-center gap-2">
              {index > 0 ? <span>/</span> : null}
              {isLast ? (
                <span className="text-charcoal">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-red">
                  {crumb.label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
}
