"use client";

import type { MouseEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";

type GallerySectionClient = {
  title: string;
  slug: string;
  items: { public_id: string; alt: string }[];
};

function getImageParam(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("image");
}

function setImageParam(publicId: string | null) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);

  if (publicId) {
    url.searchParams.set("image", publicId);
  } else {
    url.searchParams.delete("image");
  }

  window.history.pushState({}, "", `${url.pathname}${url.search}`);
}

export default function GalleryClient({ sections }: { sections: GallerySectionClient[] }) {
  const [activePublicId, setActivePublicId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const allItems = useMemo(
    () =>
      sections.flatMap((section) =>
        section.items.map((item) => ({
          public_id: item.public_id,
          alt: item.alt,
          sectionTitle: section.title,
        })),
      ),
    [sections],
  );

  useEffect(() => {
    const initialImage = getImageParam();
    if (initialImage && allItems.some((item) => item.public_id === initialImage)) {
      setActivePublicId(initialImage);
      setIsOpen(true);
    }

    function onPopState() {
      const image = getImageParam();
      if (image && allItems.some((item) => item.public_id === image)) {
        setActivePublicId(image);
        setIsOpen(true);
        return;
      }

      setActivePublicId(null);
      setIsOpen(false);
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [allItems]);

  function handleItemClick(
    publicId: string,
    href: string,
    event: MouseEvent<HTMLAnchorElement>,
  ) {
    event.preventDefault();
    window.history.pushState({}, "", href);
    setActivePublicId(publicId);
    setIsOpen(true);
  }

  function handleClose() {
    setImageParam(null);
    setIsOpen(false);
    setActivePublicId(null);
  }

  return (
    <>
      {sections.map((section) => (
        <section key={section.slug} style={{ marginBottom: 48 }}>
          <h2 style={{ margin: "0 0 16px 0" }}>{section.title}</h2>
          <GalleryGrid items={section.items} onItemClick={handleItemClick} />
        </section>
      ))}

      <GalleryLightbox
        isOpen={isOpen}
        onClose={handleClose}
        items={allItems}
        activePublicId={activePublicId}
      />
    </>
  );
}
