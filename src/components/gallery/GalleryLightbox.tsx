"use client";

import { useEffect, useMemo, useState } from "react";
import CloudinaryImage from "@/components/CloudinaryImage";

type LightboxItem = {
  public_id: string;
  alt: string;
  sectionTitle: string;
};

function updateGalleryUrl(publicId: string | null) {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  if (publicId) {
    url.searchParams.set("image", publicId);
  } else {
    url.searchParams.delete("image");
  }
  window.history.pushState({}, "", `${url.pathname}${url.search}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function GalleryLightbox({
  isOpen,
  onClose,
  items,
  activePublicId,
}: {
  isOpen: boolean;
  onClose(): void;
  items: LightboxItem[];
  activePublicId: string | null;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const activeIndex = useMemo(() => {
    if (!activePublicId) return -1;
    return items.findIndex((item) => item.public_id === activePublicId);
  }, [activePublicId, items]);

  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth < 768);
    }

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || activeIndex < 0) {
    return null;
  }

  const activeItem = items[activeIndex];

  function goTo(index: number) {
    const target = items[(index + items.length) % items.length];
    updateGalleryUrl(target.public_id);
  }

  function onPrev() {
    goTo(activeIndex - 1);
  }

  function onNext() {
    goTo(activeIndex + 1);
  }

  function handleClose() {
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={activeItem.alt}
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0, 0, 0, 0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <button
        type="button"
        onClick={handleClose}
        aria-label="Close"
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          border: 0,
          background: "rgba(255, 255, 255, 0.18)",
          color: "#fff",
          borderRadius: 999,
          width: 40,
          height: 40,
          fontSize: 20,
          cursor: "pointer",
        }}
      >
        ×
      </button>

      {!isMobile && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onPrev();
          }}
          aria-label="Previous image"
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            border: 0,
            background: "rgba(255, 255, 255, 0.18)",
            color: "#fff",
            borderRadius: 999,
            width: 44,
            height: 44,
            fontSize: 24,
            cursor: "pointer",
          }}
        >
          ‹
        </button>
      )}

      <div
        onClick={(event) => event.stopPropagation()}
        style={{ width: "min(1200px, 100%)" }}
      >
        <CloudinaryImage
          src={activeItem.public_id}
          alt={activeItem.alt}
          width={1600}
          height={1000}
          sizes="100vw"
          style={{
            width: "100%",
            height: "auto",
            maxHeight: "80vh",
            objectFit: "contain",
            borderRadius: 12,
          }}
        />
        <div
          style={{
            marginTop: 12,
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span>{activeItem.sectionTitle}</span>
          <span>
            {activeIndex + 1} / {items.length}
          </span>
        </div>
      </div>

      {!isMobile && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNext();
          }}
          aria-label="Next image"
          style={{
            position: "absolute",
            right: 16,
            top: "50%",
            transform: "translateY(-50%)",
            border: 0,
            background: "rgba(255, 255, 255, 0.18)",
            color: "#fff",
            borderRadius: 999,
            width: 44,
            height: 44,
            fontSize: 24,
            cursor: "pointer",
          }}
        >
          ›
        </button>
      )}

      {isMobile && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPrev();
            }}
            aria-label="Previous image"
            style={{
              border: 0,
              background: "rgba(255, 255, 255, 0.18)",
              color: "#fff",
              borderRadius: 8,
              padding: "10px 14px",
              cursor: "pointer",
            }}
          >
            Prev
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onNext();
            }}
            aria-label="Next image"
            style={{
              border: 0,
              background: "rgba(255, 255, 255, 0.18)",
              color: "#fff",
              borderRadius: 8,
              padding: "10px 14px",
              cursor: "pointer",
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
