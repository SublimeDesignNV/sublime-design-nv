
import AssetUploader from "@/components/admin/AssetUploader";
import RecentUploadBatches from "@/components/admin/RecentUploadBatches";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminUploadsPage({
  searchParams,
}: {
  searchParams: { batch?: string };
}) {
  await requireAdmin("/admin/uploads");

  return (
    <main className="bg-cream px-4 pb-16 pt-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mt-8 text-4xl text-charcoal">Uploads</h1>
        <p className="mt-3 max-w-3xl font-ui text-sm text-gray-mid">
          Upload new photos, review recent batches, and turn a fresh batch into a project without digging through the full content library.
        </p>
        

        <div className="mt-8 space-y-6">
          <AssetUploader />
          <RecentUploadBatches focusBatchId={searchParams.batch} />
        </div>
      </div>
    </main>
  );
}
