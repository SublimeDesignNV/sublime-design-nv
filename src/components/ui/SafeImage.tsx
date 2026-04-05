"use client";

import { useEffect, useState } from "react";

type SafeImageProps = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
};

export default function SafeImage({
  src,
  alt,
  className = "",
  imgClassName = "",
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed || !src) {
    return <div aria-hidden className={`bg-gray-warm ${className}`} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`${className} ${imgClassName}`.trim()}
      onError={() => setFailed(true)}
    />
  );
}
