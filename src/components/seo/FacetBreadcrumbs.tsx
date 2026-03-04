import Link from "next/link";

type Crumb = {
  label: string;
  href: string;
};

export default function FacetBreadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  if (!crumbs.length) return null;

  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: 12, fontSize: 13 }}>
      {crumbs.map((crumb, index) => (
        <span key={`${crumb.href}-${crumb.label}`}>
          {index > 0 ? " / " : ""}
          <Link href={crumb.href}>{crumb.label}</Link>
        </span>
      ))}
    </nav>
  );
}
