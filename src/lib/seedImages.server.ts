import "server-only";
import fs from "fs";
import path from "path";

const SEED_ROOT = path.join(process.cwd(), "public", "seed-images");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

function isImageFile(filename: string) {
  return IMAGE_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

export type SeedImage = {
  /** Publicly served path — usable directly in next/image src */
  src: string;
  alt: string;
};

function listSeedFiles(serviceSlug: string): string[] {
  const dir = path.join(SEED_ROOT, serviceSlug);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(isImageFile).sort();
}

/** All seed images for a service, sorted alphabetically. */
export function getSeedImages(serviceSlug: string): SeedImage[] {
  return listSeedFiles(serviceSlug).map((filename) => ({
    src: `/seed-images/${serviceSlug}/${filename}`,
    alt: `Custom ${serviceSlug.replace(/-/g, " ")} in Las Vegas`,
  }));
}

/** First seed image for a service, or null if none exist. */
export function getSeedPreviewAsset(serviceSlug: string): SeedImage | null {
  return getSeedImages(serviceSlug)[0] ?? null;
}

/** Number of seed images available for a service. */
export function getSeedImageCount(serviceSlug: string): number {
  return listSeedFiles(serviceSlug).length;
}

/**
 * Find the first seed image across an ordered list of service slugs.
 * Used for hero fallback — prefers floating-shelves, then built-ins.
 */
export function getFirstSeedAssetFromServices(slugs: string[]): SeedImage | null {
  for (const slug of slugs) {
    const preview = getSeedPreviewAsset(slug);
    if (preview) return preview;
  }
  return null;
}

/** Count seed images across all service folders. */
export function getAllSeedCounts(): Record<string, number> {
  if (!fs.existsSync(SEED_ROOT)) return {};
  return Object.fromEntries(
    fs
      .readdirSync(SEED_ROOT, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => [e.name, getSeedImageCount(e.name)]),
  );
}
