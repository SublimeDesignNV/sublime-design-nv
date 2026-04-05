"use client";

import { useState } from "react";
import type { IntakeLead } from "@prisma/client";
import type { VisionResult } from "@/lib/ai/generateVision";

type Props = {
  lead: IntakeLead;
  renderUrl?: string;
};

export default function VisionTab({ lead, renderUrl }: Props) {
  const [regenerating, setRegenerating] = useState(false);
  const [status, setStatus] = useState(lead.visionStatus);
  const [copied, setCopied] = useState(false);

  const vision = lead.visionResult as VisionResult | null;

  async function regenerate() {
    setRegenerating(true);
    try {
      await fetch(`/api/leads/${lead.id}/generate`, { method: "POST" });
      setStatus("GENERATING");
      // Poll for completion
      const interval = setInterval(async () => {
        const res = await fetch(`/api/intake/${lead.id}/status`);
        const data = (await res.json()) as { visionStatus: string };
        if (data.visionStatus === "COMPLETE" || data.visionStatus === "FAILED") {
          clearInterval(interval);
          window.location.reload();
        }
      }, 3000);
    } catch {
      setRegenerating(false);
    }
  }

  async function copyPrompt() {
    if (!vision?.imageGenerationPrompt) return;
    await navigator.clipboard.writeText(vision.imageGenerationPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (status === "GENERATING") {
    return (
      <div className="text-center py-16">
        <div className="w-10 h-10 border-2 border-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-charcoal font-ui font-semibold">Generating vision...</p>
        <p className="text-gray-mid text-sm mt-1">This takes about 30 seconds. Refresh to check.</p>
      </div>
    );
  }

  if (status === "PENDING" || !vision) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-mid mb-4">Vision not yet generated.</p>
        <p className="text-sm text-gray-mid mb-6">The client needs to complete their intake first, or you can trigger generation manually.</p>
        <button
          onClick={() => void regenerate()}
          disabled={regenerating}
          className="bg-red text-white font-ui font-bold px-8 py-3 rounded-lg hover:bg-red-dark transition-colors disabled:opacity-40"
        >
          Generate Vision Now
        </button>
      </div>
    );
  }

  if (status === "FAILED") {
    return (
      <div className="text-center py-16">
        <p className="text-red font-ui font-semibold mb-4">Vision generation failed.</p>
        <button
          onClick={() => void regenerate()}
          disabled={regenerating}
          className="bg-red text-white font-ui font-bold px-8 py-3 rounded-lg hover:bg-red-dark transition-colors disabled:opacity-40"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* AI Render — shown first */}
      {renderUrl && (
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={renderUrl} alt={vision.headline} className="rounded-xl w-full object-cover max-h-[480px]" />
        </div>
      )}

      {/* Contractor Notes */}
      {vision.contractorNotes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-sm font-ui font-semibold text-yellow-800 uppercase tracking-wide mb-3">
            📋 Contractor Notes
          </h3>
          <p className="text-yellow-900 whitespace-pre-wrap">{vision.contractorNotes}</p>
        </div>
      )}

      {/* Headline */}
      <div>
        <h2 className="font-display text-3xl text-charcoal">{vision.headline}</h2>
        <div className="flex flex-wrap gap-2 mt-3">
          {vision.moodKeywords?.map((word) => (
            <span key={word} className="bg-navy/10 text-navy px-3 py-1 rounded-full text-sm font-ui">{word}</span>
          ))}
        </div>
      </div>

      {/* Visual description */}
      <div>
        <h3 className="text-sm font-ui font-semibold text-gray-mid uppercase tracking-wide mb-3">Visual Description</h3>
        <p className="text-charcoal leading-relaxed whitespace-pre-line">{vision.visualDescription}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Key features */}
        {vision.keyFeatures?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-warm p-5">
            <h3 className="text-sm font-ui font-semibold text-gray-mid uppercase tracking-wide mb-3">Key Features</h3>
            <ul className="space-y-2">
              {vision.keyFeatures.map((f) => (
                <li key={f} className="flex gap-2 text-sm text-charcoal">
                  <span className="text-red flex-shrink-0">✦</span> {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Materials */}
        {vision.materialSuggestions?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-warm p-5">
            <h3 className="text-sm font-ui font-semibold text-gray-mid uppercase tracking-wide mb-3">Material Suggestions</h3>
            <ul className="space-y-2">
              {vision.materialSuggestions.map((m) => (
                <li key={m} className="flex gap-2 text-sm text-charcoal">
                  <span className="text-gray-mid flex-shrink-0">—</span> {m}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Color palette */}
      {vision.colorPalette?.length > 0 && (
        <div>
          <h3 className="text-sm font-ui font-semibold text-gray-mid uppercase tracking-wide mb-3">Color Palette</h3>
          <div className="flex flex-wrap gap-4">
            {vision.colorPalette.map((c) => (
              <div key={c.name} className="flex items-center gap-3 bg-white border border-gray-warm rounded-lg px-4 py-3">
                <div className="w-10 h-10 rounded-lg border border-gray-warm" style={{ backgroundColor: c.hex }} />
                <div>
                  <p className="text-sm font-ui font-semibold text-charcoal">{c.name}</p>
                  <p className="text-xs text-gray-mid">{c.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image generation prompt */}
      {vision.imageGenerationPrompt && (
        <div className="bg-white rounded-xl border border-gray-warm p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-ui font-semibold text-gray-mid uppercase tracking-wide">
              Image Generation Prompt
            </h3>
            <button
              onClick={() => void copyPrompt()}
              className="text-xs font-ui font-semibold text-red hover:underline"
            >
              {copied ? "✓ Copied!" : "Copy for DALL-E / Midjourney"}
            </button>
          </div>
          <p className="text-charcoal text-sm font-mono bg-gray-warm/40 rounded-lg p-4 leading-relaxed">
            {vision.imageGenerationPrompt}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => void regenerate()}
          disabled={regenerating}
          className="border border-gray-warm text-charcoal font-ui font-semibold px-6 py-3 rounded-lg hover:border-red hover:text-red transition-colors disabled:opacity-40"
        >
          ↺ Regenerate Vision
        </button>
        <a
          href={`/vision/${lead.id}`}
          target="_blank"
          className="bg-navy text-white font-ui font-semibold px-6 py-3 rounded-lg hover:bg-navy/80 transition-colors"
        >
          Preview Client View →
        </a>
      </div>
    </div>
  );
}
