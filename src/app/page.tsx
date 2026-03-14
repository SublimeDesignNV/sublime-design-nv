import Link from "next/link";
import BeforeAfterSlider from "@/components/home/BeforeAfterSlider";
import HeroProject from "@/components/home/HeroProject";
import ProjectStories from "@/components/home/ProjectStories";
import ServiceCards from "@/components/home/ServiceCards";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import TrustSignals from "@/components/home/TrustSignals";
import { FEATURED_PROJECTS, PROJECT_LIST } from "@/content/projects";
import { FEATURED_TESTIMONIALS } from "@/content/testimonials";
import { findService } from "@/content/services";
import { SITE } from "@/lib/constants";
import { getHeroAsset } from "@/lib/portfolio.server";

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

const CTA_TRUST_ITEMS = ["Free quote", "Local install", "Built to fit", "Clear next steps"] as const;

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const heroAsset = await getHeroAsset();

  const projectCards = (FEATURED_PROJECTS.length ? FEATURED_PROJECTS : PROJECT_LIST).slice(0, 3);
  const storyProjects = (FEATURED_PROJECTS.length ? FEATURED_PROJECTS : PROJECT_LIST).slice(0, 3);

  return (
    <main className="bg-white">
      <HeroProject heroAsset={heroAsset} />
      <TrustSignals />

      <section className="bg-cream py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <p className="font-ui text-sm uppercase tracking-widest text-red">What We Build</p>
          <h2 className="mt-3 text-4xl text-charcoal md:text-5xl">Finish Carpentry Done Right</h2>
          <p className="mt-4 max-w-3xl text-base text-gray-mid">
            Custom built-ins, floating shelves, closet systems, pantry pullouts, cabinetry, and
            mantels — measured, shop-built, and installed throughout Las Vegas and the Henderson valley.
          </p>
          <ServiceCards />
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-ui text-sm uppercase tracking-widest text-red">Recent Work</p>
              <h2 className="mt-3 text-4xl text-charcoal md:text-5xl">Projects</h2>
            </div>
            <Link
              href="/projects"
              className="font-ui text-sm font-semibold text-navy transition-colors hover:text-red"
            >
              View All Projects →
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {projectCards.map((project) => {
              const serviceDef = findService(project.serviceSlug);
              return (
                <article
                  key={project.slug}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="p-5">
                    <p className="font-ui text-xs uppercase tracking-widest text-gray-mid">
                      {serviceDef?.shortTitle ?? project.serviceSlug.replace(/-/g, " ")} &middot;{" "}
                      {project.location.cityLabel}, {project.location.state}
                    </p>
                    <h3 className="mt-2 text-2xl text-charcoal">
                      <Link href={`/projects/${project.slug}`} className="hover:text-red">
                        {project.title}
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-gray-mid">{project.summary}</p>
                    <Link
                      href={`/projects/${project.slug}`}
                      className="font-ui mt-4 inline-block text-sm font-semibold text-red"
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

      <ProjectStories projects={storyProjects} />
      <BeforeAfterSlider />

      <TestimonialsSection testimonials={FEATURED_TESTIMONIALS} />

      <section className="bg-navy py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <p className="font-ui text-sm uppercase tracking-widest text-red">Our Process</p>
          <h2 className="mt-3 text-4xl md:text-5xl">Measured. Built. Installed.</h2>
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
          <h2 className="text-4xl md:text-5xl">Start with a quote.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/90">
            Tell us what you have in mind and we will respond with scope, timeline, and pricing —
            no pressure, no commitment required.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/quote"
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
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {CTA_TRUST_ITEMS.map((item) => (
              <span key={item} className="font-ui text-xs text-white/70">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
