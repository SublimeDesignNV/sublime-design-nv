import Image from "next/image";
import CloudinaryImage from "@/components/CloudinaryImage";

export type SitePhotoMode = "card" | "gallery" | "hero";

type SitePhotoProps = {
  publicId?: string | null;
  imageUrl?: string | null;
  alt: string;
  sizes: string;
  mode: SitePhotoMode;
  className?: string;
};

function getModeConfig(mode: SitePhotoMode) {
  switch (mode) {
    case "hero":
      return {
        crop: "pad" as const,
        gravity: undefined,
        className: "h-full w-full object-contain",
      };
    case "gallery":
      return {
        crop: "pad" as const,
        gravity: undefined,
        className: "h-full w-full object-contain",
      };
    case "card":
    default:
      return {
        crop: "fill" as const,
        gravity: "auto:subject" as const,
        className: "h-full w-full object-cover",
      };
  }
}

export default function SitePhoto({
  publicId,
  imageUrl,
  alt,
  sizes,
  mode,
  className,
}: SitePhotoProps) {
  const config = getModeConfig(mode);
  const mergedClassName = [config.className, className].filter(Boolean).join(" ");

  if (publicId) {
    return (
      <CloudinaryImage
        src={publicId}
        alt={alt}
        width={1600}
        height={1200}
        sizes={sizes}
        crop={config.crop}
        gravity={config.gravity}
        className={mergedClassName}
      />
    );
  }

  if (!imageUrl) return null;

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill
      sizes={sizes}
      className={mergedClassName}
    />
  );
}
