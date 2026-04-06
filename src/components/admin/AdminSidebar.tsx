"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Camera,
  ClipboardList,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  LayoutDashboard,
  Menu,
  Rocket,
  Upload,
  Users,
  X,
} from "lucide-react";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/leads", label: "Client Intakes", icon: Users },
  { href: "/admin/uploads", label: "Upload Photos", icon: Upload },
  { href: "/admin/photos/unlinked", label: "Unlinked Photos", icon: ImageIcon },
  { href: "/admin/projects", label: "Projects", icon: FolderOpen },
  { href: "/admin/leads", label: "Quote Leads", icon: FileText },
  { href: "/admin/shooting-checklist", label: "Shooting Checklist", icon: Camera },
  { href: "/admin/content-audit", label: "Content Audit", icon: ClipboardList },
  { href: "/admin/launch-audit", label: "Launch Audit", icon: Rocket },
] as const;

function NavLink({
  href,
  label,
  icon: Icon,
  exact,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  active: boolean;
  onClick?: () => void;
}) {
  void exact;
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-ui text-sm transition-colors ${
        active
          ? "bg-white/10 text-white"
          : "text-white/70 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon className={`h-4 w-4 flex-shrink-0 ${active ? "text-red" : "text-white/50"}`} />
      <span>{label}</span>
      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-red" />
      )}
    </Link>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-5">
        <Link href="/admin" onClick={() => setMobileOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-light.png"
            alt="Sublime Design NV"
            className="h-8 w-auto"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-0.5">
          {ADMIN_LINKS.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              icon={link.icon}
              exact={"exact" in link ? link.exact : undefined}
              active={isActive(link.href, "exact" in link ? link.exact : undefined)}
              onClick={() => setMobileOpen(false)}
            />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-4 py-3">
        <p className="font-ui text-[10px] uppercase tracking-[0.16em] text-white/30">
          Admin
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-white shadow-lg md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed left-0 top-0 z-50 h-full w-60 bg-navy shadow-2xl transition-transform duration-200 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-white/50 hover:text-white"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <div className="fixed left-0 top-0 hidden h-full w-60 flex-col bg-navy shadow-xl md:flex">
        {sidebarContent}
      </div>
    </>
  );
}
