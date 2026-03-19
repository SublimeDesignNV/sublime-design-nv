export const SERVICE_TAGS = [
  { slug: "barn-doors", label: "Barn Doors", title: "Barn Doors" },
  { slug: "cabinets", label: "Cabinets", title: "Cabinets" },
  { slug: "closets", label: "Closets", title: "Closets" },
  { slug: "faux-beams", label: "Faux Beams", title: "Faux Beams" },
  { slug: "floating-shelves", label: "Floating Shelves", title: "Floating Shelves" },
  { slug: "mantels", label: "Mantels", title: "Mantels" },
  { slug: "trim-work", label: "Trim Work", title: "Trim Work" },
] as const;

export type ServiceTag = (typeof SERVICE_TAGS)[number];
export type ServiceTagSlug = ServiceTag["slug"];

const SERVICE_TAG_MAP = new Map(SERVICE_TAGS.map((tag) => [tag.slug, tag]));

export function getServiceTagBySlug(slug: string) {
  return SERVICE_TAG_MAP.get(slug as ServiceTagSlug) || null;
}

export function isServiceTagSlug(slug: string): slug is ServiceTagSlug {
  return SERVICE_TAG_MAP.has(slug as ServiceTagSlug);
}

export function normalizeServiceTagSlugs(tagSlugs: unknown) {
  if (!Array.isArray(tagSlugs)) return [];

  return Array.from(
    new Set(
      tagSlugs
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );
}
