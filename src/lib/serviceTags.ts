import type { TagType } from "@prisma/client";
import { CONTEXTS, type ContextSlug } from "@/content/contexts";
import { CANONICAL_SERVICE_SLUGS, SERVICES } from "@/content/services";

export type AssetTagDef = {
  slug: string;
  label: string;
  title: string;
  tagType: TagType;
};

export const SERVICE_TAGS = SERVICES.map((service) => ({
  slug: service.slug,
  label: service.label,
  title: service.label,
  tagType: "SERVICE" as const,
}));

export const CONTEXT_TAGS = CONTEXTS.map((context) => ({
  slug: context.slug,
  label: context.label,
  title: context.label,
  group: context.group,
  tagType: "CONTEXT" as const,
}));

export type ServiceTagSlug = (typeof CANONICAL_SERVICE_SLUGS)[number];

export function getServiceTagBySlug(slug: string) {
  return SERVICE_TAGS.find((tag) => tag.slug === slug);
}

export function getContextTagBySlug(slug: string) {
  return CONTEXT_TAGS.find((tag) => tag.slug === slug);
}

export function isServiceTagSlug(slug: string): slug is ServiceTagSlug {
  return CANONICAL_SERVICE_SLUGS.includes(slug as ServiceTagSlug);
}

export function isContextTagSlug(slug: string): slug is ContextSlug {
  return CONTEXT_TAGS.some((tag) => tag.slug === slug);
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

export function normalizeContextTagSlugs(values: Iterable<string> | undefined | null) {
  return Array.from(
    new Set(
      Array.from(values ?? [])
        .map((tag) => tag.trim())
        .filter((tag): tag is ContextSlug => isContextTagSlug(tag)),
    ),
  );
}

export function buildAssetTagDefinitions(input: {
  serviceSlugs?: Iterable<string> | null;
  contextSlugs?: Iterable<string> | null;
}) {
  const serviceTags = normalizeServiceTagSlugs(input.serviceSlugs).map((slug) => {
    const tag = getServiceTagBySlug(slug);
    if (!tag) {
      throw new Error(`Invalid service tag slug: ${slug}`);
    }
    return tag;
  });

  const contextTags = normalizeContextTagSlugs(input.contextSlugs).map((slug) => {
    const tag = getContextTagBySlug(slug);
    if (!tag) {
      throw new Error(`Invalid context tag slug: ${slug}`);
    }
    return tag;
  });

  return [...serviceTags, ...contextTags] satisfies AssetTagDef[];
}
