import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BeforeAfterSlider from "@/components/home/BeforeAfterSlider";
import CloudinaryImage from "@/components/CloudinaryImage";
import HeroProject from "@/components/home/HeroProject";
import ProjectStories from "@/components/home/ProjectStories";
import ServiceCards from "@/components/home/ServiceCards";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import TrustSignals from "@/components/home/TrustSignals";
import ProjectRecordCard from "@/components/projects/ProjectRecordCard";
import ProjectSectionEmptyState from "@/components/projects/ProjectSectionEmptyState";
import ReviewSourcePlaceholder from "@/components/reviews/ReviewSourcePlaceholder";
import { getPriorityProjects } from "@/content/projects";
import { FEATURED_REVIEWS } from "@/content/reviews";
import { FEATURED_TESTIMONIALS } from "@/content/testimonials";
import { SITE } from "@/lib/constants";
import { getHeroAsset } from "@/lib/portfolio.server";
import {
  getHomepageFeaturedProjects,
  getHomepageSpotlightProjects,
  getProjectExcerpt,
  getPublicProjectEyebrow,
  getPublicProjectTitle,
  getProjectQuoteHref,
  getValidatedProjectPrimaryCta,
} from "@/lib/projectRecords.server";
import { BUSINESS_PROFILE } from "@/lib/reviews.config";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://sublimedesignnv.com";

export const metadata: Metadata = {
  title: "Sublime Design NV | Custom Woodwork Las Vegas",
  description:
    "Las Vegas custom finish carpentry focused on floating shelves, media walls, faux beams, barn doors, mantels, cabinets, and trim details. Free estimates.",
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    title: "Sublime Design NV | Custom Woodwork Las Vegas",
    description:
      "Shop-built custom woodwork installed throughout the Las Vegas Valley. Get a free quote today.",
    url: `${SITE_URL}/`,
  },
};

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
  const [storyProjects, spotlightProjects] = await Promise.all([
    Promise.resolve(getPriorityProjects(3).slice(0, 3)),
    getHomepageSpotlightProjects(3),
  ]);
  const leadSpotlightProject = spotlightProjects[0] ?? null;
  const supportingFeaturedProjects = await getHomepageFeaturedProjects(3, {
    excludeSlugs: leadSpotlightProject ? [leadSpotlightProject.slug] : [],
  });
  const homepageProjectsMode = leadSpotlightProject ? "db" : "empty";
  const leadProjectCta = leadSpotlightProject
    ? getValidatedProjectPrimaryCta(leadSpotlightProject)
    : null;
  const leadProjectQuoteHref = leadSpotlightProject
    ? getProjectQuoteHref(leadSpotlightProject, {
        sourceType: "homepage-spotlight",
        sourcePath: "/",
        ctaLabel: leadProjectCta?.label ?? "Start Your Project",
      })
    : "/quote";

  return (
    <main className="bg-white">
      <HeroProject heroAsset={heroAsset} />
      <TrustSignals />

      <section className="bg-cream py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <p className="font-ui text-sm uppercase tracking-widest text-red">What We Build</p>
          <h2 className="mt-3 text-4xl text-charcoal md:text-5xl">Finish Carpentry Done Right</h2>
          <p className="mt-4 max-w-3xl text-base text-gray-mid">
            Premium custom finish carpentry focused on floating shelves, media walls, faux beams,
            barn doors, mantels, cabinets, and trim upgrades across the Las Vegas Valley.
          </p>
          <ServiceCards />
          <p className="mt-6 max-w-3xl text-sm text-gray-mid">
            Explore focused service pages for{" "}
            <Link href="/services/floating-shelves" className="font-semibold text-red hover:underline">
              floating shelves
            </Link>
            ,{" "}
            <Link href="/services/media-walls" className="font-semibold text-red hover:underline">
              media walls
            </Link>
            , and{" "}
            <Link href="/services/faux-beams" className="font-semibold text-red hover:underline">
              faux beams
            </Link>
            {" "}completed across Las Vegas, Henderson, and Summerlin.
          </p>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-ui text-sm uppercase tracking-widest text-red">Flagship Work</p>
              <h2 className="mt-3 text-4xl text-charcoal md:text-5xl">Proof Pages That Show the Work</h2>
              <p className="mt-4 max-w-3xl text-base text-gray-mid">
                Start with the strongest case studies first. Each flagship project ties together service, location, scope, and real homeowner proof before you ask for a quote.
              </p>
            </div>
            <Link
              href="/projects"
              className="font-ui text-sm font-semibold text-navy transition-colors hover:text-red"
            >
              View All Projects
            </Link>
          </div>

          <div className="mt-10">
            {homepageProjectsMode === "db" && leadSpotlightProject ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr,0.95fr]">
                <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,0.8fr]">
                    <div className="relative min-h-[320px] bg-cream sm:min-h-[420px]">
                      {leadSpotlightProject.coverPublicId ? (
                        <CloudinaryImage
                          src={leadSpotlightProject.coverPublicId}
                          alt={getPublicProjectTitle(leadSpotlightProject)}
                          width={1400}
                          height={960}
                          sizes="(max-width: 1024px) 100vw, 60vw"
                          crop="fill"
                          gravity="auto:subject"
                          className="h-full w-full object-cover"
                        />
                      ) : leadSpotlightProject.coverImageUrl ? (
                        <Image
                          src={leadSpotlightProject.coverImageUrl}
                          alt={getPublicProjectTitle(leadSpotlightProject)}
                          fill
                          sizes="(max-width: 1024px) 100vw, 60vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-6 text-center">
                          <p className="font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">
                            Project photos coming soon
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-between border-t border-gray-200 p-6 lg:border-l lg:border-t-0">
                      <div>
                        <p className="font-ui text-xs uppercase tracking-[0.18em] text-red">
                          {getPublicProjectEyebrow(leadSpotlightProject) || "Homepage Spotlight"}
                        </p>
                        <h3 className="mt-3 text-3xl text-charcoal">
                          {getPublicProjectTitle(leadSpotlightProject)}
                        </h3>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {leadSpotlightProject.serviceLabel ? (
                            <span className="rounded-full bg-cream px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-charcoal">
                              {leadSpotlightProject.serviceLabel}
                            </span>
                          ) : null}
                          {leadSpotlightProject.areaLabel ? (
                            <span className="rounded-full border border-gray-200 px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-gray-mid">
                              {leadSpotlightProject.areaLabel}
                            </span>
                          ) : null}
                          {leadSpotlightProject.location ? (
                            <span className="rounded-full border border-gray-200 px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-gray-mid">
                              {leadSpotlightProject.location}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-5 text-sm leading-7 text-gray-mid">
                          {getProjectExcerpt(leadSpotlightProject, 220)}
                        </p>
                      </div>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                          href={`/projects/${leadSpotlightProject.slug}`}
                          className="font-ui inline-flex items-center rounded-sm bg-red px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                          View Project
                        </Link>
                        <Link
                          href={leadProjectCta?.href ?? leadProjectQuoteHref}
                          className="font-ui inline-flex items-center rounded-sm border border-gray-200 px-5 py-3 text-sm font-semibold text-charcoal transition hover:border-red hover:text-red"
                        >
                          {leadProjectCta?.label ?? "Start Your Project"}
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
                <div className="grid grid-cols-1 gap-6">
                  {supportingFeaturedProjects.map((project) => (
                    <ProjectRecordCard key={project.id} project={project} pageType="home" />
                  ))}
                </div>
              </div>
            ) : (
              <ProjectSectionEmptyState copy="Featured project photos are still being added. Start with a quote and we can share examples that fit the job." />
            )}
          </div>
          {homepageProjectsMode === "db" && leadSpotlightProject ? (
            <p className="mt-6 max-w-3xl text-sm text-gray-mid">
              Browse recent finished work, then jump into a quote when you are ready to talk through your own project.
            </p>
          ) : null}
        </div>
      </section>

      <ProjectStories projects={storyProjects} />
      <BeforeAfterSlider />

      <TestimonialsSection testimonials={FEATURED_TESTIMONIALS} />
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <ReviewSourcePlaceholder
            reviews={FEATURED_REVIEWS.slice(0, 3)}
            eyebrow="Client Reviews"
            title="Work That Earns Repeat Referrals"
            subheading="A few recent homeowner reviews tied to real floating shelves, media wall, cabinet, and mantel work around Las Vegas, Henderson, and Summerlin."
            ctaHref={BUSINESS_PROFILE.reviewProfileUrl || "/projects"}
            ctaLabel={BUSINESS_PROFILE.reviewProfileUrl ? BUSINESS_PROFILE.reviewCtaLabel : "Read more proof"}
            pageType="home"
            eventContext="reviews_read_more_cta"
          />
        </div>
      </section>

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
              Start with a Quote
            </Link>
            <a
              href={SITE.phoneHref}
              className="font-ui rounded-sm border border-white px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Call {SITE.phone}
            </a>
          </div>
          <div className="mt-6 rounded-xl border border-white/15 bg-white/5 p-5 text-left">
            <p className="font-ui text-xs uppercase tracking-[0.18em] text-white/70">
              What Happens Next
            </p>
            <p className="mt-2 text-sm text-white/85">
              Send photos, measurements, or a rough idea of the space. We review the job, reach out
              to confirm scope, and tell you what the next step looks like before anything moves forward.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {CTA_TRUST_ITEMS.map((item) => (
              <span key={item} className="font-ui text-xs text-white/70">
                {item}
              </span>
            ))}
          </div>
          <div className="mt-8 rounded-xl border border-white/15 bg-white/5 p-5 text-left">
            <p className="font-ui text-xs uppercase tracking-[0.18em] text-white/70">
              Service Area
            </p>
            <p className="mt-2 text-sm text-white/85">
              Serving the Las Vegas Valley including Las Vegas, Henderson, Summerlin, and surrounding communities.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
