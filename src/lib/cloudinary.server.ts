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

export type CloudinaryAsset = {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  format?: string;
  created_at?: string;
};

type CloudinarySearchResource = {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  format?: string;
  created_at?: string;
};

export async function listAssetsByFolder(
  folder: string,
  maxResults = 60,
): Promise<CloudinaryAsset[]> {
  // Cloudinary "folder" in Admin API is the prefix for public_id
  const res = await cloudinary.search
    .expression(`folder:${folder}`)
    .sort_by("created_at", "desc")
    .max_results(maxResults)
    .execute();

  const resources = (res?.resources ?? []) as CloudinarySearchResource[];
  return resources.map((r) => ({
    public_id: r.public_id,
    secure_url: r.secure_url,
    width: r.width,
    height: r.height,
    format: r.format,
    created_at: r.created_at,
  }));
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
