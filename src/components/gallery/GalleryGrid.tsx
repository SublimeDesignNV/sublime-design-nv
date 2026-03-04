"use client";

import type { MouseEvent } from "react";
import CloudinaryImage from "@/components/CloudinaryImage";

export function GalleryGrid({
  items,
  onItemClick,
}: {
  items: { public_id: string; alt: string }[];
  onItemClick?: (
    publicId: string,
    href: string,
    event: MouseEvent<HTMLAnchorElement>,
  ) => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 16,
      }}
    >
      {items.map((it) => (
        <a
          key={it.public_id}
          href={`/gallery?image=${encodeURIComponent(it.public_id)}`}
          style={{ borderRadius: 16, overflow: "hidden", display: "block" }}
          aria-label={`View ${it.alt}`}
          onClick={(event) =>
            onItemClick?.(
              it.public_id,
              `/gallery?image=${encodeURIComponent(it.public_id)}`,
              event,
            )
          }
        >
          <CloudinaryImage src={it.public_id} alt={it.alt} />
        </a>
      ))}
    </div>
  );
}
