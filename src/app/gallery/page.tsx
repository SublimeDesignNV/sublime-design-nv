import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { listAssetsByFolders } from "@/lib/cloudinary.server";
import { GALLERY_SECTIONS } from "@/lib/gallery.config";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const folders = GALLERY_SECTIONS.map((s) => s.folder);
  const byFolder = await listAssetsByFolders(folders, 48);

  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 24 }}>Gallery</h1>

      {GALLERY_SECTIONS.map((section) => {
        const assets = (byFolder[section.folder] ?? []).slice(0, 24);
        if (!assets.length) return null;

        return (
          <section key={section.slug} style={{ marginBottom: 48 }}>
            <h2 style={{ margin: "0 0 16px 0" }}>{section.title}</h2>
            <GalleryGrid
              items={assets.map((a) => ({
                public_id: a.public_id,
                alt: `${section.title} - ${a.public_id.split("/").pop() ?? "image"}`,
              }))}
            />
          </section>
        );
      })}
    </main>
  );
}
