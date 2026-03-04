"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type HeroSlide = {
  id: string;
  title: string;
  src: string;
  alt: string;
};

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "built-ins",
    title: "Built-ins",
    src: "https://images.unsplash.com/photo-1750268746263-52cdef61e177?auto=format&fit=crop&w=2200&q=80",
    alt: "Custom finish carpentry built-ins and shelving in a modern Las Vegas home",
  },
  {
    id: "cabinetry",
    title: "Modern Cabinetry",
    src: "https://images.unsplash.com/photo-1771371282665-545256b20dca?auto=format&fit=crop&w=2200&q=80",
    alt: "Custom kitchen cabinetry with clean lines and premium wood finishes",
  },
  {
    id: "floating-shelves",
    title: "Floating Shelves",
    src: "https://images.unsplash.com/photo-1556910602-38f53e68e15d?auto=format&fit=crop&w=2200&q=80",
    alt: "Floating shelf installation with precise trim details and strong hidden support",
  },
];

export default function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % HERO_SLIDES.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, []);

  const activeSlide = useMemo(() => HERO_SLIDES[activeIndex], [activeIndex]);

  const goPrev = () => {
    setActiveIndex((current) => (current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const goNext = () => {
    setActiveIndex((current) => (current + 1) % HERO_SLIDES.length);
  };

  return (
    <section className="relative isolate min-h-[78svh] overflow-hidden bg-charcoal pt-20 sm:min-h-[82svh]">
      <Image
        key={activeSlide.id}
        src={activeSlide.src}
        alt={activeSlide.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/30" />

      <div className="relative mx-auto flex min-h-[78svh] max-w-7xl items-center px-4 py-16 sm:min-h-[82svh] md:px-8">
        <div className="max-w-3xl text-white">
          <p className="font-ui text-xs uppercase tracking-[0.24em] text-red sm:text-sm">
            Finish Carpentry • Las Vegas Valley
          </p>
          <h1 className="mt-4 text-4xl leading-tight sm:text-5xl lg:text-6xl">
            Custom Finish Carpentry That Looks Built-In From Day One.
          </h1>
          <p className="mt-5 max-w-2xl text-sm text-white/85 sm:text-base md:text-lg">
            Built-ins, floating shelves, mantels, trim, and cabinetry—measured, built, and
            installed with clean lines and rock-solid fit.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/get-a-quote"
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

          <p className="mt-8 text-sm text-white/70">Now showing: {activeSlide.title}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={goPrev}
        aria-label="Previous hero slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/60 bg-black/30 px-3 py-2 text-lg text-white transition hover:bg-black/55 sm:left-5"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={goNext}
        aria-label="Next hero slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/60 bg-black/30 px-3 py-2 text-lg text-white transition hover:bg-black/55 sm:right-5"
      >
        ›
      </button>

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2">
        {HERO_SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Show ${slide.title} slide`}
            onClick={() => setActiveIndex(index)}
            className={`h-2.5 w-2.5 rounded-full transition ${
              index === activeIndex ? "bg-white" : "bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
