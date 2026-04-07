
import ProjectTable from "@/components/admin/ProjectTable";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  await requireAdmin("/admin/projects");

  return (
    <main className="bg-cream px-4 pb-16 pt-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mt-8 text-4xl text-charcoal">Projects</h1>


        <div className="mt-8">
          <ProjectTable />
        </div>
      </div>
    </main>
  );
}
