"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { uploadLeadPhoto } from "@/lib/cloudinaryUpload";
import { trackEvent } from "@/lib/analytics";
import { SERVICES, findService } from "@/content/services";
import { readQuotePrefill, type QuotePrefillContext } from "@/lib/publicLeadCtas";
import {
  applyQuotePrefillToForm,
  BUDGET_OPTIONS,
  hasVisibleQuoteContext,
  QUOTE_DEFAULT_FORM,
  TIMELINE_OPTIONS,
  getQuoteVisibleContext,
  sanitizePhone,
  validateQuoteFields,
  type QuoteFieldErrors,
  type QuoteFormFields,
} from "@/lib/quoteForm";

// ─── Service options ──────────────────────────────────────────────────────────
const SERVICE_OPTIONS = SERVICES;

const TRUST_REASONS = [
  "Measured, built, and installed by a local finish carpentry team.",
  "Project photos and scope details stay tied to your quote request.",
  "Straightforward follow-up by phone or email without a long sales process.",
] as const;

const NEXT_STEPS = [
  "We review your service, location, and project details.",
  "If needed, we follow up to confirm measurements, photos, or scheduling.",
  "You get the next step for pricing, site visit, or installation timing.",
] as const;

const MAX_PHOTOS = 5;
const MAX_FILE_MB = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

// ─── Types ────────────────────────────────────────────────────────────────────

type PhotoState = {
  file: File;
  previewUrl: string;
  status: "pending" | "uploading" | "done" | "error";
  cloudUrl?: string;
  errorMsg?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function serviceSuccessCopy(slug: string): string {
  const service = findService(slug);
  if (!service) return "We'll review your request and reach out shortly with next steps.";
  return `We'll review your ${service.shortTitle.toLowerCase()} request and reach out shortly with next steps.`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-600">{msg}</p>;
}

function inputClass(hasError: boolean) {
  return `mt-1 w-full rounded-md border px-3 py-2.5 text-sm text-charcoal shadow-sm transition focus:outline-none focus:ring-2 focus:ring-red/40 ${
    hasError ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
  }`;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 font-ui text-xs uppercase tracking-widest text-gray-mid">{children}</p>
  );
}

function QuoteTrustSection() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <SectionLabel>Why Homeowners Reach Out</SectionLabel>
      <ul className="space-y-3 text-sm text-gray-mid">
        {TRUST_REASONS.map((reason) => (
          <li key={reason} className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-red" />
            <span>{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WhatHappensNext() {
  return (
    <div className="rounded-xl border border-gray-200 bg-cream p-6">
      <SectionLabel>What Happens Next</SectionLabel>
      <ol className="space-y-3 text-sm text-gray-mid">
        {NEXT_STEPS.map((step, index) => (
          <li key={step} className="flex items-start gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ─── Photo upload section ─────────────────────────────────────────────────────

function PhotoUploadSection({
  photos,
  onAdd,
  onRemove,
  uploadsEnabled,
}: {
  photos: PhotoState[];
  onAdd: (files: FileList) => void;
  onRemove: (index: number) => void;
  uploadsEnabled: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const canAdd = photos.length < MAX_PHOTOS && uploadsEnabled;

  return (
    <div>
      <SectionLabel>Photos (optional)</SectionLabel>
      <p className="mb-3 text-sm text-gray-mid">
        Upload up to {MAX_PHOTOS} photos of the space — before shots, measurements, or inspiration.
      </p>

      {photos.length > 0 ? (
        <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {photos.map((photo, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.previewUrl}
                alt={`Upload ${i + 1}`}
                className="h-full w-full object-cover"
              />
              {/* Status overlay */}
              {photo.status === "uploading" ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                  <svg className="h-5 w-5 animate-spin text-red" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                </div>
              ) : photo.status === "error" ? (
                <div className="absolute inset-0 flex items-center justify-center bg-red-50/90">
                  <span className="text-xs text-red-600">Failed</span>
                </div>
              ) : photo.status === "done" ? (
                <div className="absolute right-1 top-1">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[9px] text-white">✓</span>
                </div>
              ) : null}
              {/* Remove button */}
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-[10px] text-white hover:bg-black/70"
                aria-label="Remove photo"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {canAdd ? (
        <>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED_TYPES.join(",")}
            className="sr-only"
            onChange={(e) => {
              if (e.target.files) onAdd(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 rounded-md border border-dashed border-gray-300 bg-cream px-4 py-3 text-sm text-gray-mid transition hover:border-red hover:text-red"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add photos {photos.length > 0 ? `(${photos.length}/${MAX_PHOTOS})` : ""}
          </button>
        </>
      ) : photos.length >= MAX_PHOTOS ? (
        <p className="text-sm text-gray-mid">Maximum {MAX_PHOTOS} photos reached.</p>
      ) : null}
    </div>
  );
}

// ─── Success state ────────────────────────────────────────────────────────────

function SuccessState({ service, context }: { service: string; context: QuotePrefillContext }) {
  const visibleContext = getQuoteVisibleContext(context);
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-charcoal">Request received — thank you!</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm text-gray-mid">
        {serviceSuccessCopy(service)}
      </p>
      <p className="mt-2 text-sm text-gray-mid">
        Expect a response within one business day. We may call or email to confirm a few details.
      </p>
      {visibleContext.summary ? <p className="mt-2 text-sm text-gray-mid">{visibleContext.summary}</p> : null}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <Link href="/quote" className="font-ui text-sm font-semibold text-charcoal hover:underline">
          Start another request
        </Link>
        <Link href="/projects" className="font-ui text-sm font-semibold text-red hover:underline">
          Browse our work →
        </Link>
        <Link href="/services" className="font-ui text-sm font-semibold text-navy hover:underline">
          View all services →
        </Link>
      </div>
    </div>
  );
}

// ─── UTM capture ──────────────────────────────────────────────────────────────

type UtmFields = {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  referrer: string;
};

function captureUtm(): UtmFields {
  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
  return {
    utmSource: params.get("utm_source") ?? "",
    utmMedium: params.get("utm_medium") ?? "",
    utmCampaign: params.get("utm_campaign") ?? "",
    referrer: typeof document !== "undefined" ? document.referrer : "",
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QuotePage() {
  const [form, setForm] = useState<QuoteFormFields>(QUOTE_DEFAULT_FORM);
  const [errors, setErrors] = useState<QuoteFieldErrors>({});
  const [photos, setPhotos] = useState<PhotoState[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState("");
  const [startedAt, setStartedAt] = useState(0);
  const [honeypot, setHoneypot] = useState("");
  const [utm, setUtm] = useState<UtmFields>({
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    referrer: "",
  });
  const [quoteContext, setQuoteContext] = useState<QuotePrefillContext>({
    sourceType: null,
    sourcePath: "",
    projectTitle: "",
    projectSlug: "",
    serviceSlug: "",
    serviceLabel: "",
    areaSlug: "",
    location: "",
    ctaLabel: "",
  });

  useEffect(() => {
    setUtm(captureUtm());
    setStartedAt(Date.now());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const context = readQuotePrefill(new URLSearchParams(window.location.search));
    setQuoteContext(context);
    setForm((prev) => applyQuotePrefillToForm(prev, context));
  }, []);

  const uploadsEnabled = Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  );

  // ── Field setters ─────────────────────────────────────────────────────────

  function set<K extends keyof QuoteFormFields>(key: K, value: QuoteFormFields[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  // ── Photo handling ────────────────────────────────────────────────────────

  function addPhotos(files: FileList) {
    const incoming = Array.from(files);
    const remaining = MAX_PHOTOS - photos.length;
    const batch = incoming.slice(0, remaining);
    if (batch.length > 0) {
      trackEvent("quote_photo_upload", { count: batch.length });
    }

    const newStates: PhotoState[] = batch.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      status: "pending",
    }));

    setPhotos((prev) => {
      const updated = [...prev, ...newStates];
      // Start uploads immediately for each new photo
      updated.slice(prev.length).forEach((_, relIdx) => {
        const absIdx = prev.length + relIdx;
        uploadPhoto(absIdx, updated[absIdx]);
      });
      return updated;
    });
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].previewUrl);
      updated.splice(index, 1);
      return updated;
    });
  }

  function uploadPhoto(index: number, photo: PhotoState) {
    if (!uploadsEnabled) return;

    // Validate client-side
    if (!ACCEPTED_TYPES.includes(photo.file.type)) {
      setPhotos((prev) => {
        const updated = [...prev];
        if (updated[index]) {
          updated[index] = { ...updated[index], status: "error", errorMsg: "Unsupported format" };
        }
        return updated;
      });
      return;
    }

    if (photo.file.size > MAX_FILE_MB * 1024 * 1024) {
      setPhotos((prev) => {
        const updated = [...prev];
        if (updated[index]) {
          updated[index] = { ...updated[index], status: "error", errorMsg: `Max ${MAX_FILE_MB}MB` };
        }
        return updated;
      });
      return;
    }

    setPhotos((prev) => {
      const updated = [...prev];
      if (updated[index]) updated[index] = { ...updated[index], status: "uploading" };
      return updated;
    });

    uploadLeadPhoto(photo.file)
      .then((result) => {
        setPhotos((prev) => {
          const updated = [...prev];
          if (updated[index]) {
            updated[index] = { ...updated[index], status: "done", cloudUrl: result.secureUrl };
          }
          return updated;
        });
      })
      .catch(() => {
        setPhotos((prev) => {
          const updated = [...prev];
          if (updated[index]) {
            updated[index] = { ...updated[index], status: "error", errorMsg: "Upload failed" };
          }
          return updated;
        });
      });
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const fieldErrors = validateQuoteFields(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      const firstKey = Object.keys(fieldErrors)[0];
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Wait if any uploads are still in progress
    const stillUploading = photos.some((p) => p.status === "uploading");
    if (stillUploading) {
      setSubmitError("Photos are still uploading. Please wait a moment.");
      setSubmitStatus("error");
      return;
    }

    const photoUrls = photos
      .filter((p) => p.status === "done" && p.cloudUrl)
      .map((p) => p.cloudUrl as string);

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setSubmitError("");

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          service: form.service,
          location: form.location,
          timeline: form.timeline || undefined,
          budget: form.budget || undefined,
          message: form.message,
          photoUrls,
          consent: form.consent,
          utmSource: utm.utmSource || undefined,
          utmMedium: utm.utmMedium || undefined,
          utmCampaign: utm.utmCampaign || undefined,
          referrer: utm.referrer || undefined,
          sourceType: quoteContext.sourceType || undefined,
          sourcePath: quoteContext.sourcePath || undefined,
          projectTitle: quoteContext.projectTitle || undefined,
          projectSlug: quoteContext.projectSlug || undefined,
          areaSlug: quoteContext.areaSlug || undefined,
          ctaLabel: quoteContext.ctaLabel || undefined,
          honeypot: honeypot || undefined,
          startedAt,
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        ignored?: boolean;
        error?: {
          type?: string;
          message?: string;
          fieldErrors?: QuoteFieldErrors;
        };
      };

      if (!response.ok || !data.ok) {
        if (data.error?.fieldErrors) {
          setErrors(data.error.fieldErrors);
        }
        throw new Error(
          data.error?.message ?? "Unable to submit. Please try again or call us directly.",
        );
      }

      trackEvent("quote_submit", {
        service: form.service,
        utm_source: utm.utmSource || undefined,
        utm_medium: utm.utmMedium || undefined,
        utm_campaign: utm.utmCampaign || undefined,
        source_type: quoteContext.sourceType || undefined,
        project_slug: quoteContext.projectSlug || undefined,
        area_slug: quoteContext.areaSlug || undefined,
      });

      setSubmitStatus("success");
    } catch (err) {
      setSubmitStatus("error");
      setSubmitError(err instanceof Error ? err.message : "Unable to submit.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (submitStatus === "success") {
    return (
      <main className="bg-cream pt-28 pb-20">
        <div className="mx-auto max-w-2xl px-4 md:px-8">
          <SuccessState service={form.service} context={quoteContext} />
        </div>
      </main>
    );
  }

  const visibleContext = getQuoteVisibleContext(quoteContext);

  return (
    <main className="bg-cream pt-28 pb-20">
      <div className="mx-auto max-w-2xl px-4 md:px-8">
        <p className="font-ui text-sm uppercase tracking-[0.18em] text-red">Start with a Quote</p>
        <h1 className="mt-3 text-4xl text-charcoal md:text-5xl">Tell Us About Your Project</h1>
        <p className="mt-4 text-gray-mid">
          Share the basics, add photos if you have them, and we will follow up with the right next
          step for pricing, scheduling, or an on-site visit.
        </p>
        <p className="mt-2 text-sm text-gray-mid">Most homeowners hear back within one business day.</p>
        {hasVisibleQuoteContext(quoteContext) ? (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="font-ui text-[10px] uppercase tracking-[0.18em] text-red">Context</p>
            <p className="mt-2 text-sm text-charcoal">{visibleContext.summary}</p>
            {visibleContext.detail ? (
              <p className="mt-1 text-sm text-gray-mid">{visibleContext.detail}</p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-8 space-y-6">
          <QuoteTrustSection />
          <WhatHappensNext />
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-8">
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="sr-only"
            aria-hidden="true"
          />
          <input type="hidden" value={startedAt} readOnly />

          {/* ── Section 1: Contact info ────────────────────────────────── */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <SectionLabel>Contact Info</SectionLabel>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div id="field-name">
                <label className="block text-sm font-medium text-charcoal">
                  Full Name <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className={inputClass(!!errors.name)}
                  placeholder="Jane Smith"
                />
                <FieldError msg={errors.name} />
              </div>

              <div id="field-email">
                <label className="block text-sm font-medium text-charcoal">
                  Email <span className="text-red">*</span>
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className={inputClass(!!errors.email)}
                  placeholder="jane@example.com"
                />
                <FieldError msg={errors.email} />
              </div>

              <div id="field-phone" className="sm:col-span-2">
                <label className="block text-sm font-medium text-charcoal">
                  Phone <span className="text-red">*</span>
                </label>
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", sanitizePhone(e.target.value))}
                  className={inputClass(!!errors.phone)}
                  placeholder="(702) 555-0100"
                />
                <FieldError msg={errors.phone} />
              </div>
            </div>
          </div>

          {/* ── Section 2: Project details ─────────────────────────────── */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <SectionLabel>Project Details</SectionLabel>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div id="field-service">
                <label className="block text-sm font-medium text-charcoal">
                  Service <span className="text-red">*</span>
                </label>
                <select
                  required
                  value={form.service}
                  onChange={(e) => {
                    set("service", e.target.value);
                    if (e.target.value) {
                      trackEvent("quote_service_select", { service: e.target.value });
                    }
                  }}
                  className={inputClass(!!errors.service)}
                >
                  <option value="">Select a service…</option>
                  {SERVICE_OPTIONS.map((opt) => (
                    <option key={opt.slug} value={opt.slug}>
                      {opt.label}
                    </option>
                  ))}
                  <option value="other">Other / Not sure</option>
                </select>
                <FieldError msg={errors.service} />
              </div>

              <div id="field-location">
                <label className="block text-sm font-medium text-charcoal">
                  Neighborhood / City <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  className={inputClass(!!errors.location)}
                  placeholder="Henderson, NV"
                />
                <FieldError msg={errors.location} />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal">Timeline</label>
                <select
                  value={form.timeline}
                  onChange={(e) => set("timeline", e.target.value)}
                  className={inputClass(false)}
                >
                  {TIMELINE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal">Budget Range</label>
                <select
                  value={form.budget}
                  onChange={(e) => set("budget", e.target.value)}
                  className={inputClass(false)}
                >
                  {BUDGET_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div id="field-message" className="sm:col-span-2">
                <label className="block text-sm font-medium text-charcoal">
                  Project Description <span className="text-red">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  className={inputClass(!!errors.message)}
                  placeholder="Describe the room, scope, and any dimensions or details you have. The more context, the better."
                />
                <div className="mt-1 flex items-center justify-between text-xs text-gray-mid">
                  <span>Helpful details: room, style, dimensions, and timing.</span>
                  <span>{form.message.length}/2000</span>
                </div>
                <FieldError msg={errors.message} />
              </div>
            </div>
          </div>

          {/* ── Section 3: Photos ─────────────────────────────────────── */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <PhotoUploadSection
              photos={photos}
              onAdd={addPhotos}
              onRemove={removePhoto}
              uploadsEnabled={uploadsEnabled}
            />
            {!uploadsEnabled ? (
              <p className="mt-3 text-xs text-gray-mid">
                Photo upload is not configured. You can email photos directly after submitting.
              </p>
            ) : null}
          </div>

          {/* ── Consent + Submit ──────────────────────────────────────── */}
          <div className="space-y-4">
            <div id="field-consent">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={(e) => set("consent", e.target.checked)}
                  className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-gray-300 accent-red"
                />
                <span className="text-sm text-charcoal">
                  I agree to be contacted by Sublime Design NV about this quote request.{" "}
                  <span className="text-red">*</span>
                </span>
              </label>
              <FieldError msg={errors.consent} />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="font-ui w-full rounded-sm bg-red px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60 sm:w-auto"
            >
              {isSubmitting ? "Sending…" : "Start with a Quote"}
            </button>
            <p className="text-xs text-gray-mid">
              Your details are only used to follow up about this quote request.
            </p>

            {submitStatus === "error" ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            ) : null}
          </div>
        </form>

        <p className="mt-8 text-sm text-gray-mid">
          Prefer to call?{" "}
          <a href="tel:+17028479016" className="font-semibold text-red">
            (702) 847-9016
          </a>{" "}
          · Or go back to{" "}
          <Link href="/" className="font-semibold text-red">
            home
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
