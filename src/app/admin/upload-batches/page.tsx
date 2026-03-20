import AdminNav from "@/components/admin/AdminNav";
import RecentUploadBatches from "@/components/admin/RecentUploadBatches";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminUploadBatchesPage({
  searchParams,
}: {
  searchParams: { batch?: string };
}) {
  await requireAdmin("/admin/upload-batches");

  return (
    <main className="bg-cream px-4 pb-16 pt-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mt-8 text-4xl text-charcoal">Recent Upload Batches</h1>
        <p className="font-ui mt-3 text-sm text-gray-mid">
          Turn a fresh upload batch into a project, attach it to an existing project, or leave it as standalone service-page proof.
        </p>
        <AdminNav />
        <div className="mt-8">
          <RecentUploadBatches focusBatchId={searchParams.batch} />
        </div>
      </div>
    </main>
  );
}
