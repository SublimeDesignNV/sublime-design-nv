export type CloudinaryUploadResult = {
  kind: "IMAGE" | "VIDEO";
  publicId: string;
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

export async function uploadFileToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  const { cloudName, uploadPreset } = getUploadConfig();
  const resourceType = file.type.startsWith("video/") ? "video" : "image";
  const kind = resourceType === "video" ? "VIDEO" : "IMAGE";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "sublime-design-nv");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudinary upload failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as CloudinaryUploadApiResponse;

  return {
    kind,
    publicId: data.public_id,
    secureUrl: data.secure_url,
    width: data.width,
    height: data.height,
    duration: data.duration,
    format: data.format,
    bytes: data.bytes,
  };
}
