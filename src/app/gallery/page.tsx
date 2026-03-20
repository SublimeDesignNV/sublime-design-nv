import Link from "next/link";
import ProjectRecordCard from "@/components/projects/ProjectRecordCard";
import { listPublicProjects } from "@/lib/projectRecords.server";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const projects = await listPublicProjects();

  return (
    <main className="bg-white px-4 pb-20 pt-24 md:px-8">
      <section className="mx-auto max-w-7xl">
        <p className="font-ui text-sm uppercase tracking-widest text-red">Gallery</p>
        <h1 className="mt-3 text-4xl text-charcoal md:text-5xl">Project Gallery</h1>
        <p className="mt-4 max-w-3xl text-base text-gray-mid">
          Explicit project albums with deterministic cover images and ordered linked assets.
        </p>

        {projects.length === 0 ? (
          <div className="mt-10 rounded-xl border border-gray-200 bg-cream p-8">
            <p className="text-gray-mid">No public projects found yet.</p>
            <Link href="/quote" className="font-ui mt-4 inline-block text-sm font-semibold text-red">
              Start with a Quote →
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectRecordCard key={project.id} project={project} pageType="gallery" />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
