import Link from "next/link";
import CloudinaryImage from "@/components/CloudinaryImage";
import type { ProjectIndexItem } from "@/lib/cloudinary.server";
import { buildProjectImageAlt } from "@/lib/seo";

type ProjectStoriesProps = {
  projects: ProjectIndexItem[];
};

function estimateTimeline(year: string | undefined) {
  if (!year) return "2-4 weeks";
  return `Completed ${year}`;
}

export default function ProjectStories({ projects }: ProjectStoriesProps) {
  if (!projects.length) {
    return null;
  }

  return (
    <section className="bg-cream py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="font-ui text-sm uppercase tracking-widest text-red">Project Stories</p>
        <h2 className="mt-3 text-4xl text-charcoal md:text-5xl">Built for Real Homes in Las Vegas Valley</h2>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {projects.slice(0, 3).map((project) => (
            <article key={project.slug} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {project.heroPublicId ? (
                <Link href={`/projects/${project.slug}`} className="block">
                  <CloudinaryImage
                    src={project.heroPublicId}
                    alt={
                      project.heroAlt ||
                      buildProjectImageAlt({
                        service: project.serviceSlug,
                        city: project.cityLabel,
                        state: project.state,
                        room: project.roomLabel,
                        material: project.materialLabel,
                      })
                    }
                    width={1400}
                    height={900}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ width: "100%", height: "220px", objectFit: "cover" }}
                  />
                </Link>
              ) : null}

              <div className="p-5">
                <h3 className="text-2xl text-charcoal">{project.name}</h3>
                <ul className="mt-4 space-y-2 text-sm text-gray-mid">
                  <li>
                    <span className="font-ui font-semibold text-charcoal">Scope:</span>{" "}
                    {project.serviceLabel || "Custom finish carpentry"}
                  </li>
                  <li>
                    <span className="font-ui font-semibold text-charcoal">Timeline:</span>{" "}
                    {estimateTimeline(project.year)}
                  </li>
                  <li>
                    <span className="font-ui font-semibold text-charcoal">Materials:</span>{" "}
                    {project.materialLabel || "Paint-grade and hardwood options"}
                  </li>
                </ul>
                <Link
                  href={`/projects/${project.slug}`}
                  className="font-ui mt-5 inline-block text-sm font-semibold text-red"
                >
                  View Project →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
