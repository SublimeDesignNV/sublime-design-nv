import Link from "next/link";
import CloudinaryImage from "@/components/CloudinaryImage";
import HeroCarousel from "@/components/home/HeroCarousel";
import ServiceCards from "@/components/home/ServiceCards";
import { listProjectsIndex } from "@/lib/cloudinary.server";
import { SITE } from "@/lib/constants";
import { buildProjectImageAlt } from "@/lib/seo";

const PROCESS_STEPS = [
  {
    title: "Measure + Plan",
    description: "We confirm site conditions and details before we build.",
  },
  {
    title: "Build",
    description: "Shop-built components for cleaner fit and faster installs.",
  },
  {
    title: "Install + Finish",
    description: "Tight reveals, clean lines, and protected surfaces.",
  },
] as const;

const TRUST_ITEMS = [
  "Free Estimates",
  "14+ Years Experience",
  "Las Vegas Valley Service",
  "Clean, Professional Installs",
] as const;

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const allProjects = await listProjectsIndex(120).catch(() => []);
  const featuredProjects = allProjects.filter((project) => project.featured);

  const recentProjects = [...allProjects].sort((a, b) => {
    const aTime = a.updatedAt ? Date.parse(a.updatedAt) : 0;
    const bTime = b.updatedAt ? Date.parse(b.updatedAt) : 0;
    return bTime - aTime;
  });

  const projectCards = (featuredProjects.length ? featuredProjects : recentProjects).slice(0, 3);

  return (
    <main className="bg-white">
      <HeroCarousel />

      <section className="bg-navy py-5">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-2 px-4 sm:grid-cols-2 md:px-8 lg:grid-cols-4">
          {TRUST_ITEMS.map((item) => (
            <p key={item} className="font-ui text-center text-xs uppercase tracking-[0.18em] text-white/85">
              {item}
            </p>
          ))}
        </div>
      </section>

      <section className="bg-cream py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <p className="font-ui text-sm uppercase tracking-widest text-red">Finish Carpentry Services</p>
          <h2 className="mt-3 text-4xl text-charcoal md:text-5xl">Built for Your Home. Installed Right.</h2>
          <p className="mt-4 max-w-3xl text-base text-gray-mid">
            We build and install custom finish carpentry across Las Vegas, Henderson, Summerlin,
            and the surrounding valley.
          </p>

          <ServiceCards />
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-ui text-sm uppercase tracking-widest text-red">Portfolio</p>
              <h2 className="mt-3 text-4xl text-charcoal md:text-5xl">Featured Work</h2>
            </div>
            <Link
              href="/projects"
              className="font-ui text-sm font-semibold text-navy transition-colors hover:text-red"
            >
              See All Projects →
            </Link>
          </div>

          {projectCards.length === 0 ? (
            <div className="mt-8 rounded-xl border border-gray-200 bg-cream p-8">
              <p className="text-gray-mid">Projects are being added now. Check the gallery for the latest work.</p>
              <Link
                href="/gallery"
                className="font-ui mt-4 inline-block rounded-sm bg-red px-5 py-2 text-sm font-semibold text-white"
              >
                View Gallery
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              {projectCards.map((project) => (
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
                        width={1400}
                        height={900}
                        sizes="(max-width: 768px) 100vw, 33vw"
                        style={{ width: "100%", height: "240px", objectFit: "cover" }}
                      />
                    </Link>
                  ) : null}

                  <div className="p-5">
                    <h3 className="text-2xl text-charcoal">
                      <Link href={`/projects/${project.slug}`} className="hover:text-red">
                        {project.name}
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm text-gray-mid">
                      {[project.serviceLabel, project.cityLabel, project.state, project.year]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-navy py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <p className="font-ui text-sm uppercase tracking-widest text-red">How It Works</p>
          <h2 className="mt-3 text-4xl md:text-5xl">Simple Process. Clean Results.</h2>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {PROCESS_STEPS.map((step, index) => (
              <article key={step.title} className="rounded-xl border border-white/15 bg-white/5 p-6">
                <p className="font-ui text-sm uppercase tracking-[0.2em] text-red/90">Step {index + 1}</p>
                <h3 className="mt-3 text-2xl">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/80">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-red py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center md:px-8">
          <h2 className="text-4xl md:text-5xl">Ready to transform your space?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/90">
            Get a detailed quote for your project in Las Vegas Valley. Clear scope, real timeline,
            and no guesswork.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/get-a-quote"
              className="font-ui rounded-sm bg-white px-6 py-3 text-sm font-semibold text-red transition-colors hover:opacity-90"
            >
              Get a Free Quote
            </Link>
            <a
              href={SITE.phoneHref}
              className="font-ui rounded-sm border border-white px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Call {SITE.phone}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
