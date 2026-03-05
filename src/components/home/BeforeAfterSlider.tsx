"use client";

import Image from "next/image";
import { useState } from "react";

type BeforeAfterPair = {
  title: string;
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
};

const PAIRS: BeforeAfterPair[] = [
  {
    title: "Living Room Built-In Upgrade",
    beforeSrc: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1800&q=80",
    afterSrc: "https://images.unsplash.com/photo-1750268746263-52cdef61e177?auto=format&fit=crop&w=1800&q=80",
    beforeAlt: "Living room before custom built-ins",
    afterAlt: "Living room after custom built-ins and finish carpentry",
  },
  {
    title: "Kitchen Storage Transformation",
    beforeSrc: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=80",
    afterSrc: "https://images.unsplash.com/photo-1556910602-38f53e68e15d?auto=format&fit=crop&w=1800&q=80",
    beforeAlt: "Kitchen before floating shelf upgrade",
    afterAlt: "Kitchen after floating shelf and cabinetry upgrade",
  },
];

export default function BeforeAfterSlider() {
  const [activePairIndex, setActivePairIndex] = useState(0);
  const [reveal, setReveal] = useState(55);
  const pair = PAIRS[activePairIndex];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-ui text-sm uppercase tracking-widest text-red">Before &amp; After</p>
            <h2 className="mt-3 text-4xl text-charcoal md:text-5xl">See the Difference in the Details</h2>
          </div>
          <div className="flex gap-2">
            {PAIRS.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => {
                  setActivePairIndex(index);
                  setReveal(55);
                }}
                className={`font-ui rounded-sm border px-3 py-2 text-xs uppercase tracking-wide ${
                  index === activePairIndex
                    ? "border-red bg-red text-white"
                    : "border-gray-300 bg-white text-charcoal"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-gray-200 bg-gray-100 p-3 shadow-sm">
          <p className="font-ui px-1 pb-3 text-xs uppercase tracking-[0.18em] text-gray-mid">{pair.title}</p>
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
            <Image
              src={pair.beforeSrc}
              alt={pair.beforeAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-cover"
            />
            <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${reveal}%` }}>
              <div className="relative h-full w-full">
                <Image
                  src={pair.afterSrc}
                  alt={pair.afterAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 900px"
                  className="object-cover"
                />
              </div>
            </div>
            <div
              className="pointer-events-none absolute inset-y-0 w-0.5 bg-white/90"
              style={{ left: `calc(${reveal}% - 1px)` }}
            />
            <div className="pointer-events-none absolute left-3 top-3 rounded-sm bg-black/60 px-2 py-1 text-xs text-white">
              Before
            </div>
            <div className="pointer-events-none absolute right-3 top-3 rounded-sm bg-black/60 px-2 py-1 text-xs text-white">
              After
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={reveal}
            onChange={(event) => setReveal(Number(event.target.value))}
            className="mt-4 w-full accent-red"
            aria-label="Reveal before and after"
          />
        </div>
      </div>
    </section>
  );
}
