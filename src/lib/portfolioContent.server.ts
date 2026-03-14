import "server-only";
import fs from "fs";
import path from "path";

const PORTFOLIO_ROOT = path.join(process.cwd(), "content", "portfolio");

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

export type PortfolioImage = {
  src: string;
  featured: boolean;
};

/**
 * Optional per-image metadata that can live alongside an image
 * as a <filename>.json sidecar file. Enables future project-story
 * support without restructuring the folder layout.
 */
export type PortfolioImageMeta = {
  projectTitle?: string;
  location?: string;
  summary?: string;
  materials?: string[];
  timeline?: string;
};

export type PortfolioServiceEntry = {
  service: string;
  images: PortfolioImage[];
};

function isImageFile(filename: string) {
  return IMAGE_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

/**
 * Read optional sidecar JSON metadata for an image file.
 * File must be named identically to the image but with a .json extension.
 * Returns null if no sidecar exists or the file is malformed.
 */
export function readImageMeta(serviceSlug: string, imageFilename: string): PortfolioImageMeta | null {
  const base = path.basename(imageFilename, path.extname(imageFilename));
  const sidecarPath = path.join(PORTFOLIO_ROOT, serviceSlug, `${base}.json`);
  if (!fs.existsSync(sidecarPath)) return null;
  try {
    const raw = fs.readFileSync(sidecarPath, "utf-8");
    return JSON.parse(raw) as PortfolioImageMeta;
  } catch {
    return null;
  }
}

export function getPortfolioContent(): PortfolioServiceEntry[] {
  if (!fs.existsSync(PORTFOLIO_ROOT)) return [];

  const serviceDirs = fs
    .readdirSync(PORTFOLIO_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  return serviceDirs.flatMap((serviceSlug) => {
    const serviceDir = path.join(PORTFOLIO_ROOT, serviceSlug);
    const files = fs
      .readdirSync(serviceDir)
      .filter(isImageFile)
      .sort();

    if (!files.length) return [];

    const images: PortfolioImage[] = files.map((file, index) => ({
      src: `/content/portfolio/${serviceSlug}/${file}`,
      featured: index === 0,
    }));

    return [{ service: serviceSlug, images }];
  });
}

export function getPortfolioByService(serviceSlug: string): PortfolioServiceEntry | null {
  const all = getPortfolioContent();
  return all.find((entry) => entry.service === serviceSlug) ?? null;
}

/** Count images in the repo folder for a given service slug. */
export function getRepoImageCount(serviceSlug: string): number {
  const dir = path.join(PORTFOLIO_ROOT, serviceSlug);
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter(isImageFile).length;
}

/** Count images across all service folders in the repo. */
export function getAllRepoCounts(): Record<string, number> {
  if (!fs.existsSync(PORTFOLIO_ROOT)) return {};

  const dirs = fs
    .readdirSync(PORTFOLIO_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  return Object.fromEntries(dirs.map((slug) => [slug, getRepoImageCount(slug)]));
}
