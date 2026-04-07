import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminBreadcrumb from "@/components/admin/AdminBreadcrumb";

export const metadata: Metadata = {
  title: {
    default: "Sublime Design NV | Admin",
    template: "%s | Admin — Sublime Design NV",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <AdminSidebar />
      {/* Breadcrumb bar — sits at very top right of sidebar on desktop, below hamburger on mobile */}
      <div className="fixed left-0 right-0 top-0 z-30 flex h-12 items-center gap-3 bg-[#2E4BB5] px-4 md:left-60 md:px-6">
        <AdminBreadcrumb />
      </div>
      {/* Content — offset for sidebar on desktop, top bar everywhere */}
      <div className="pt-12 md:pl-60">
        {children}
      </div>
    </div>
  );
}
