import GalleryClient from "@/components/gallery/GalleryClient";
import { listAssetsByFolders } from "@/lib/cloudinary.server";
import { GALLERY_SECTIONS } from "@/lib/gallery.config";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const folders = GALLERY_SECTIONS.map((s) => s.folder);
  const byFolder = await listAssetsByFolders(folders, 48);
  const sections = GALLERY_SECTIONS.map((section) => {
    const assets = (byFolder[section.folder] ?? []).slice(0, 24);
    return {
      title: section.title,
      slug: section.slug,
      items: assets.map((asset) => ({
        public_id: asset.public_id,
        alt: `${section.title} - ${asset.public_id.split("/").pop() ?? "image"}`,
      })),
    };
  }).filter((section) => section.items.length > 0);

  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 24 }}>Gallery</h1>
      <GalleryClient sections={sections} />
    </main>
  );
}
