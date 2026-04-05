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

function getUploadConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Missing NEXT_PUBLIC_CLOUDINARY upload environment variables.");
  }

  return { cloudName, uploadPreset };
}

async function uploadToCloudinary(
  file: File,
  folder: string,
): Promise<CloudinaryUploadResult> {
  const { cloudName, uploadPreset } = getUploadConfig();
  const resourceType = file.type.startsWith("video/") ? "video" : "image";
  const kind = resourceType === "video" ? "VIDEO" : "IMAGE";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

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

export async function uploadFileToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  return uploadToCloudinary(file, "Sublime/Portfolio");
}

export async function uploadFileToCloudinaryWithProgress(
  file: File,
  onProgress: (percent: number) => void,
): Promise<CloudinaryUploadResult> {
  const { cloudName, uploadPreset } = getUploadConfig();
  const resourceType = file.type.startsWith("video/") ? "video" : "image";
  const kind = resourceType === "video" ? "VIDEO" : "IMAGE";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "Sublime/Portfolio");

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
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return uploadToCloudinary(file, `Sublime/Leads/${yyyy}/${mm}`);
}
