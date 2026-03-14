import type { Metadata } from "next";
import Link from "next/link";
import { PROJECT_LIST, FEATURED_PROJECTS } from "@/content/projects";
import { findService } from "@/content/services";
import { buildFacetCanonical } from "@/lib/seo";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Custom Carpentry Projects | Sublime Design NV",
  description:
    "Browse custom finish carpentry projects — built-ins, floating shelves, closet systems, pantry pullouts, cabinetry, and mantels completed throughout Las Vegas, Henderson, and Summerlin.",
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

  const filtered = PROJECT_LIST.filter((project) => {
    if (serviceFilter && project.serviceSlug !== serviceFilter) return false;
    if (locationFilter && project.location.city !== locationFilter) return false;
    return true;
  });

  // Collect unique values for filter chips
  const allServices = Array.from(new Set(PROJECT_LIST.map((p) => p.serviceSlug))).sort();
  const allLocations = Array.from(
    new Set(PROJECT_LIST.map((p) => p.location.city)),
  ).sort();

  function serviceLabel(slug: string) {
    return findService(slug)?.shortTitle ?? slug.replace(/-/g, " ");
  }

  function locationLabel(city: string) {
    return PROJECT_LIST.find((p) => p.location.city === city)?.location.cityLabel ?? city;
  }

  const hasFilters = Boolean(serviceFilter || locationFilter);

  return (
    <main className="bg-white pb-24 pt-24">
      <LocalBusinessSchema />

      {/* Header */}
      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="font-ui text-sm uppercase tracking-widest text-red">Portfolio</p>
        <h1 className="mt-3 text-4xl text-charcoal md:text-5xl">Projects</h1>
        <p className="mt-4 max-w-3xl text-base text-gray-mid">
          Every project is measured, shop-built, and installed to fit the exact space. Browse
          recent work from around the Las Vegas Valley.
        </p>
      </section>

      {/* Filter bar */}
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
            <Link
              href="/projects"
              className="rounded-full border border-gray-200 px-4 py-1.5 font-ui text-xs font-medium text-gray-mid hover:text-charcoal"
            >
              Clear ×
            </Link>
          ) : null}
        </div>
      </section>

      {/* Featured banner (only when no filters active) */}
      {!hasFilters && FEATURED_PROJECTS.length > 0 ? (
        <section className="mx-auto mt-12 max-w-7xl px-4 md:px-8">
          <p className="font-ui text-xs uppercase tracking-widest text-red">Featured</p>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_PROJECTS.map((project) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="bg-cream px-5 pt-5 pb-1">
                  <span className="font-ui text-[10px] uppercase tracking-widest text-red">Featured</span>
                </div>
                <div className="p-5 pt-2">
                  <p className="font-ui text-xs uppercase tracking-widest text-gray-mid">
                    {serviceLabel(project.serviceSlug)} &middot; {project.location.cityLabel}, {project.location.state}
                  </p>
                  <h2 className="mt-2 text-xl text-charcoal group-hover:text-red">{project.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-mid">{project.summary}</p>
                  <span className="font-ui mt-4 inline-block text-sm font-semibold text-red">
                    View Project →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* All projects grid */}
      <section className="mx-auto mt-12 max-w-7xl px-4 md:px-8">
        {!hasFilters ? (
          <p className="font-ui text-xs uppercase tracking-widest text-gray-mid">All Projects</p>
        ) : null}

        {filtered.length === 0 ? (
          <div className="mt-6 rounded-xl border border-gray-200 bg-cream p-8">
            <p className="text-gray-mid">No projects match the selected filters.</p>
            <Link
              href="/projects"
              className="font-ui mt-4 inline-block text-sm font-semibold text-red"
            >
              View all projects →
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <article
                key={project.slug}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="p-5">
                  <p className="font-ui text-xs uppercase tracking-widest text-gray-mid">
                    {serviceLabel(project.serviceSlug)} &middot; {project.location.cityLabel}, {project.location.state} &middot; {project.year}
                  </p>
                  <h2 className="mt-2 text-xl text-charcoal">
                    <Link href={`/projects/${project.slug}`} className="hover:text-red">
                      {project.title}
                    </Link>
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-gray-mid">{project.summary}</p>
                  {project.testimonial ? (
                    <p className="mt-4 border-l-2 border-red pl-3 text-sm italic text-gray-mid">
                      &ldquo;{project.testimonial.quote.slice(0, 80)}&hellip;&rdquo;
                    </p>
                  ) : null}
                  <Link
                    href={`/projects/${project.slug}`}
                    className="font-ui mt-4 inline-block text-sm font-semibold text-red"
                  >
                    View Project →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="mx-auto mt-20 max-w-7xl px-4 md:px-8">
        <div className="rounded-xl bg-red px-6 py-10 text-white md:px-10">
          <h2 className="text-3xl md:text-4xl">Start your project.</h2>
          <p className="mt-3 max-w-2xl text-white/90">
            Tell us what you have in mind and we will respond with scope, timeline, and pricing —
            no pressure, no commitment required.
          </p>
          <Link
            href="/quote"
            className="font-ui mt-6 inline-block rounded-sm bg-white px-6 py-3 text-sm font-semibold text-red"
          >
            Get a Free Quote
          </Link>
        </div>
      </section>
    </main>
  );
}
