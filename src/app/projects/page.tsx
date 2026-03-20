import type { Metadata } from "next";
import Link from "next/link";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectRecordCard from "@/components/projects/ProjectRecordCard";
import ProjectSectionEmptyState from "@/components/projects/ProjectSectionEmptyState";
import {
  FLAGSHIP_PROJECTS,
  PROJECT_LIST,
  getPriorityProjects,
  sortProjectsForDisplay,
} from "@/content/projects";
import { findArea } from "@/content/areas";
import { findService } from "@/content/services";
import { listPublicProjects } from "@/lib/projectRecords.server";
import { buildFacetCanonical } from "@/lib/seo";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Custom Carpentry Projects | Sublime Design NV",
  description:
    "Browse custom carpentry projects including floating shelves, media walls, cabinets, mantels, faux beams, barn doors, and trim details across Las Vegas Valley.",
  alternates: {
    canonical: buildFacetCanonical("/projects"),
  },
};

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

function readParam(params: SearchParams, key: string) {
  const value = params[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function ProjectsIndexPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const serviceFilter = readParam(searchParams, "service");
  const locationFilter = readParam(searchParams, "location");
  const hasFilters = Boolean(serviceFilter || locationFilter);

  const linkedProjects = await listPublicProjects({
    serviceSlug: serviceFilter || undefined,
    areaSlug: locationFilter || undefined,
  });

  const filteredStatic = PROJECT_LIST.filter((project) => {
    if (serviceFilter && project.serviceSlug !== serviceFilter) return false;
    if (locationFilter && project.location.city !== locationFilter) return false;
    return true;
  });
  const sortedStatic = sortProjectsForDisplay(filteredStatic);

  const priorityProjects = linkedProjects.length
    ? linkedProjects.slice(0, 3)
    : getPriorityProjects(3).slice(0, 3);
  const priorityProjectSlugs = new Set(priorityProjects.map((project) => project.slug));
  const gridProjects = linkedProjects.length
    ? hasFilters
      ? linkedProjects
      : linkedProjects.filter((project) => !priorityProjectSlugs.has(project.slug))
    : hasFilters
      ? sortedStatic
      : sortedStatic.filter((project) => !priorityProjectSlugs.has(project.slug));

  const allServices = Array.from(new Set(PROJECT_LIST.map((p) => p.serviceSlug))).sort();
  const allLocations = Array.from(new Set(PROJECT_LIST.map((p) => p.location.city))).sort();

  function serviceLabel(slug: string) {
    return findService(slug)?.shortTitle ?? slug.replace(/-/g, " ");
  }

  function locationLabel(city: string) {
    return findArea(city)?.name ?? PROJECT_LIST.find((p) => p.location.city === city)?.location.cityLabel ?? city;
  }

  const priorityHeading = FLAGSHIP_PROJECTS.length > 0 ? "Flagship Projects" : "Featured";

  return (
    <main className="bg-white pb-24 pt-24">
      <LocalBusinessSchema />

      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="font-ui text-sm uppercase tracking-widest text-red">Portfolio</p>
        <h1 className="mt-3 text-4xl text-charcoal md:text-5xl">Projects</h1>
        <p className="mt-4 max-w-3xl text-base text-gray-mid">
          Public gallery visibility now runs through explicit project records with deterministic cover images, ordered linked assets, and project-level publish rules.
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-mid">
          Browse recent work from around the Las Vegas Valley, then drill into project pages that keep album order, cover selection, and featured placement explicit.
        </p>
      </section>

      <section className="mx-auto mt-10 max-w-7xl px-4 md:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-ui text-xs uppercase tracking-widest text-gray-mid">Filter:</span>
          {allServices.map((slug) => (
            <Link
              key={slug}
              href={
                serviceFilter === slug
                  ? locationFilter
                    ? `/projects?location=${locationFilter}`
                    : "/projects"
                  : `/projects?service=${slug}${locationFilter ? `&location=${locationFilter}` : ""}`
              }
              className={`rounded-full border px-4 py-1.5 font-ui text-xs font-medium transition ${
                serviceFilter === slug
                  ? "border-red bg-red text-white"
                  : "border-gray-200 bg-white text-charcoal hover:border-red hover:text-red"
              }`}
            >
              {serviceLabel(slug)}
            </Link>
          ))}

          <span className="mx-1 text-gray-200">|</span>

          {allLocations.map((city) => (
            <Link
              key={city}
              href={
                locationFilter === city
                  ? serviceFilter
                    ? `/projects?service=${serviceFilter}`
                    : "/projects"
                  : `/projects?location=${city}${serviceFilter ? `&service=${serviceFilter}` : ""}`
              }
              className={`rounded-full border px-4 py-1.5 font-ui text-xs font-medium transition ${
                locationFilter === city
                  ? "border-navy bg-navy text-white"
                  : "border-gray-200 bg-white text-charcoal hover:border-navy hover:text-navy"
              }`}
            >
              {locationLabel(city)}
            </Link>
          ))}

          {hasFilters ? (
            <Link href="/projects" className="rounded-full border border-gray-200 px-4 py-1.5 font-ui text-xs font-medium text-gray-mid hover:text-charcoal">
              Clear ×
            </Link>
          ) : null}
        </div>
      </section>

      {!hasFilters ? (
        <section className="mx-auto mt-12 max-w-7xl px-4 md:px-8">
          <p className="font-ui text-xs uppercase tracking-widest text-red">{priorityHeading}</p>
          <div className="mt-4">
            {priorityProjects.length ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {priorityProjects.map((project) =>
                  "assets" in project ? (
                    <ProjectRecordCard key={project.slug} project={project} pageType="projects" />
                  ) : (
                    <ProjectCard
                      key={project.slug}
                      project={project}
                      priorityLabel={project.flagship ? "Flagship" : "Featured"}
                      pageType="projects"
                    />
                  ),
                )}
              </div>
            ) : (
              <ProjectSectionEmptyState copy="Featured project photos are still being added. Start with a quote and we can share examples directly." />
            )}
          </div>
        </section>
      ) : null}

      <section className="mx-auto mt-12 max-w-7xl px-4 md:px-8">
        {!hasFilters ? (
          <p className="font-ui text-xs uppercase tracking-widest text-gray-mid">All Projects</p>
        ) : null}

        {gridProjects.length === 0 ? (
          <div className="mt-6 rounded-xl border border-gray-200 bg-cream p-8">
            <p className="text-gray-mid">No projects match the selected filters.</p>
            <Link href="/projects" className="font-ui mt-4 inline-block text-sm font-semibold text-red">
              View all projects →
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gridProjects.map((project) =>
              "assets" in project ? (
                <ProjectRecordCard key={project.slug} project={project} pageType="projects" />
              ) : (
                <ProjectCard key={project.slug} project={project} pageType="projects" />
              ),
            )}
          </div>
        )}
      </section>

      <section className="mx-auto mt-20 max-w-7xl px-4 md:px-8">
        <div className="rounded-xl bg-red px-6 py-10 text-white md:px-10">
          <h2 className="text-3xl md:text-4xl">Start your project.</h2>
          <p className="mt-3 max-w-2xl text-white/90">
            Tell us what you have in mind and we will respond with scope, timeline, and pricing —
            no pressure, no commitment required.
          </p>
          <Link href="/quote" className="font-ui mt-6 inline-block rounded-sm bg-white px-6 py-3 text-sm font-semibold text-red">
            Start with a Quote
          </Link>
        </div>
      </section>
    </main>
  );
}
