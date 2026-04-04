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
  const cloudinary = getCloudinary();
  const folder = `Sublime/IntakeLeads/${leadId}`;

  const result = await new Promise<CloudinaryUploadApiResult>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        tags: [`intake-lead:${leadId}`],
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload failed"));
        resolve(result as CloudinaryUploadApiResult);
      },
    );
    uploadStream.end(fileBuffer);
  });

  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}
