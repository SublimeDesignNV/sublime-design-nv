"use client";

import { useEffect, useState } from "react";
import type { VisionResult } from "@/lib/ai/generateVision";

type LeadData = {
  id: string;
  firstName: string;
  visionStatus: "PENDING" | "GENERATING" | "COMPLETE" | "FAILED";
  visionResult: VisionResult | null;
  renderUrl: string | null;
};

type Props = {
  initial: LeadData;
};

export default function VisionCard({ initial }: Props) {
  const [lead, setLead] = useState(initial);

  // Poll while generating
  useEffect(() => {
    if (lead.visionStatus !== "GENERATING" && lead.visionStatus !== "PENDING") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/intake/${lead.id}/status`);
        if (!res.ok) return;
        const data = (await res.json()) as { visionStatus: string; visionResult: VisionResult | null; renderUrl: string | null };
        setLead((prev) => ({
          ...prev,
          visionStatus: data.visionStatus as LeadData["visionStatus"],
          visionResult: data.visionResult,
          renderUrl: data.renderUrl,
        }));
      } catch {
        // keep polling
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [lead.id, lead.visionStatus]);

  if (lead.visionStatus === "GENERATING" || lead.visionStatus === "PENDING") {
    return (
      <div className="min-h-screen bg-navy flex flex-col items-center justify-center text-white px-6">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-8">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-white/20" />
              <div className="absolute inset-0 rounded-full border-4 border-red border-t-transparent animate-spin" />
            </div>
          </div>
          <h1 className="font-display text-4xl mb-4">Building your concept...</h1>
          <p className="text-white/70 text-lg">
            We&apos;re analyzing your inspiration and crafting a visual concept for your project.
            This takes about 30 seconds.
          </p>
          <div className="mt-8 flex justify-center gap-2">
            {["Analyzing your space", "Matching your style", "Crafting the concept"].map((label, i) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full bg-red animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
                <span className="text-xs text-white/50 hidden md:block">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (lead.visionStatus === "FAILED") {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="font-display text-3xl text-charcoal mb-4">Something went wrong</h1>
          <p className="text-gray-mid mb-6">
            We had trouble generating your concept. Our team has been notified and will reach out shortly.
          </p>
          <a href="tel:+17028479016" className="bg-red text-white px-8 py-4 rounded-lg font-ui font-bold inline-block">
            Call Us Directly
          </a>
        </div>
      </div>
    );
  }

  const vision = lead.visionResult;
  if (!vision) return null;

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="bg-navy text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-red font-ui font-semibold text-sm uppercase tracking-widest mb-4">
            Your Design Concept
          </p>
          <h1 className="font-display text-4xl md:text-6xl mb-6">{vision.headline}</h1>
          <div className="flex flex-wrap justify-center gap-2">
            {vision.moodKeywords?.map((word) => (
              <span key={word} className="bg-white/10 text-white/80 px-4 py-1.5 rounded-full text-sm font-ui">
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* AI Render */}
      {lead.renderUrl && (
        <div className="bg-charcoal">
          <div className="max-w-4xl mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lead.renderUrl}
              alt={vision.headline}
              className="w-full object-cover max-h-[600px]"
            />
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">
        {/* Visual Description */}
        <section>
          <h2 className="font-display text-2xl text-charcoal mb-4">Your Vision</h2>
          <div className="text-charcoal leading-relaxed whitespace-pre-line text-lg">
            {vision.visualDescription}
          </div>
        </section>

        {/* Key Features */}
        {vision.keyFeatures?.length > 0 && (
          <section>
            <h2 className="font-display text-2xl text-charcoal mb-4">Key Features</h2>
            <ul className="space-y-3">
              {vision.keyFeatures.map((feature) => (
                <li key={feature} className="flex gap-3 items-start">
                  <span className="text-red mt-1 flex-shrink-0">✦</span>
                  <span className="text-charcoal">{feature}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Color Palette */}
        {vision.colorPalette?.length > 0 && (
          <section>
            <h2 className="font-display text-2xl text-charcoal mb-4">Color Palette</h2>
            <div className="flex flex-wrap gap-4">
              {vision.colorPalette.map((color) => (
                <div key={color.name} className="flex flex-col items-center gap-2">
                  <div
                    className="w-16 h-16 rounded-xl border border-gray-warm shadow-sm"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-xs font-ui font-semibold text-charcoal">{color.name}</span>
                  <span className="text-xs text-gray-mid">{color.role}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Material Suggestions */}
        {vision.materialSuggestions?.length > 0 && (
          <section>
            <h2 className="font-display text-2xl text-charcoal mb-4">Material Suggestions</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {vision.materialSuggestions.map((mat) => (
                <div key={mat} className="bg-white border border-gray-warm rounded-xl p-4 text-charcoal text-sm font-ui">
                  {mat}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-red text-white rounded-2xl p-8 text-center">
          <h2 className="font-display text-3xl mb-3">Love what you see?</h2>
          <p className="text-white/80 mb-6">We&apos;re ready to build it. Let&apos;s talk next steps.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`/api/intake/${lead.id}/bid-request`}
              onClick={async (e) => {
                e.preventDefault();
                await fetch(`/api/leads/${lead.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: "BID_READY" }),
                });
                window.location.href = "/quote?source=vision";
              }}
              className="bg-white text-red font-ui font-bold px-8 py-4 rounded-xl hover:bg-cream transition-colors"
            >
              Request Your Quote
            </a>
            <a
              href={`/intake/${lead.id}?edit=1`}
              className="border border-white/40 text-white font-ui font-semibold px-8 py-4 rounded-xl hover:border-white transition-colors"
            >
              I want to make changes
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
