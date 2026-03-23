"use client";

import type { CSSProperties } from "react";
import { CldImage } from "next-cloudinary";

export default function CloudinaryImage({
  src,
  alt,
  width = 1200,
  height = 800,
  sizes = "100vw",
  style,
  className,
  crop = "fill",
  gravity,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  style?: CSSProperties;
  className?: string;
  crop?: "fill" | "pad";
  gravity?: "auto" | "auto:subject";
}) {
  return (
    <CldImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      crop={crop}
      {...(gravity ? { gravity } : {})}
      quality="auto"
      format="auto"
      className={className}
      style={style}
    />
  );
}
