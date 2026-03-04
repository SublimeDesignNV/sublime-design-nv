"use client";

import { CldImage } from "next-cloudinary";

export default function CloudinaryImage({
  src,
  alt
}: {
  src: string;
  alt: string;
}) {
  return (
    <CldImage
      src={src}
      alt={alt}
      width="1200"
      height="800"
      sizes="100vw"
      crop="fill"
      gravity="auto"
      quality="auto"
      format="auto"
    />
  );
}
