import Link from "next/link";
import { buildQuoteHref } from "@/lib/publicLeadCtas";
import { getBusinessSettings } from "@/lib/settings";
import HeroVideo from "@/components/home/HeroVideo";

export default async function HeroProject() {
  const biz = await getBusinessSettings();

  const headline = biz.heroHeadline ?? "Premium Finish Carpentry for the Signature Spaces";
  const subheadline = biz.heroSubheadline ?? "Floating shelves, media walls, faux beams, barn doors, mantels, cabinets, and trim upgrades designed, built, and installed in Las Vegas Valley.";
  const ctaLabel = biz.heroCtaLabel ?? "Start with a Quote";

  const quoteHref = buildQuoteHref({
    sourceType: "homepage-hero",
    sourcePath: "/",
    ctaLabel,
  });

  return (
    <section className="relative isolate min-h-[72svh] overflow-hidden bg-charcoal pt-20 sm:min-h-[78svh]">
      <HeroVideo
        src="https://res.cloudinary.com/dueaqxh8s/video/upload/q_auto,vc_h264/Sublime/Portfolio/D57CF9BD-00BC-4DDD-B5FD-E89FE30C4ABF_nhonyp.mp4"
        poster="https://res.cloudinary.com/dueaqxh8s/image/upload/c_fill,w_1280,h_720,g_auto,f_auto,q_auto/v1/Sublime/Portfolio/D57CF9BD-00BC-4DDD-B5FD-E89FE30C4ABF_nhonyp"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/35" />

      <div className="relative mx-auto flex min-h-[72svh] max-w-7xl items-center px-4 py-16 sm:min-h-[78svh] md:px-8">
        <div className="max-w-3xl text-white">
          <p className="font-ui text-xs uppercase tracking-[0.24em] text-red sm:text-sm">
            {biz.primaryTrade ?? "Finish Carpentry"} • Las Vegas Valley
          </p>
          <h1 className="mt-4 text-4xl leading-tight sm:text-5xl lg:text-6xl">
            {headline}
          </h1>
          <p className="mt-5 max-w-2xl text-sm text-white/85 sm:text-base md:text-lg">
            {subheadline}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={quoteHref}
              className="font-ui rounded-sm bg-red px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-red-dark"
            >
              {ctaLabel}
            </Link>
            <Link
              href="/projects"
              className="font-ui rounded-sm border border-white/70 px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              See Projects
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
