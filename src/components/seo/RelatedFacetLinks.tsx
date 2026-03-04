import Link from "next/link";

type RelatedLink = {
  label: string;
  href: string;
};

export default function RelatedFacetLinks({
  title,
  links,
}: {
  title: string;
  links: RelatedLink[];
}) {
  if (!links.length) return null;

  return (
    <section style={{ marginTop: 16 }}>
      <h3 style={{ margin: "0 0 8px" }}>{title}</h3>
      <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
