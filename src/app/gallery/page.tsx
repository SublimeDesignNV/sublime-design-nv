import GalleryClient from "@/components/gallery/GalleryClient";
import { getPublishedAssets } from "@/lib/portfolio.server";

export default async function GalleryPage() {
  const assets = await getPublishedAssets();

  return (
    <main className="bg-cream pt-20">
      <section className="bg-navy py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <p className="font-ui text-sm uppercase tracking-widest text-red">
            Portfolio
          </p>
          <h1 className="mt-3 text-4xl md:text-5xl">Our Work</h1>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <GalleryClient assets={assets} />
        </div>
      </section>
    </main>
  );
}
