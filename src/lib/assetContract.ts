import type { AssetKind } from "@prisma/client";
import { findProject } from "@/content/projects";

export type AssetTagLike = {
  slug: string;
  title: string;
  tagType: "SERVICE" | "CONTEXT";
};

export type AssetDiagnosis =
  | "missing_public_id"
  | "missing_image_url"
  | "cloudinary_url_mismatch"
  | "unlinked_to_project"
  | "unpublished"
  | "renderable";

export type CanonicalAssetFields = {
  slug: string | null;
  publicId: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  resourceType: "image" | "video";
  format: string | null;
  width: number | null;
  height: number | null;
  projectId: string | null;
  projectSlug: string | null;
  projectTitle: string | null;
  renderable: boolean;
  diagnosis: AssetDiagnosis;
};

const PROJECTS_PREFIX = "Sublime/Projects/";

function encodePublicId(publicId: string) {
  return publicId
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function getCloudinaryCloudName() {
  return (
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ??
    process.env.CLOUDINARY_CLOUD_NAME ??
    null
  );
}

function getSecureUrlBase(secureUrl: string | null | undefined) {
  if (!secureUrl) return null;

  try {
    const url = new URL(secureUrl);
    if (url.hostname !== "res.cloudinary.com") return null;
    // Path is /<cloudName>/<resourceType>/upload/... — extract the cloud name
    const cloudName = url.pathname.split("/")[1];
    if (!cloudName) return null;
    return `${url.protocol}//${url.hostname}/${cloudName}`;
  } catch {
    return null;
  }
}

function getCloudinaryBaseUrl(secureUrl?: string | null) {
  const secureUrlBase = getSecureUrlBase(secureUrl);
  if (secureUrlBase) return secureUrlBase;

  const cloudName = getCloudinaryCloudName();
  return cloudName ? `https://res.cloudinary.com/${cloudName}` : null;
}

function buildCloudinaryUrlFromPublicId(
  publicId: string,
  resourceType: "image" | "video",
  secureUrl?: string | null,
  transformations?: string,
) {
  const base = getCloudinaryBaseUrl(secureUrl);
  if (!base) return null;

  const encodedPublicId = encodePublicId(publicId);
  const transformationSegment = transformations ? `${transformations}/` : "";
  return `${base}/${resourceType}/upload/${transformationSegment}${encodedPublicId}`;
}

export function inferProjectSlugFromPublicId(publicId?: string | null) {
  if (!publicId || !publicId.startsWith(PROJECTS_PREFIX)) return null;

  const rest = publicId.slice(PROJECTS_PREFIX.length);
  const [projectSlug] = rest.split("/");
  return projectSlug?.trim() || null;
}

export function isAllowedCloudinaryRemoteUrl(url?: string | null) {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

export function diagnoseAssetContract(input: {
  published: boolean;
  publicId: string | null;
  imageUrl: string | null;
  projectSlug: string | null;
  requireProjectLink?: boolean;
}) {
  if (!input.published) return "unpublished" satisfies AssetDiagnosis;
  if (!input.publicId) return "missing_public_id" satisfies AssetDiagnosis;
  if (!input.imageUrl) return "missing_image_url" satisfies AssetDiagnosis;
  if (!isAllowedCloudinaryRemoteUrl(input.imageUrl)) {
    return "cloudinary_url_mismatch" satisfies AssetDiagnosis;
  }
  if (input.requireProjectLink && !input.projectSlug) {
    return "unlinked_to_project" satisfies AssetDiagnosis;
  }
  return "renderable" satisfies AssetDiagnosis;
}

export function buildCanonicalAssetFields(input: {
  kind: AssetKind | "IMAGE" | "VIDEO";
  publicId?: string | null;
  secureUrl?: string | null;
  format?: string | null;
  width?: number | null;
  height?: number | null;
  published: boolean;
  requireProjectLink?: boolean;
  projectId?: string | null;
  projectSlug?: string | null;
  projectTitle?: string | null;
}) {
  const resourceType = input.kind === "VIDEO" ? "video" : "image";
  const publicId = input.publicId?.trim() || null;
  const inferredProjectSlug = inferProjectSlugFromPublicId(publicId);
  const projectSlug = input.projectSlug ?? inferredProjectSlug;
  const imageUrl =
    input.secureUrl?.trim() ||
    (publicId
      ? buildCloudinaryUrlFromPublicId(publicId, resourceType, input.secureUrl)
      : null);
  const thumbnailUrl =
    resourceType === "image" && publicId
      ? buildCloudinaryUrlFromPublicId(
          publicId,
          resourceType,
          input.secureUrl,
          "f_auto,q_auto,w_640,c_fill,g_auto",
        )
      : imageUrl;
  const project = projectSlug ? findProject(projectSlug) : null;
  const diagnosis = diagnoseAssetContract({
    published: input.published,
    publicId,
    imageUrl,
    projectSlug,
    requireProjectLink: input.requireProjectLink,
  });

  return {
    slug: null,
    publicId,
    imageUrl,
    thumbnailUrl,
    resourceType,
    format: input.format ?? null,
    width: input.width ?? null,
    height: input.height ?? null,
    projectId: input.projectId ?? null,
    projectSlug,
    projectTitle: input.projectTitle ?? project?.title ?? null,
    renderable: diagnosis === "renderable",
    diagnosis,
  } satisfies CanonicalAssetFields;
}

export function getAssetTagBuckets(tags: AssetTagLike[]) {
  const serviceTags = tags.filter((tag) => tag.tagType === "SERVICE");
  const contextTags = tags.filter((tag) => tag.tagType === "CONTEXT");

  return {
    serviceTags,
    contextTags,
    contextSlugs: contextTags.map((tag) => tag.slug),
  };
}
