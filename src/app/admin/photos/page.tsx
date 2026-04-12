import AssetUploader from "@/components/admin/AssetUploader";
import AssetTable from "@/components/admin/AssetTable";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPhotosPage() {
  await requireAdmin("/admin/photos");

  return (
    <main className="bg-cream px-4 pb-16 pt-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mt-8 text-4xl text-charcoal">Photos</h1>
        <p className="mt-3 max-w-3xl font-ui text-sm text-gray-mid">
          Upload new photos and manage your full library — set heroes, assign to projects, and publish.
        </p>

        <div className="mt-8 space-y-10">
          <AssetUploader />

          <AssetTable
            title="Photo Library"
            description="All uploaded photos. Use the filters to find unassigned photos or browse by status."
            defaultFilter="all"
            availableFilters={["all", "published", "unpublished", "orphans"]}
          />
        </div>
      </div>
    </main>
  );
}
