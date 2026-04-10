"use client";

import { useState, useEffect, useCallback } from "react";
import { Image as ImageIcon } from "lucide-react";

interface HeroSlide {
  id: string;
  url: string;
  publicId: string;
  mediaType: string;
  alt: string | null;
  order: number;
  active: boolean;
}

type CloudinaryUploadInfo = {
  secure_url: string;
  public_id: string;
  resource_type: string;
};

type CloudinaryResult = {
  event: string;
  info: CloudinaryUploadInfo;
};

type CloudinaryWidget = { open: () => void };

type CloudinaryGlobal = {
  createUploadWidget: (
    opts: Record<string, unknown>,
    cb: (err: unknown, result: CloudinaryResult) => void
  ) => CloudinaryWidget;
};

function HeroTab() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [uploading, setUploading] = useState(false);
  const [mediaType, setMediaType] = useState<"video" | "image">("video");

  useEffect(() => {
    fetch("/api/admin/hero-slides")
      .then((r) => r.json())
      .then(setSlides)
      .catch(console.error);
  }, []);

  const openUploader = useCallback(() => {
    const cld = (window as unknown as { cloudinary: CloudinaryGlobal }).cloudinary;
    const widget = cld.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        folder: "Sublime/Hero",
        maxFiles: 1,
        resourceType: mediaType,
        sources: ["local", "url"],
        styles: {
          palette: {
            window: "#1B2A6B",
            windowBorder: "#CC2027",
            tabIcon: "#FFFFFF",
            textDark: "#000000",
            textLight: "#FFFFFF",
            link: "#CC2027",
            action: "#CC2027",
            inactiveTabIcon: "#8E9FBF",
            error: "#F44235",
            inProgress: "#CC2027",
            complete: "#20B832",
            sourceBg: "#13233A",
          },
        },
      },
      async (err: unknown, result: CloudinaryResult) => {
        if (err || result.event !== "success") return;
        setUploading(true);
        const { secure_url, public_id, resource_type } = result.info;
        const deliveryUrl =
          resource_type === "video"
            ? secure_url.replace("/upload/", "/upload/f_mp4,q_auto,vc_h264/")
            : secure_url.replace("/upload/", "/upload/f_auto,q_auto/");

        const res = await fetch("/api/admin/hero-slides", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: deliveryUrl,
            publicId: public_id,
            mediaType: resource_type,
          }),
        });
        const newSlide = await res.json() as HeroSlide;
        setSlides((prev) => [...prev, newSlide]);
        setUploading(false);
      }
    );
    widget.open();
  }, [mediaType]);

  const toggleActive = async (slide: HeroSlide) => {
    const updated = await fetch(`/api/admin/hero-slides/${slide.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !slide.active }),
    }).then((r) => r.json()) as HeroSlide;
    setSlides((prev) => prev.map((s) => (s.id === slide.id ? updated : s)));
  };

  const deleteSlide = async (id: string) => {
    if (!confirm("Delete this slide?")) return;
    await fetch(`/api/admin/hero-slides/${id}`, { method: "DELETE" });
    setSlides((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            {/* Preview */}
            <div className="relative h-40 w-full bg-gray-900">
              {slide.mediaType === "video" ? (
                <video
                  src={slide.url}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slide.url}
                  alt={slide.alt ?? ""}
                  className="h-full w-full object-cover"
                />
              )}
              <div className="absolute left-2 top-2 rounded bg-black/60 px-2 py-1 font-ui text-xs text-white">
                #{i + 1} {slide.mediaType}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-2 p-3">
              <button
                onClick={() => toggleActive(slide)}
                className="rounded-full px-3 py-1 font-ui text-xs font-medium"
                style={{
                  backgroundColor: slide.active ? "#dcfce7" : "#f3f4f6",
                  color: slide.active ? "#166534" : "#6b7280",
                }}
              >
                {slide.active ? "Active" : "Hidden"}
              </button>
              <button
                onClick={() => deleteSlide(slide.id)}
                className="rounded-full bg-red-50 px-3 py-1 font-ui text-xs font-medium text-red-600 hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {/* Add new slide card */}
        <div className="overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-white">
          <div className="flex h-full flex-col justify-center gap-3 p-4">
            <div className="flex gap-2">
              {(["video", "image"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setMediaType(t)}
                  className="flex-1 rounded border py-1 font-ui text-xs font-medium capitalize"
                  style={{
                    backgroundColor: mediaType === t ? "#CC2027" : "white",
                    color: mediaType === t ? "white" : "#374151",
                    borderColor: mediaType === t ? "#CC2027" : "#d1d5db",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              onClick={openUploader}
              disabled={uploading}
              className="w-full rounded-lg py-2 font-ui text-sm font-medium text-white"
              style={{ backgroundColor: uploading ? "#9ca3af" : "#1B2A6B" }}
            >
              {uploading ? "Uploading…" : "+ Add Slide"}
            </button>
          </div>
        </div>
      </div>

      <p className="font-ui text-xs text-gray-400">
        Slides cycle every 8 seconds on the homepage. Toggle active/hidden to control which
        appear. Videos play through once then advance to the next slide.
      </p>
    </div>
  );
}

export default function AdminMediaPage() {
  const [tab, setTab] = useState<"hero" | "portfolio">("hero");

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Media Manager</h1>
        <p className="mt-1 font-ui text-sm text-gray-500">
          Manage hero slides and portfolio assets
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-gray-200">
        {(["hero", "portfolio"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 font-ui text-sm font-medium transition-colors ${
              tab === t
                ? "border-b-2 border-red text-red"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "hero" ? "Hero Slides" : "Portfolio"}
          </button>
        ))}
      </div>

      {tab === "hero" && <HeroTab />}

      {tab === "portfolio" && (
        <div className="max-w-2xl">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-gray-400" />
              <h2 className="font-ui text-sm font-semibold text-gray-900">Portfolio Assets</h2>
            </div>
            <p className="mt-3 font-ui text-sm text-gray-500">
              Manage portfolio photos from the dedicated section.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="/admin/uploads"
                className="font-ui rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Upload Photos
              </a>
              <a
                href="/admin/photos/unlinked"
                className="font-ui rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Unlinked Photos
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
