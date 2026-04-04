import { getCloudinary } from "@/lib/cloudinary";

export type LeadAssetUploadResult = {
  publicId: string;
  secureUrl: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
};

type CloudinaryUploadApiResult = {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
};

/**
 * Upload a lead intake asset to Cloudinary server-side (signed).
 * Files go to: Sublime/IntakeLeads/<leadId>/
 */
export async function uploadLeadAssetToCloudinary(
  fileBuffer: Buffer,
  leadId: string,
  resourceType: "image" | "video" = "image",
): Promise<LeadAssetUploadResult> {
  let cloudinary;
  try {
    cloudinary = getCloudinary();
  } catch (err) {
    console.error("[uploadLeadAsset] getCloudinary() failed — check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET env vars:", err);
    throw err;
  }

  const folder = `Sublime/IntakeLeads/${leadId}`;
  console.log("[uploadLeadAsset] uploading to folder:", folder, "resourceType:", resourceType, "bufferSize:", fileBuffer.length);

  const result = await new Promise<CloudinaryUploadApiResult>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        tags: [`intake-lead:${leadId}`],
      },
      (error, result) => {
        if (error || !result) {
          console.error("[uploadLeadAsset] Cloudinary upload_stream callback error:", error);
          return reject(error ?? new Error("Upload failed — no result returned"));
        }
        resolve(result as CloudinaryUploadApiResult);
      },
    );
    uploadStream.end(fileBuffer);
  });

  console.log("[uploadLeadAsset] upload complete, publicId:", result.public_id);

  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}
