import AdminNav from "@/components/admin/AdminNav";
import ProjectTable from "@/components/admin/ProjectTable";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  await requireAdmin("/admin/projects");

  return (
    <main className="bg-cream px-4 pb-16 pt-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mt-8 text-4xl text-charcoal">Projects</h1>
        <p className="mt-3 max-w-3xl font-ui text-sm text-gray-mid">
          Manage project details, reorder photos, choose cover images, and control publish, feature, and visibility settings from one focused workspace.
        </p>
        <AdminNav />

        <div className="mt-8">
          <ProjectTable />
        </div>
      </div>
    </main>
  );
}
