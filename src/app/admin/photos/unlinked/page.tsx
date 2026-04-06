
import AssetTable from "@/components/admin/AssetTable";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminUnlinkedPhotosPage() {
  await requireAdmin("/admin/photos/unlinked");

  return (
    <main className="bg-cream px-4 pb-16 pt-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mt-8 text-4xl text-charcoal">Photos Needing a Project</h1>
        <p className="mt-3 max-w-3xl font-ui text-sm text-gray-mid">
          These photos are live on the site but have no project assigned. Select one or more, then create a new project or attach to an existing one.
        </p>

        <div className="mt-8">
          <AssetTable
            title="Unlinked Photos"
            description="Select photos to create a project or link to an existing one."
            defaultFilter="orphans"
            availableFilters={["orphans"]}
          />
        </div>
      </div>
    </main>
  );
}
