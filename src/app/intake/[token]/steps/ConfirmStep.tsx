"use client";

import type { IntakeFormData } from "../IntakeForm";
import type { IntakeServiceType } from "@prisma/client";

const SERVICE_LABELS: Record<IntakeServiceType, string> = {
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

type Props = {
  serviceType: IntakeServiceType;
  data: IntakeFormData;
  spacePhotoCount: number;
  inspirationPhotoCount: number;
  productLinkCount: number;
  inspirationLinkCount: number;
  submitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
};

export default function ConfirmStep({
  serviceType,
  data,
  spacePhotoCount,
  inspirationPhotoCount,
  productLinkCount,
  inspirationLinkCount,
  submitting,
  onSubmit,
  onBack,
}: Props) {
  const totalLinks = productLinkCount + inspirationLinkCount;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl text-charcoal mb-2">Ready to generate your concept?</h2>
        <p className="text-gray-mid">Here&apos;s a summary of what you&apos;ve shared with us.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-warm divide-y divide-gray-warm">
        {[
          { label: "Service", value: SERVICE_LABELS[serviceType] },
          { label: "Space", value: data.space ?? "—" },
          { label: "Style", value: data.styles?.join(", ") ?? "—" },
          { label: "Budget", value: data.budget ?? "Not specified" },
          { label: "Timeline", value: data.timeline ?? "—" },
          { label: "Space photos", value: `${spacePhotoCount} photo${spacePhotoCount !== 1 ? "s" : ""}` },
          ...(inspirationPhotoCount > 0
            ? [{ label: "Inspiration photos", value: `${inspirationPhotoCount} photo${inspirationPhotoCount !== 1 ? "s" : ""}` }]
            : []),
          ...(totalLinks > 0
            ? [{ label: "Links shared", value: `${totalLinks} link${totalLinks !== 1 ? "s" : ""}` }]
            : []),
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between px-5 py-3 text-sm">
            <span className="font-ui font-semibold text-gray-mid">{label}</span>
            <span className="text-charcoal text-right max-w-[60%]">{value}</span>
          </div>
        ))}
      </div>

      <div className="bg-navy/5 border border-navy/20 rounded-xl p-5 text-center">
        <p className="text-navy font-ui font-semibold">
          ✦ After you submit, we&apos;ll generate your design concept and reach out within 24 hours.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={submitting}
          className="flex-1 border border-gray-warm text-charcoal font-ui font-semibold py-4 rounded-lg hover:border-charcoal transition-colors disabled:opacity-40"
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="flex-[2] bg-red text-white font-ui font-bold py-4 rounded-lg hover:bg-red-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </span>
          ) : (
            "Submit & See My Concept →"
          )}
        </button>
      </div>
    </div>
  );
}
