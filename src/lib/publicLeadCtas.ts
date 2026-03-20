import { findService } from "@/content/services";

export type LeadSourceType =
  | "homepage-hero"
  | "homepage-spotlight"
  | "homepage-card"
  | "project-page"
  | "projects-card"
  | "gallery-card"
  | "area-card"
  | "service-page"
  | "service-card"
  | "direct-quote";

export type LeadQuoteContext = {
  sourceType: LeadSourceType;
  sourcePath?: string | null;
  projectTitle?: string | null;
  projectSlug?: string | null;
  serviceSlug?: string | null;
  areaSlug?: string | null;
  location?: string | null;
  ctaLabel?: string | null;
};

export type QuotePrefillContext = {
  sourceType: LeadSourceType | null;
  sourcePath: string;
  projectTitle: string;
  projectSlug: string;
  serviceSlug: string;
  serviceLabel: string;
  areaSlug: string;
  location: string;
  ctaLabel: string;
};

const SLUG_RE = /^[a-z0-9-]{1,80}$/;
const PATH_RE = /^\/[a-z0-9\-/_?=&]*$/i;

function sanitizeSlug(value?: string | null) {
  const normalized = value?.trim().toLowerCase() ?? "";
  return SLUG_RE.test(normalized) ? normalized : "";
}

function sanitizeShortText(value?: string | null, maxLength = 120) {
  const normalized = value?.replace(/\s+/g, " ").trim() ?? "";
  if (!normalized) return "";
  return normalized.slice(0, maxLength);
}

function sanitizePath(value?: string | null) {
  const normalized = value?.trim() ?? "";
  return PATH_RE.test(normalized) ? normalized.slice(0, 200) : "";
}

function sanitizeSourceType(value?: string | null): LeadSourceType | null {
  const normalized = value?.trim() ?? "";
  return (
    [
      "homepage-hero",
      "homepage-spotlight",
      "homepage-card",
      "project-page",
      "projects-card",
      "gallery-card",
      "area-card",
      "service-page",
      "service-card",
      "direct-quote",
    ] as const
  ).includes(normalized as LeadSourceType)
    ? (normalized as LeadSourceType)
    : null;
}

export function buildQuoteHref(context: LeadQuoteContext) {
  const params = new URLSearchParams();
  const sourceType = sanitizeSourceType(context.sourceType);
  const sourcePath = sanitizePath(context.sourcePath);
  const projectTitle = sanitizeShortText(context.projectTitle, 120);
  const projectSlug = sanitizeSlug(context.projectSlug);
  const serviceSlug = sanitizeSlug(context.serviceSlug);
  const areaSlug = sanitizeSlug(context.areaSlug);
  const location = sanitizeShortText(context.location, 120);
  const ctaLabel = sanitizeShortText(context.ctaLabel, 60);

  if (sourceType) params.set("sourceType", sourceType);
  if (sourcePath) params.set("sourcePath", sourcePath);
  if (projectTitle) params.set("projectTitle", projectTitle);
  if (projectSlug) params.set("projectSlug", projectSlug);
  if (serviceSlug) params.set("service", serviceSlug);
  if (areaSlug) params.set("area", areaSlug);
  if (location) params.set("location", location);
  if (ctaLabel) params.set("ctaLabel", ctaLabel);

  const query = params.toString();
  return query ? `/quote?${query}` : "/quote";
}

export function readQuotePrefill(searchParams: URLSearchParams): QuotePrefillContext {
  const serviceSlug = sanitizeSlug(searchParams.get("service"));

  return {
    sourceType: sanitizeSourceType(searchParams.get("sourceType")),
    sourcePath: sanitizePath(searchParams.get("sourcePath")),
    projectTitle: sanitizeShortText(searchParams.get("projectTitle"), 120),
    projectSlug: sanitizeSlug(searchParams.get("projectSlug")),
    serviceSlug,
    serviceLabel: serviceSlug ? (findService(serviceSlug)?.shortTitle ?? "") : "",
    areaSlug: sanitizeSlug(searchParams.get("area")),
    location: sanitizeShortText(searchParams.get("location"), 120),
    ctaLabel: sanitizeShortText(searchParams.get("ctaLabel"), 60),
  };
}
