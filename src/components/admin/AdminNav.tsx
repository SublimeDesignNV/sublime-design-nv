import Link from "next/link";

const ADMIN_LINKS = [
  { href: "/admin", label: "Upload" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/content-audit", label: "Content Audit" },
  { href: "/admin/launch-audit", label: "Launch Audit" },
] as const;

export default function AdminNav() {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {ADMIN_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-full border border-gray-200 bg-white px-4 py-1.5 font-ui text-xs font-medium text-charcoal transition hover:border-red hover:text-red"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
