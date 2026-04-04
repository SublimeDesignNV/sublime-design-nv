"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { IntakeServiceType } from "@prisma/client";
import WelcomeStep from "./steps/WelcomeStep";
import ProjectBasicsStep from "./steps/ProjectBasicsStep";
import SpacePhotosStep from "./steps/SpacePhotosStep";
import InspirationStep from "./steps/InspirationStep";
import FinalNotesStep from "./steps/FinalNotesStep";
import ConfirmStep from "./steps/ConfirmStep";

export type IntakeFormData = {
  space?: string;
  spaceOther?: string;       // Fix 1 — freeform when space === "Other"
  styles?: string[];
  styleCustomNote?: string;  // Fix 4 — freeform when "Custom/Not Sure" selected
  budget?: string;
  timeline?: string;
  asapDate?: string;         // Fix 5 — specific date when timeline === "ASAP"
  finalNotes?: string;
  dontWant?: string;
  howHeard?: string;
  serviceDetails?: Record<string, unknown>;
};

type SpacePhoto = { id: string; url: string; caption: string };
type InspirationPhoto = { id: string; url: string; caption: string };
type LinkEntry = { url: string; label: string };

type Props = {
  leadId: string;
  token: string;
  firstName: string;
  serviceType: IntakeServiceType;
};

const STEPS = ["welcome", "basics", "photos", "inspiration", "notes", "confirm"] as const;
type Step = (typeof STEPS)[number];

const STEP_LABELS = [
  "Welcome",
  "Project Details",
  "Your Space",
  "Inspiration",
  "Final Notes",
  "Review",
];

function getStorageKey(token: string) {
  return `intake_${token}`;
}

export default function IntakeForm({ leadId, token, firstName, serviceType }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [formData, setFormData] = useState<IntakeFormData>({});
  const [spacePhotos, setSpacePhotos] = useState<SpacePhoto[]>([]);
  const [inspirationPhotos, setInspirationPhotos] = useState<InspirationPhoto[]>([]);
  const [productLinks, setProductLinks] = useState<LinkEntry[]>([]);
  const [inspirationLinks, setInspirationLinks] = useState<LinkEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Restore from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(getStorageKey(token));
      if (saved) {
        const parsed = JSON.parse(saved) as {
          formData?: IntakeFormData;
          step?: Step;
        };
        if (parsed.formData) setFormData(parsed.formData);
        if (parsed.step && parsed.step !== "welcome") setStep(parsed.step);
      }
    } catch {
      // ignore
    }
  }, [token]);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(getStorageKey(token), JSON.stringify({ formData, step }));
    } catch {
      // ignore
    }
  }, [formData, step, token]);

  // Mark intake as started when client leaves welcome step
  async function markStarted() {
    await fetch(`/api/intake/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "INTAKE_STARTED" }),
    });
  }

  function updateFormData(updates: Partial<IntakeFormData>) {
    setFormData((prev) => ({ ...prev, ...updates }));
  }

  const stepIndex = STEPS.indexOf(step);

  function goNext() {
    const nextStep = STEPS[stepIndex + 1];
    if (nextStep) {
      setStep(nextStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goBack() {
    const prevStep = STEPS[stepIndex - 1];
    if (prevStep) {
      setStep(prevStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleSubmit() {
    setSubmitting(true);

    try {
      // Save all link assets
      const linkAssets: { type: string; url: string; caption?: string }[] = [
        ...productLinks.filter((l) => l.url).map((l) => ({
          type: "PRODUCT_LINK",
          url: l.url,
          caption: l.label || undefined,
        })),
        ...inspirationLinks.filter((l) => l.url).map((l) => ({
          type: "INSPIRATION_LINK",
          url: l.url,
        })),
      ];

      // Submit intake data
      await fetch(`/api/intake/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intakeData: formData,
          status: "INTAKE_COMPLETE",
          assets: linkAssets,
        }),
      });

      // Trigger AI generation
      await fetch(`/api/leads/${leadId}/generate`, { method: "POST" });

      // Clear localStorage
      localStorage.removeItem(getStorageKey(token));

      router.push(`/vision/${leadId}`);
    } catch (err) {
      console.error("[intake-submit]", err);
      setSubmitting(false);
    }
  }

  const isWelcome = step === "welcome";

  return (
    <div className="min-h-screen bg-cream">
      {/* Progress bar (hidden on welcome) */}
      {!isWelcome && (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-warm">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-4">
            <span className="text-xs font-ui font-semibold text-gray-mid uppercase tracking-wide">
              Step {stepIndex} of {STEPS.length - 1}
            </span>
            <div className="flex-1 h-1.5 bg-gray-warm rounded-full overflow-hidden">
              <div
                className="h-full bg-red rounded-full transition-all duration-300"
                style={{ width: `${(stepIndex / (STEPS.length - 1)) * 100}%` }}
              />
            </div>
            <span className="text-xs font-ui font-semibold text-charcoal">
              {STEP_LABELS[stepIndex]}
            </span>
          </div>
        </div>
      )}

      {/* Branded header (welcome only) */}
      {isWelcome && (
        <div className="bg-navy py-4 px-6 text-center">
          <span className="text-white font-display text-lg tracking-wide">Sublime Design NV</span>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-8">
        {step === "welcome" && (
          <WelcomeStep
            firstName={firstName}
            onNext={async () => {
              await markStarted();
              goNext();
            }}
          />
        )}

        {step === "basics" && (
          <ProjectBasicsStep
            serviceType={serviceType}
            data={formData}
            onChange={updateFormData}
            onNext={goNext}
            onBack={goBack}
          />
        )}

        {step === "photos" && (
          <SpacePhotosStep
            leadId={leadId}
            photos={spacePhotos}
            onPhotosChange={setSpacePhotos}
            onNext={goNext}
            onBack={goBack}
          />
        )}

        {step === "inspiration" && (
          <InspirationStep
            leadId={leadId}
            inspirationPhotos={inspirationPhotos}
            productLinks={productLinks}
            inspirationLinks={inspirationLinks}
            onInspirationPhotosChange={setInspirationPhotos}
            onProductLinksChange={setProductLinks}
            onInspirationLinksChange={setInspirationLinks}
            onNext={goNext}
            onBack={goBack}
          />
        )}

        {step === "notes" && (
          <FinalNotesStep
            data={formData}
            onChange={updateFormData}
            onNext={goNext}
            onBack={goBack}
          />
        )}

        {step === "confirm" && (
          <ConfirmStep
            serviceType={serviceType}
            data={formData}
            spacePhotoCount={spacePhotos.length}
            inspirationPhotoCount={inspirationPhotos.length}
            productLinkCount={productLinks.filter((l) => l.url).length}
            inspirationLinkCount={inspirationLinks.filter((l) => l.url).length}
            submitting={submitting}
            onSubmit={handleSubmit}
            onBack={goBack}
          />
        )}
      </div>
    </div>
  );
}
