import { CANONICAL_SERVICE_SLUGS, SERVICES } from "@/content/services";

export const SERVICE_TAGS = SERVICES.map((service) => ({
  slug: service.slug,
  label: service.label,
  title: service.label,
}));

export type ServiceTagSlug = (typeof CANONICAL_SERVICE_SLUGS)[number];

export function getServiceTagBySlug(slug: string) {
  return SERVICE_TAGS.find((tag) => tag.slug === slug);
}

export function isServiceTagSlug(slug: string): slug is ServiceTagSlug {
  return CANONICAL_SERVICE_SLUGS.includes(slug as ServiceTagSlug);
}

export function normalizeServiceTagSlugs(values: Iterable<string> | undefined | null) {
  return Array.from(
    new Set(
      Array.from(values ?? [])
        .map((tag) => tag.trim())
        .filter((tag): tag is ServiceTagSlug => isServiceTagSlug(tag)),
    ),
  );
}
