"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { VisionResult } from "@/lib/ai/generateVision";

const SERVICE_LABELS: Record<string, string> = {
  BARN_DOORS: "Barn Doors",
  CABINETS: "Cabinets",
  CUSTOM_CLOSETS: "Custom Closets",
  FAUX_BEAMS: "Faux Beams",
  FLOATING_SHELVES: "Floating Shelves",
  MANTELS: "Mantels",
  TRIM_WORK: "Trim Work",
  MULTIPLE: "Multiple Services",
  OTHER: "Other",
};

type LeadData = {
  id: string;
  token: string;
  firstName: string;
  serviceType: string;
  intakeData: Record<string, unknown>;
  visionStatus: "PENDING" | "GENERATING" | "COMPLETE" | "FAILED";
  visionResult: VisionResult | null;
  renderUrl: string | null;
};

type Props = {
  initial: LeadData;
};

export default function VisionCard({ initial }: Props) {
  const [lead, setLead] = useState(initial);
  const [confirmed, setConfirmed] = useState(false);

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

  const intake = lead.intakeData;

  if (confirmed) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="bg-white border-b border-gray-warm px-6 py-3 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Image src="/images/logo-light.png" alt="Sublime Design NV" width={120} height={32} className="h-8 w-auto" />
          <span className="text-gray-mid text-sm font-ui">Custom Woodwork · Las Vegas, NV</span>
        </div>
        <div className="max-w-lg mx-auto px-6 py-16 space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">✓</span>
            </div>
            <h1 className="font-display text-4xl text-charcoal mb-3">You&apos;re all set!</h1>
            <p className="text-gray-mid text-lg leading-relaxed">
              Tyler at Sublime Design NV has been notified and will reach out within 24 hours
              to schedule your on-site consultation and put together your bid.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-warm p-6">
            <h2 className="text-sm font-ui font-semibold text-gray-mid uppercase tracking-wide mb-4">Your Project Summary</h2>
            <div className="divide-y divide-gray-warm">
              {[
                { label: "Service", value: SERVICE_LABELS[lead.serviceType] ?? lead.serviceType },
                { label: "Space", value: intake.space as string | undefined },
                { label: "Budget", value: intake.budget as string | undefined },
                { label: "Timeline", value: intake.timeline as string | undefined },
              ].filter((r) => r.value).map(({ label, value }) => (
                <div key={label} className="flex justify-between py-3 text-sm">
                  <span className="font-ui font-semibold text-gray-mid">{label}</span>
                  <span className="text-charcoal">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-navy/5 border border-navy/20 rounded-xl p-6 text-center">
            <p className="font-ui font-semibold text-navy mb-1">Questions in the meantime?</p>
            <p className="text-gray-mid text-sm mb-4">Call or text Tyler directly</p>
            <a
              href="tel:+17028479016"
              className="inline-block bg-navy text-white font-ui font-bold px-8 py-3 rounded-xl hover:bg-navy/80 transition-colors"
            >
              702-847-9016
            </a>
          </div>

          <button
            onClick={() => window.print()}
            className="w-full border border-gray-warm text-charcoal font-ui font-semibold py-3 rounded-xl hover:border-charcoal transition-colors text-sm"
          >
            Save Your Design Concept
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Branding header */}
      <div className="bg-white border-b border-gray-warm px-6 py-3 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-light.png" alt="Sublime Design NV" className="h-8 w-auto" />
        <span className="text-gray-mid text-sm font-ui">Custom Woodwork · Las Vegas, NV</span>
      </div>

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

      {/* AI Render — full viewport width */}
      {lead.renderUrl && (
        <div className="w-full bg-charcoal">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lead.renderUrl}
            alt={vision.headline}
            className="w-full h-[40vh] md:h-[60vh] object-cover"
          />
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
            <button
              onClick={async () => {
                await fetch(`/api/intake/${lead.id}/bid-request`, { method: "POST" });
                setConfirmed(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="bg-white text-red font-ui font-bold px-8 py-4 rounded-xl hover:bg-cream transition-colors"
            >
              Request Your Quote
            </button>
            <a
              href={`/intake/${lead.token}?edit=1`}
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
