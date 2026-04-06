export type CloudinaryUploadResult = {
  kind: "IMAGE" | "VIDEO";
  publicId: string;
  imageUrl: string;
  secureUrl: string;
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
  bytes?: number;
};

type CloudinaryUploadApiResponse = {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
  bytes?: number;
};

// Maps service slug → Cloudinary folder name
const SERVICE_FOLDER_MAP: Record<string, string> = {
  "barn-doors": "BarnDoors",
  "media-walls": "MediaWalls",
  "faux-beams": "FauxBeams",
  "floating-shelves": "FloatingShelves",
  mantels: "Mantels",
  cabinets: "Cabinets",
  trim: "TrimWork",
  "feature-wall": "FeatureWalls",
  "led-lighting": "LEDLighting",
};

function toFolderName(serviceSlug: string): string {
  return SERVICE_FOLDER_MAP[serviceSlug] ?? "Gallery";
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildPublicId(params: {
  serviceType: string;
  location: string;
  descriptor: string;
  isVideo: boolean;
}): string {
  const folder = params.isVideo
    ? "Sublime/Videos"
    : `Sublime/${toFolderName(params.serviceType)}`;

  const slug = [
    toSlug(params.serviceType),
    toSlug(params.descriptor),
    toSlug(params.location),
    "las-vegas",
  ]
    .filter(Boolean)
    .join("-")
    .replace(/-+/g, "-");

  return `${folder}/${slug}`;
}

function getUploadConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Missing NEXT_PUBLIC_CLOUDINARY upload environment variables.");
  }

  return { cloudName, uploadPreset };
}

export async function uploadFileToCloudinaryWithProgress(
  file: File,
  onProgress: (percent: number) => void,
  options?: { publicId?: string },
): Promise<CloudinaryUploadResult> {
  const { cloudName, uploadPreset } = getUploadConfig();
  const isVideo = file.type.startsWith("video/");
  const resourceType = isVideo ? "video" : "image";
  const kind = isVideo ? "VIDEO" : "IMAGE";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  if (options?.publicId) {
    // When publicId is provided, it encodes the full folder path — don't set folder separately
    formData.append("public_id", options.publicId);
  } else {
    formData.append("folder", "Sublime/Portfolio");
  }

  // Video optimization: request mp4 transcode at auto quality
  if (isVideo) {
    formData.append("eager", "vc_auto,q_auto/mp4");
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 90));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as CloudinaryUploadApiResponse;
          onProgress(100);
          resolve({
            kind,
            publicId: data.public_id,
            imageUrl: data.secure_url,
            secureUrl: data.secure_url,
            width: data.width,
            height: data.height,
            duration: data.duration,
            format: data.format,
            bytes: data.bytes,
          });
        } catch {
          reject(new Error("Failed to parse Cloudinary response."));
        }
      } else {
        reject(new Error(`Cloudinary upload failed (${xhr.status}): ${xhr.responseText}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error during upload.")));
    xhr.send(formData);
  });
}

/**
 * Upload a lead/quote photo to the dedicated leads folder.
 * Path: Sublime/Leads/<yyyy>/<mm>
 */
export async function uploadLeadPhoto(file: File): Promise<CloudinaryUploadResult> {
  const { cloudName, uploadPreset } = getUploadConfig();
  const resourceType = file.type.startsWith("video/") ? "video" : "image";
  const kind = resourceType === "video" ? "VIDEO" : "IMAGE";
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", `Sublime/Leads/${yyyy}/${mm}`);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: "POST", body: formData },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudinary upload failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as CloudinaryUploadApiResponse;

  return {
    kind,
    publicId: data.public_id,
    imageUrl: data.secure_url,
    secureUrl: data.secure_url,
    width: data.width,
    height: data.height,
    duration: data.duration,
    format: data.format,
    bytes: data.bytes,
  };
}
