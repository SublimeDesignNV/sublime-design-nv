import AdminNav from "@/components/admin/AdminNav";
import AssetTable from "@/components/admin/AssetTable";
import AssetUploader from "@/components/admin/AssetUploader";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  requireAdmin("/admin");

  return (
    <main className="bg-cream px-4 pb-16 pt-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mt-8 text-4xl text-charcoal">Portfolio Admin</h1>
        <p className="font-ui mt-3 text-sm text-gray-mid">
          Upload new files, tag by service type, and publish/unpublish assets.
        </p>
        <AdminNav />

        <div className="mt-8 space-y-6">
          <AssetUploader />
          <AssetTable />
        </div>
      </div>
    </main>
  );
}
