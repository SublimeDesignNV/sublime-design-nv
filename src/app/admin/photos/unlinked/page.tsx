import AdminNav from "@/components/admin/AdminNav";
import AssetTable from "@/components/admin/AssetTable";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminUnlinkedPhotosPage() {
  await requireAdmin("/admin/photos/unlinked");

  return (
    <main className="bg-cream px-4 pb-16 pt-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mt-8 text-4xl text-charcoal">Unlinked Photos</h1>
        <p className="mt-3 max-w-3xl font-ui text-sm text-gray-mid">
          Fix photos that are visible and renderable but still need project linkage. Create a project from a selection or attach selected photos to an existing project.
        </p>
        <AdminNav />

        <div className="mt-8">
          <AssetTable
            title="Unlinked Photos"
            description="Use this workspace to repair project linkage, bulk-create projects, and clean up photos that are still living outside the project system."
            defaultFilter="orphans"
            availableFilters={["orphans", "published", "unpublished", "all"]}
          />
        </div>
      </div>
    </main>
  );
}
