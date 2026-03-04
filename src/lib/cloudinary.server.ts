import "server-only";
import { v2 as cloudinary } from "cloudinary";

function required(name: string, value: string | undefined) {
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

cloudinary.config({
  cloud_name: required("CLOUDINARY_CLOUD_NAME", process.env.CLOUDINARY_CLOUD_NAME),
  api_key: required("CLOUDINARY_API_KEY", process.env.CLOUDINARY_API_KEY),
  api_secret: required("CLOUDINARY_API_SECRET", process.env.CLOUDINARY_API_SECRET),
});

export const PROJECTS_ROOT_FOLDER = "Sublime/Projects";

export type ProjectContext = {
  project_name?: string;
  project_slug?: string;
  service?: string;
  city?: string;
  state?: string;
  material?: string;
  finish?: string;
  room?: string;
  style?: string;
  year?: string;
  featured?: string;
  caption?: string;
  alt?: string;
  gps_lat?: string;
  gps_lng?: string;
};

export type CloudinaryAsset = {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  format?: string;
  created_at?: string;
  context?: ProjectContext;
  tags?: string[];
};

export type ProjectGallery = {
  slug: string;
  name: string;
  caption?: string;
  featured: boolean;
  service?: string;
  city?: string;
  state?: string;
  year?: string;
  images: CloudinaryAsset[];
};

type CloudinarySearchResource = {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  format?: string;
  created_at?: string;
  tags?: string[];
  context?: {
    custom?: ProjectContext;
  };
};

function getSlugFromPublicId(publicId: string) {
  const prefix = `${PROJECTS_ROOT_FOLDER}/`;
  if (!publicId.startsWith(prefix)) return null;
  const rest = publicId.slice(prefix.length);
  const [slug] = rest.split("/");
  return slug || null;
}

function mapResource(resource: CloudinarySearchResource): CloudinaryAsset {
  return {
    public_id: resource.public_id,
    secure_url: resource.secure_url,
    width: resource.width,
    height: resource.height,
    format: resource.format,
    created_at: resource.created_at,
    context: resource.context?.custom,
    tags: resource.tags ?? [],
  };
}

function normalizeProjectName(slug: string, image: CloudinaryAsset) {
  if (image.context?.project_name?.trim()) {
    return image.context.project_name.trim();
  }

  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isFeatured(value: string | undefined) {
  if (!value) return false;
  return value.toLowerCase() === "true";
}

async function searchByExpression(expression: string, maxResults = 500) {
  try {
    const result = await cloudinary.search
      .expression(expression)
      .sort_by("created_at", "desc")
      .max_results(maxResults)
      .execute();

    return (result?.resources ?? []) as CloudinarySearchResource[];
  } catch (error) {
    const details = error instanceof Error ? error.message : "unknown error";
    throw new Error(`Cloudinary query failed for expression "${expression}": ${details}`);
  }
}

export async function listAssetsByFolder(
  folder: string,
  maxResults = 60,
): Promise<CloudinaryAsset[]> {
  const resources = await searchByExpression(`folder:${folder}`, maxResults);
  return resources.map(mapResource);
}

export async function listAssetsByPublicIdPrefix(
  folderPrefix: string,
  maxResults = 200,
): Promise<CloudinaryAsset[]> {
  const resources = await searchByExpression(`public_id:${folderPrefix}/*`, maxResults);
  return resources.map(mapResource);
}

export async function listAssetsByFolders(folders: string[], maxPerFolder = 60) {
  const entries = await Promise.all(
    folders.map(async (folder) => {
      const assets = await listAssetsByFolder(folder, maxPerFolder);
      return [folder, assets] as const;
    }),
  );

  return Object.fromEntries(entries);
}

export async function listProjectAssets(maxResults = 500): Promise<CloudinaryAsset[]> {
  const resources = await searchByExpression(`folder:${PROJECTS_ROOT_FOLDER}/*`, maxResults);
  return resources.map(mapResource);
}

export async function listProjects(maxResults = 500): Promise<ProjectGallery[]> {
  const assets = await listProjectAssets(maxResults);
  const grouped = new Map<string, CloudinaryAsset[]>();

  for (const asset of assets) {
    const slug = asset.context?.project_slug || getSlugFromPublicId(asset.public_id);
    if (!slug) continue;

    const current = grouped.get(slug) ?? [];
    current.push(asset);
    grouped.set(slug, current);
  }

  const projects = Array.from(grouped.entries()).map(([slug, images]) => {
    images.sort((a, b) => {
      const aTime = a.created_at ? Date.parse(a.created_at) : 0;
      const bTime = b.created_at ? Date.parse(b.created_at) : 0;
      return bTime - aTime;
    });

    const first = images[0];
    return {
      slug,
      name: normalizeProjectName(slug, first),
      caption: first.context?.caption,
      featured: isFeatured(first.context?.featured),
      service: first.context?.service,
      city: first.context?.city,
      state: first.context?.state,
      year: first.context?.year,
      images,
    } satisfies ProjectGallery;
  });

  projects.sort((a, b) => {
    if (a.featured !== b.featured) {
      return a.featured ? -1 : 1;
    }

    const aTime = a.images[0]?.created_at ? Date.parse(a.images[0].created_at as string) : 0;
    const bTime = b.images[0]?.created_at ? Date.parse(b.images[0].created_at as string) : 0;
    return bTime - aTime;
  });

  return projects;
}

export async function getProjectBySlug(slug: string, maxResults = 200) {
  const assetsInFolder = await listAssetsByFolder(
    `${PROJECTS_ROOT_FOLDER}/${slug}`,
    maxResults,
  );
  const assets = assetsInFolder.filter((asset) => asset.context?.project_slug === slug);
  if (!assets.length) return null;

  assets.sort((a, b) => {
    const aTime = a.created_at ? Date.parse(a.created_at) : 0;
    const bTime = b.created_at ? Date.parse(b.created_at) : 0;
    return bTime - aTime;
  });

  const first = assets[0];
  const project: ProjectGallery = {
    slug,
    name: normalizeProjectName(slug, first),
    caption: first.context?.caption,
    featured: isFeatured(first.context?.featured),
    service: first.context?.service,
    city: first.context?.city,
    state: first.context?.state,
    year: first.context?.year,
    images: assets,
  };

  return project;
}

function normalizeContextForCloudinary(context: Record<string, string>) {
  const pairs = Object.entries(context)
    .map(([key, value]) => [key.trim(), value.trim()] as const)
    .filter(([key, value]) => key.length > 0 && value.length > 0)
    .map(([key, value]) => `${key}=${value.replace(/[|=]/g, " ")}`);

  return pairs.join("|");
}

export async function updateAssetContext(publicId: string, context: Record<string, string>) {
  const contextString = normalizeContextForCloudinary(context);
  if (!contextString) return;

  try {
    await cloudinary.api.update(publicId, {
      resource_type: "image",
      type: "upload",
      context: contextString,
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : "unknown error";
    throw new Error(`Failed to update context for "${publicId}": ${details}`);
  }
}

export async function addAssetTags(publicId: string, tags: string[]) {
  const cleanTags = Array.from(
    new Set(
      tags
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => tag.replace(/,/g, "-")),
    ),
  );

  if (!cleanTags.length) return;

  try {
    const resource = (await cloudinary.api.resource(publicId, {
      resource_type: "image",
      type: "upload",
      tags: true,
    })) as { tags?: string[] };

    const mergedTags = Array.from(new Set([...(resource.tags ?? []), ...cleanTags]));

    await cloudinary.api.update(publicId, {
      resource_type: "image",
      type: "upload",
      tags: mergedTags,
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : "unknown error";
    throw new Error(`Failed to add tags for "${publicId}": ${details}`);
  }
}
