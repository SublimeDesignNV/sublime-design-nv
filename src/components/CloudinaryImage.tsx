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
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  style?: CSSProperties;
}) {
  return (
    <CldImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      crop="fill"
      gravity="auto"
      quality="auto"
      format="auto"
      style={style}
    />
  );
}
