import type { Metadata } from "next";
import Link from "next/link";
import HeroWrapper from "@/components/home/HeroWrapper";
import MasonryGrid from "@/components/home/MasonryGrid";
import ServiceCards from "@/components/home/ServiceCards";
import TrustSignals from "@/components/home/TrustSignals";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";
import { SITE } from "@/lib/constants";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sublimedesignnv.com";

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

export default async function HomePage() {
  return (
    <main className="bg-white">
      <LocalBusinessSchema />
      <HeroWrapper />
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

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="mb-8">
            <p className="font-ui text-sm font-semibold uppercase tracking-widest text-red">
              Our Work
            </p>
            <h2 className="mt-2 text-3xl text-charcoal md:text-4xl">
              Built in Las Vegas Valley
            </h2>
          </div>
          <MasonryGrid />
          <div className="mt-8 text-center">
            <Link
              href="/projects"
              className="font-ui inline-block rounded-lg bg-navy px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-navy/90"
            >
              View All Projects
            </Link>
          </div>
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
