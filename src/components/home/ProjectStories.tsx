import type { ProjectDef } from "@/content/projects";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectSectionEmptyState from "@/components/projects/ProjectSectionEmptyState";

type ProjectStoriesProps = {
  projects: ProjectDef[];
};

export default async function ProjectStories({ projects }: ProjectStoriesProps) {
  if (!projects.length) {
    return (
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <p className="font-ui text-sm uppercase tracking-widest text-red">Project Stories</p>
          <h2 className="mt-3 text-4xl text-charcoal md:text-5xl">
            Built for Real Homes in Las Vegas Valley
          </h2>
          <div className="mt-10">
            <ProjectSectionEmptyState copy="More project photos coming soon. We can share examples when we quote the job." />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-cream py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="font-ui text-sm uppercase tracking-widest text-red">Project Stories</p>
        <h2 className="mt-3 text-4xl text-charcoal md:text-5xl">
          Built for Real Homes in Las Vegas Valley
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {projects.slice(0, 3).map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
