import { ACTIVE_SERVICES } from "@/content/services";
import type { QuotePrefillContext } from "@/lib/publicLeadCtas";

export const TIMELINE_OPTIONS = [
  { value: "", label: "No preference" },
  { value: "asap", label: "As soon as possible" },
  { value: "1-month", label: "Within a month" },
  { value: "1-3-months", label: "1–3 months" },
  { value: "3-plus-months", label: "3+ months out" },
] as const;

export const BUDGET_OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "under-2k", label: "Under $2,000" },
  { value: "2k-5k", label: "$2,000 – $5,000" },
  { value: "5k-10k", label: "$5,000 – $10,000" },
  { value: "over-10k", label: "Over $10,000" },
] as const;

export type QuoteFormFields = {
  name: string;
  email: string;
  phone: string;
  service: string;
  location: string;
  timeline: string;
  budget: string;
  message: string;
  consent: boolean;
};

export type QuoteFieldName = keyof QuoteFormFields;
export type QuoteFieldErrors = Partial<Record<QuoteFieldName, string>>;

export type QuoteRequestPayload = QuoteFormFields & {
  photoUrls: string[];
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
  sourceType?: string;
  sourcePath?: string;
  projectTitle?: string;
  projectSlug?: string;
  areaSlug?: string;
  ctaLabel?: string;
  honeypot?: string;
  startedAt?: number;
};

export type QuoteValidatedPayload = {
  fields: QuoteFormFields;
  photoUrls: string[];
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
  sourceType?: string;
  sourcePath?: string;
  projectTitle?: string;
  projectSlug?: string;
  areaSlug?: string;
  ctaLabel?: string;
  startedAt?: number;
  honeypot?: string;
};

const ACTIVE_SERVICE_SLUGS = new Set(ACTIVE_SERVICES.map((service) => service.slug));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9()+.\-\s]{7,25}$/;
const SLUG_RE = /^[a-z0-9-]{1,80}$/;
const PATH_RE = /^\/[a-z0-9\-/_?=&]*$/i;
const MIN_SUBMIT_MS = 1500;
const MAX_LOCATION_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_NAME_LENGTH = 120;

export const QUOTE_DEFAULT_FORM: QuoteFormFields = {
  name: "",
  email: "",
  phone: "",
  service: "",
  location: "",
  timeline: "",
  budget: "",
  message: "",
  consent: false,
};

function sanitizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function sanitizeShortText(value: unknown, maxLength = 120) {
  if (typeof value !== "string") return "";
  return sanitizeWhitespace(value).slice(0, maxLength);
}

export function sanitizePhone(value: unknown) {
  if (typeof value !== "string") return "";
  const sanitized = value.replace(/[^\d()+.\-\s]/g, "");
  return sanitizeWhitespace(sanitized).slice(0, 25);
}

export function sanitizeSlug(value: unknown) {
  if (typeof value !== "string") return "";
  const normalized = value.trim().toLowerCase();
  return SLUG_RE.test(normalized) ? normalized : "";
}

export function sanitizePath(value: unknown) {
  if (typeof value !== "string") return "";
  const normalized = value.trim();
  return PATH_RE.test(normalized) ? normalized.slice(0, 200) : "";
}

function sanitizeBoolean(value: unknown) {
  return value === true;
}

function sanitizePhotoUrls(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
}

export function isValidEmail(value: string) {
  return EMAIL_RE.test(value);
}

export function isValidPhone(value: string) {
  return PHONE_RE.test(value);
}

export function isValidService(value: string) {
  return ACTIVE_SERVICE_SLUGS.has(value) || value === "other";
}

export function isValidTimeline(value: string) {
  return TIMELINE_OPTIONS.some((option) => option.value === value);
}

export function isValidBudget(value: string) {
  return BUDGET_OPTIONS.some((option) => option.value === value);
}

export function validateQuoteFields(fields: QuoteFormFields): QuoteFieldErrors {
  const errors: QuoteFieldErrors = {};

  if (!fields.name) errors.name = "Name is required.";
  else if (fields.name.length < 2) errors.name = "Enter your full name.";

  if (!fields.email) errors.email = "Email is required.";
  else if (!isValidEmail(fields.email)) errors.email = "Enter a valid email address.";

  if (!fields.phone) errors.phone = "Phone is required.";
  else if (!isValidPhone(fields.phone)) errors.phone = "Enter a valid phone number.";

  if (!fields.service) errors.service = "Please select a service.";
  else if (!isValidService(fields.service)) errors.service = "Please select a valid service.";

  if (!fields.location) errors.location = "Location is required.";
  else if (fields.location.length < 2) errors.location = "Enter your city, neighborhood, or area.";

  if (!fields.message) errors.message = "Please describe your project.";
  else if (fields.message.length < 20) errors.message = "Add a little more detail so we can quote accurately.";
  else if (fields.message.length > MAX_MESSAGE_LENGTH)
    errors.message = `Keep the message under ${MAX_MESSAGE_LENGTH} characters.`;

  if (!fields.consent) errors.consent = "Please confirm you agree to be contacted.";

  return errors;
}

export function normalizeQuoteRequestPayload(payload: unknown): QuoteValidatedPayload {
  const body = typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>) : {};

  const fields: QuoteFormFields = {
    name: sanitizeShortText(body.name, MAX_NAME_LENGTH),
    email: sanitizeShortText(body.email, 160).toLowerCase(),
    phone: sanitizePhone(body.phone),
    service: sanitizeSlug(body.service),
    location: sanitizeShortText(body.location, MAX_LOCATION_LENGTH),
    timeline: sanitizeShortText(body.timeline, 40),
    budget: sanitizeShortText(body.budget, 40),
    message: sanitizeShortText(body.message, MAX_MESSAGE_LENGTH),
    consent: sanitizeBoolean(body.consent),
  };

  return {
    fields,
    photoUrls: sanitizePhotoUrls(body.photoUrls),
    utmSource: sanitizeShortText(body.utmSource, 80) || undefined,
    utmMedium: sanitizeShortText(body.utmMedium, 80) || undefined,
    utmCampaign: sanitizeShortText(body.utmCampaign, 120) || undefined,
    referrer: sanitizeShortText(body.referrer, 200) || undefined,
    sourceType: sanitizeShortText(body.sourceType, 40) || undefined,
    sourcePath: sanitizePath(body.sourcePath) || undefined,
    projectTitle: sanitizeShortText(body.projectTitle, 120) || undefined,
    projectSlug: sanitizeSlug(body.projectSlug) || undefined,
    areaSlug: sanitizeSlug(body.areaSlug) || undefined,
    ctaLabel: sanitizeShortText(body.ctaLabel, 60) || undefined,
    honeypot: sanitizeShortText(body.honeypot, 120) || undefined,
    startedAt: typeof body.startedAt === "number" && Number.isFinite(body.startedAt) ? body.startedAt : undefined,
  };
}

export function getQuoteSpamSignals(payload: QuoteValidatedPayload) {
  const submittedTooFast =
    typeof payload.startedAt === "number" &&
    payload.startedAt > 0 &&
    Date.now() - payload.startedAt < MIN_SUBMIT_MS;

  return {
    honeypotTriggered: Boolean(payload.honeypot),
    submittedTooFast,
  };
}

export function getQuoteContextSummary(context: QuotePrefillContext) {
  if (context.projectTitle) return `You’re asking about ${context.projectTitle}.`;
  if (context.serviceLabel) return `Interested in ${context.serviceLabel}.`;
  return "";
}

export function getQuoteVisibleContext(context: QuotePrefillContext) {
  return {
    summary: getQuoteContextSummary(context),
    detail:
      context.location && context.sourcePath
        ? `Location context: ${context.location}. Started from ${context.sourcePath}.`
        : context.location
          ? `Location context: ${context.location}.`
          : context.sourcePath
            ? `Started from ${context.sourcePath}.`
            : "",
  };
}

export function applyQuotePrefillToForm(
  form: QuoteFormFields,
  context: QuotePrefillContext,
): QuoteFormFields {
  return {
    ...form,
    service: !form.service && context.serviceSlug && isValidService(context.serviceSlug) ? context.serviceSlug : form.service,
    location: !form.location && context.location ? context.location : form.location,
  };
}

export function hasVisibleQuoteContext(context: QuotePrefillContext) {
  const visible = getQuoteVisibleContext(context);
  return Boolean(visible.summary || visible.detail);
}

export function buildQuoteSubject(fields: Pick<QuoteFormFields, "name" | "service" | "location">, sourceType?: string, projectTitle?: string) {
  const serviceLabel =
    fields.service === "other"
      ? "General Inquiry"
      : ACTIVE_SERVICES.find((service) => service.slug === fields.service)?.shortTitle ?? "Quote Request";

  const parts = ["Quote Request"];
  if (projectTitle) parts.push(projectTitle);
  else parts.push(serviceLabel);
  if (fields.name) parts.push(fields.name.split(" ")[0]);
  if (fields.location) parts.push(fields.location);
  else if (sourceType === "project-page") parts.push("Project Page Inquiry");
  return parts.join(" — ");
}
