"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BREADCRUMB_MAP: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/uploads": "Upload Photos",
  "/admin/photos/unlinked": "Unlinked Photos",
  "/admin/projects": "Projects",
  "/admin/leads": "Quote Leads",
  "/admin/content-audit": "Content Audit",
  "/admin/launch-audit": "Launch Audit",
  "/admin/shooting-checklist": "Shooting Checklist",
  "/admin/backfill": "Backfill",
  "/admin/upload-batches": "Upload Batches",
  "/dashboard/leads": "Client Intakes",
  "/dashboard/leads/new": "New Lead",
};

export default function AdminBreadcrumb() {
  const pathname = usePathname();

  const pageLabel = BREADCRUMB_MAP[pathname];
  if (!pageLabel || pathname === "/admin") return null;

  return (
    <div className="flex items-center gap-1.5 font-ui text-xs text-gray-400">
      <Link href="/admin" className="transition-colors hover:text-gray-600">
        Admin
      </Link>
      <span>/</span>
      <span className="text-gray-700">{pageLabel}</span>
    </div>
  );
}
