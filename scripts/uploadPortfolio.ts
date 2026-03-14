/**
 * Portfolio Upload Script
 *
 * Usage: npm run portfolio:upload
 *
 * Scans content/portfolio/<service-slug>/ directories, uploads images to
 * Cloudinary under Sublime/Portfolio/<service-slug>/, applies service tags,
 * and marks the first image in each service as featured.
 *
 * Skips images already uploaded (matched by public_id).
 */

import * as fs from "fs";
import * as path from "path";
import { v2 as cloudinary } from "cloudinary";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const PORTFOLIO_ROOT = path.join(__dirname, "../content/portfolio");
const CLOUDINARY_FOLDER = "Sublime/Portfolio";
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

cloudinary.config({
  cloud_name: requireEnv("CLOUDINARY_CLOUD_NAME"),
  api_key: requireEnv("CLOUDINARY_API_KEY"),
  api_secret: requireEnv("CLOUDINARY_API_SECRET"),
});

function isImageFile(filename: string): boolean {
  return IMAGE_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

function toPublicId(serviceSlug: string, filename: string): string {
  const base = path.basename(filename, path.extname(filename));
  return `${CLOUDINARY_FOLDER}/${serviceSlug}/${base}`;
}

async function assetExists(publicId: string): Promise<boolean> {
  try {
    await cloudinary.api.resource(publicId, { resource_type: "image" });
    return true;
  } catch {
    return false;
  }
}

async function uploadImage(
  filePath: string,
  publicId: string,
  tags: string[],
): Promise<void> {
  await cloudinary.uploader.upload(filePath, {
    public_id: publicId,
    resource_type: "image",
    overwrite: false,
    tags,
  });
}

async function processService(serviceSlug: string): Promise<void> {
  const serviceDir = path.join(PORTFOLIO_ROOT, serviceSlug);

  const files = fs
    .readdirSync(serviceDir)
    .filter(isImageFile)
    .sort();

  if (!files.length) {
    console.log(`  [${serviceSlug}] No images found, skipping.`);
    return;
  }

  console.log(`\n[${serviceSlug}] Found ${files.length} image(s)`);

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = path.join(serviceDir, filename);
    const publicId = toPublicId(serviceSlug, filename);
    const isFirst = i === 0;

    const tags = [`service:${serviceSlug}`];
    if (isFirst) tags.push("featured");

    const exists = await assetExists(publicId);
    if (exists) {
      console.log(`  SKIP  ${filename} (already uploaded)`);
      continue;
    }

    try {
      await uploadImage(filePath, publicId, tags);
      const tagList = tags.join(", ");
      console.log(`  UP    ${filename} → ${publicId} [${tagList}]`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ERR   ${filename}: ${msg}`);
    }
  }
}

async function main(): Promise<void> {
  if (!fs.existsSync(PORTFOLIO_ROOT)) {
    console.error(`Portfolio directory not found: ${PORTFOLIO_ROOT}`);
    process.exit(1);
  }

  const serviceDirs = fs
    .readdirSync(PORTFOLIO_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  if (!serviceDirs.length) {
    console.log("No service directories found in content/portfolio/");
    return;
  }

  console.log(`Portfolio upload starting — ${serviceDirs.length} service(s) found`);

  for (const slug of serviceDirs) {
    await processService(slug);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Upload failed:", err);
  process.exit(1);
});
