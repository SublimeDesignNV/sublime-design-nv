import Link from "next/link";
import type { ProjectDef } from "@/content/projects";
import { findService } from "@/content/services";

type ProjectStoriesProps = {
  projects: ProjectDef[];
};

export default function ProjectStories({ projects }: ProjectStoriesProps) {
  if (!projects.length) {
    return null;
  }

  return (
    <section className="bg-cream py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="font-ui text-sm uppercase tracking-widest text-red">Project Stories</p>
        <h2 className="mt-3 text-4xl text-charcoal md:text-5xl">
          Built for Real Homes in Las Vegas Valley
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {projects.slice(0, 3).map((project) => {
            const serviceDef = findService(project.serviceSlug);
            return (
              <article
                key={project.slug}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="p-5">
                  <p className="font-ui text-xs uppercase tracking-widest text-red">
                    {serviceDef?.shortTitle ?? project.serviceSlug.replace(/-/g, " ")}
                  </p>
                  <h3 className="mt-2 text-2xl text-charcoal">{project.title}</h3>

                  <ul className="mt-4 space-y-2 text-sm text-gray-mid">
                    <li>
                      <span className="font-ui font-semibold text-charcoal">Scope:</span>{" "}
                      {serviceDef?.shortTitle ?? project.serviceSlug.replace(/-/g, " ")}
                    </li>
                    <li>
                      <span className="font-ui font-semibold text-charcoal">Timeline:</span>{" "}
                      {project.timeline}
                    </li>
                    <li>
                      <span className="font-ui font-semibold text-charcoal">Location:</span>{" "}
                      {project.location.cityLabel}, {project.location.state}
                    </li>
                  </ul>

                  {project.testimonial ? (
                    <p className="mt-4 border-l-2 border-red pl-3 text-sm italic text-gray-mid">
                      &ldquo;{project.testimonial.quote.slice(0, 100)}&hellip;&rdquo;
                    </p>
                  ) : null}

                  <Link
                    href={`/projects/${project.slug}`}
                    className="font-ui mt-5 inline-block text-sm font-semibold text-red"
                  >
                    View Project →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
