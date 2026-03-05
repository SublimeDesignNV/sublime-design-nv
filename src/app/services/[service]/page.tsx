import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CloudinaryImage from "@/components/CloudinaryImage";
import { listProjectsIndex } from "@/lib/cloudinary.server";
import { buildFacetCanonical, buildProjectImageAlt } from "@/lib/seo";

type ServiceConfig = {
  slug: string;
  title: string;
  description: string;
  matchSlugs: string[];
};

const SERVICE_CONFIG: ServiceConfig[] = [
  {
    slug: "floating-shelves",
    title: "Floating Shelves",
    description:
      "Custom floating shelves measured, fabricated, and installed with hidden support and clean reveals.",
    matchSlugs: ["floating-shelves"],
  },
  {
    slug: "built-ins",
    title: "Built-ins",
    description:
      "Wall-to-wall built-ins for living rooms, offices, and media walls with finish-ready details.",
    matchSlugs: ["built-ins"],
  },
  {
    slug: "pantry-pullouts",
    title: "Pantry Pullouts",
    description:
      "Custom pantry pullout systems designed to maximize usable storage and access.",
    matchSlugs: ["pantry-pullouts", "pantry"],
  },
  {
    slug: "pantry",
    title: "Pantry Pullouts",
    description:
      "Custom pantry pullout systems designed to maximize usable storage and access.",
    matchSlugs: ["pantry", "pantry-pullouts"],
  },
  {
    slug: "closet-systems",
    title: "Closet Systems",
    description:
      "Closet systems built for practical storage, clean alignment, and efficient use of wall space.",
    matchSlugs: ["closet-systems", "closets"],
  },
  {
    slug: "closets",
    title: "Closet Systems",
    description:
      "Closet systems built for practical storage, clean alignment, and efficient use of wall space.",
    matchSlugs: ["closets", "closet-systems"],
  },
  {
    slug: "mantels",
    title: "Mantels",
    description:
      "Custom mantel builds and fireplace surrounds tailored to your wall and finish details.",
    matchSlugs: ["mantels"],
  },
  {
    slug: "custom-cabinetry",
    title: "Custom Cabinetry",
    description:
      "Cabinet builds and installs with clean alignment, filler details, and durable finish options.",
    matchSlugs: ["custom-cabinetry", "cabinets"],
  },
];

type Props = {
  params: {
    service: string;
  };
};

function getServiceConfig(serviceSlug: string) {
  return SERVICE_CONFIG.find((item) => item.slug === serviceSlug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const config = getServiceConfig(params.service);
  if (!config) {
    return {
      title: "Service Not Found | Sublime Design NV",
      description: "Service page not found.",
    };
  }

  return {
    title: `${config.title} | Sublime Design NV`,
    description: config.description,
    alternates: {
      canonical: buildFacetCanonical(`/services/${config.slug}`),
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const config = getServiceConfig(params.service);
  if (!config) {
    notFound();
  }

  const projects = (await listProjectsIndex(500)).filter(
    (project) => project.serviceSlug && config.matchSlugs.includes(project.serviceSlug),
  );

  return (
    <main className="bg-white pt-24 pb-20">
      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="font-ui text-sm uppercase tracking-[0.18em] text-red">Service</p>
        <h1 className="mt-3 text-4xl text-charcoal md:text-5xl">{config.title}</h1>
        <p className="mt-4 max-w-3xl text-base text-gray-mid">{config.description}</p>
      </section>

      <section className="mx-auto mt-10 max-w-7xl px-4 md:px-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl text-charcoal">Project Gallery</h2>
          <Link href="/gallery" className="font-ui text-sm font-semibold text-red">
            View Full Gallery →
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="mt-6 rounded-xl border border-gray-200 bg-cream p-8">
            <p className="text-gray-mid">We are adding more {config.title.toLowerCase()} projects now.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <article
                key={project.slug}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
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
                      width={1200}
                      height={800}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ width: "100%", height: "220px", objectFit: "cover" }}
                    />
                  </Link>
                ) : null}

                <div className="p-4">
                  <h3 className="text-xl text-charcoal">
                    <Link href={`/projects/${project.slug}`} className="hover:text-red">
                      {project.name}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm text-gray-mid">
                    {[project.cityLabel, project.state, project.materialLabel].filter(Boolean).join(" • ")}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto mt-14 max-w-7xl px-4 md:px-8">
        <div className="rounded-xl bg-red px-6 py-10 text-white md:px-10">
          <h2 className="text-3xl md:text-4xl">Need pricing for your {config.title.toLowerCase()} project?</h2>
          <p className="mt-3 max-w-2xl text-white/90">
            Send your details and we will reply with next steps, timeline, and quote options.
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
