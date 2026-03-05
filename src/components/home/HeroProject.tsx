import Image from "next/image";
import Link from "next/link";
import type { HeroAsset } from "@/lib/portfolio.server";

type HeroProjectProps = {
  heroAsset: HeroAsset | null;
};

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1750268746263-52cdef61e177?auto=format&fit=crop&w=2200&q=80";

export default function HeroProject({ heroAsset }: HeroProjectProps) {
  const imageSrc = heroAsset?.secureUrl || FALLBACK_HERO;
  const imageAlt = heroAsset?.alt || "Custom built-ins and floating shelves in Las Vegas";

  return (
    <section className="relative isolate min-h-[72svh] overflow-hidden bg-charcoal pt-20 sm:min-h-[78svh]">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/35" />

      <div className="relative mx-auto flex min-h-[72svh] max-w-7xl items-center px-4 py-16 sm:min-h-[78svh] md:px-8">
        <div className="max-w-3xl text-white">
          <p className="font-ui text-xs uppercase tracking-[0.24em] text-red sm:text-sm">
            Finish Carpentry • Las Vegas Valley
          </p>
          <h1 className="mt-4 text-4xl leading-tight sm:text-5xl lg:text-6xl">
            Custom Built-Ins &amp; Floating Shelves
          </h1>
          <p className="mt-5 max-w-2xl text-sm text-white/85 sm:text-base md:text-lg">
            Designed, built, and installed in Las Vegas.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/quote"
              className="font-ui rounded-sm bg-red px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-red-dark"
            >
              Get a Free Quote
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
