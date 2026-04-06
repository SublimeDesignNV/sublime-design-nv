"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { IntakeServiceType } from "@prisma/client";
import ProjectBasicsStep from "@/app/intake/[token]/steps/ProjectBasicsStep";
import SpacePhotosStep from "@/app/intake/[token]/steps/SpacePhotosStep";
import FinalNotesStep from "@/app/intake/[token]/steps/FinalNotesStep";
import ConfirmStep from "@/app/intake/[token]/steps/ConfirmStep";
import type { IntakeFormData } from "@/app/intake/[token]/IntakeForm";

type PhotoEntry = { id: string; url: string; caption: string };
type LinkEntry = { url: string; label: string };

type Props = {
  leadId: string;
  token: string;
  firstName: string;
  serviceType: IntakeServiceType;
  skipPhotos: boolean;
};

const ALL_STEPS = ["basics", "photos", "notes", "confirm"] as const;
const TRADESHOW_STEPS = ["basics", "notes", "confirm"] as const;
type Step = (typeof ALL_STEPS)[number];

const STEP_LABELS: Record<Step, string> = {
  basics: "Your Project",
  photos: "Your Space",
  notes: "Final Details",
  confirm: "Review & Submit",
};

export default function KioskIntakeForm({ leadId, token, firstName, serviceType, skipPhotos }: Props) {
  const router = useRouter();
  const steps = (skipPhotos ? TRADESHOW_STEPS : ALL_STEPS) as readonly Step[];
  const [step, setStep] = useState<Step>("basics");
  const [formData, setFormData] = useState<IntakeFormData>({});
  const [spacePhotos, setSpacePhotos] = useState<PhotoEntry[]>([]);
  const [inspirationPhotos, setInspirationPhotos] = useState<PhotoEntry[]>([]);
  const [detailPhotos, setDetailPhotos] = useState<PhotoEntry[]>([]);
  const [productLinks, setProductLinks] = useState<LinkEntry[]>([]);
  const [inspirationLinks, setInspirationLinks] = useState<LinkEntry[]>([]);
  const [photosSkipped, setPhotosSkipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetInactivity = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      router.replace("/kiosk");
    }, 90_000);
  }, [router]);

  useEffect(() => {
    resetInactivity();
    const events = ["touchstart", "touchmove", "click", "keydown"] as const;
    events.forEach((e) => window.addEventListener(e, resetInactivity));
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetInactivity));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [resetInactivity]);

  function updateFormData(updates: Partial<IntakeFormData>) {
    setFormData((prev) => ({ ...prev, ...updates }));
  }

  const stepIndex = steps.indexOf(step);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  function goNext() {
    const next = steps[stepIndex + 1];
    if (next) { setStep(next); window.scrollTo({ top: 0 }); }
  }

  function goBack() {
    const prev = steps[stepIndex - 1];
    if (prev) { setStep(prev); window.scrollTo({ top: 0 }); }
    else router.replace("/kiosk/start");
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await fetch(`/api/intake/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "INTAKE_COMPLETE", intakeData: formData }),
      });
      router.replace(`/kiosk/thankyou?name=${encodeURIComponent(firstName)}&token=${token}`);
    } catch {
      setSubmitting(false);
    }
  }

  const stepContent = (() => {
    switch (step) {
      case "basics":
        return (
          <ProjectBasicsStep
            serviceType={serviceType}
            data={formData}
            onChange={updateFormData}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case "photos":
        return (
          <SpacePhotosStep
            leadId={leadId}
            spacePhotos={spacePhotos}
            inspirationPhotos={inspirationPhotos}
            detailPhotos={detailPhotos}
            productLinks={productLinks}
            inspirationLinks={inspirationLinks}
            photosSkipped={photosSkipped}
            onSpacePhotosChange={setSpacePhotos}
            onInspirationPhotosChange={setInspirationPhotos}
            onDetailPhotosChange={setDetailPhotos}
            onProductLinksChange={setProductLinks}
            onInspirationLinksChange={setInspirationLinks}
            onPhotosSkipped={setPhotosSkipped}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case "notes":
        return (
          <FinalNotesStep
            data={formData}
            onChange={updateFormData}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case "confirm":
        return (
          <ConfirmStep
            serviceType={serviceType}
            data={formData}
            spacePhotoUrls={spacePhotos.map((p) => p.url)}
            inspirationPhotoUrls={inspirationPhotos.map((p) => p.url)}
            productLinkCount={productLinks.length}
            inspirationLinkCount={inspirationLinks.length}
            submitting={submitting}
            onSubmit={() => void handleSubmit()}
            onBack={goBack}
          />
        );
    }
  })();

  return (
    <div className="flex min-h-screen flex-col bg-navy">
      {/* Header */}
      <div className="border-b border-white/10 px-6 pb-0 pt-5">
        <div className="flex items-center justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-light.png"
            alt="Sublime Design NV"
            className="h-8 w-auto"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <span className="font-ui text-sm uppercase tracking-widest text-white/40">
            {STEP_LABELS[step]}
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-red transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step content in white card for readability */}
      <div className="flex-1 overflow-y-auto bg-white">
        {stepContent}
      </div>

      {/* Bottom nav */}
      <div className="flex gap-4 border-t border-white/10 bg-navy px-6 py-4">
        <button
          type="button"
          onClick={goBack}
          className="min-h-[64px] flex-1 rounded-xl border border-white/20 text-xl text-white/70 active:bg-white/10"
        >
          ← Back
        </button>
        {step !== "confirm" && (
          <button
            type="button"
            onClick={goNext}
            className="min-h-[64px] flex-[2] rounded-xl bg-red text-xl font-semibold text-white active:scale-95"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
