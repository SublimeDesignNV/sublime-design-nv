import Link from "next/link";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import { auth } from "@/lib/auth";

const ADMIN_LINKS = [
  { href: "/admin", label: "Photos" },
  { href: "/admin", label: "Project Workflow" },
  { href: "/admin/upload-batches", label: "Upload Batches" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/content-audit", label: "Content Audit" },
  { href: "/admin/launch-audit", label: "Launch Audit" },
] as const;

export default async function AdminNav() {
  const session = await auth();
  const identity = session?.user?.email || session?.user?.name || "Authorized admin";

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      {ADMIN_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-full border border-gray-200 bg-white px-4 py-1.5 font-ui text-xs font-medium text-charcoal transition hover:border-red hover:text-red"
        >
          {link.label}
        </Link>
      ))}
      <span className="rounded-full border border-gray-200 bg-white px-4 py-1.5 font-ui text-xs text-gray-mid">
        Signed in as {identity}
      </span>
      <AdminLogoutButton />
    </div>
  );
}
