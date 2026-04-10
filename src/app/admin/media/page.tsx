"use client";

import { useState, useEffect, useCallback } from "react";
import { Film, Image as ImageIcon, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";

type SiteMedia = {
  id: string;
  key: string;
  url: string;
  publicId: string;
  mediaType: string;
  alt: string | null;
};

type UploadResult = {
  secure_url: string;
  public_id: string;
  resource_type: string;
};

function StatusBadge({ status, message }: { status: "idle" | "saving" | "success" | "error"; message?: string }) {
  if (status === "idle") return null;
  if (status === "saving") return <span className="font-ui text-xs text-gray-500">Saving…</span>;
  if (status === "success")
    return (
      <span className="flex items-center gap-1 font-ui text-xs text-green-600">
        <CheckCircle className="h-3 w-3" /> Saved
      </span>
    );
  return (
    <span className="flex items-center gap-1 font-ui text-xs text-red-600">
      <AlertCircle className="h-3 w-3" /> {message ?? "Error"}
    </span>
  );
}

export default function AdminMediaPage() {
  const [heroMedia, setHeroMedia] = useState<SiteMedia | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState<string>();
  const [tab, setTab] = useState<"hero" | "portfolio">("hero");

  const loadHeroMedia = useCallback(async () => {
    const res = await fetch("/api/admin/media/hero_video");
    if (res.ok) setHeroMedia(await res.json());
  }, []);

  useEffect(() => {
    loadHeroMedia();
  }, [loadHeroMedia]);

  function openUploadWidget() {
    const widget = (window as unknown as { cloudinary: { createUploadWidget: (opts: Record<string, unknown>, cb: (err: unknown, result: { event: string; info: UploadResult }) => void) => { open: () => void } } }).cloudinary.createUploadWidget(
      {
        cloudName: "dueaqxh8s",
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        resourceType: "video",
        clientAllowedFormats: ["mp4", "mov", "webm"],
        maxFileSize: 200000000,
        folder: "Sublime/Hero",
        sources: ["local", "url"],
      },
      async (err: unknown, result: { event: string; info: UploadResult }) => {
        if (err) return;
        if (result.event === "success") {
          const info = result.info;
          const videoUrl = `https://res.cloudinary.com/dueaqxh8s/video/upload/f_mp4,q_auto,vc_h264/${info.public_id}.mp4`;

          setSaveStatus("saving");
          const res = await fetch("/api/admin/media/hero_video", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: videoUrl,
              publicId: info.public_id,
              mediaType: "video",
              alt: "Sublime Design NV hero video",
            }),
          });

          if (res.ok) {
            const updated = await res.json();
            setHeroMedia(updated);
            setSaveStatus("success");
            setTimeout(() => setSaveStatus("idle"), 3000);
          } else {
            setSaveStatus("error");
            setSaveMessage("Failed to save media record");
          }
        }
      }
    );
    widget.open();
  }

  const posterUrl = heroMedia?.publicId
    ? `https://res.cloudinary.com/dueaqxh8s/video/upload/f_jpg,q_auto,so_0/${heroMedia.publicId}.jpg`
    : null;

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Media Manager</h1>
        <p className="mt-1 font-ui text-sm text-gray-500">Manage hero video and portfolio assets</p>
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
            {t === "hero" ? "Hero Video" : "Portfolio"}
          </button>
        ))}
      </div>

      {tab === "hero" && (
        <div className="max-w-2xl">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="h-5 w-5 text-gray-400" />
                <h2 className="font-ui text-sm font-semibold text-gray-900">Hero Video</h2>
              </div>
              <StatusBadge status={saveStatus} message={saveMessage} />
            </div>

            {/* Preview */}
            {heroMedia ? (
              <div className="mt-4 overflow-hidden rounded-lg bg-gray-100">
                {posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={posterUrl}
                    alt="Hero video preview"
                    className="w-full object-cover"
                    style={{ aspectRatio: "16/9" }}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center bg-gray-200"
                    style={{ aspectRatio: "16/9" }}
                  >
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
            ) : (
              <div
                className="mt-4 flex items-center justify-center rounded-lg bg-gray-100"
                style={{ aspectRatio: "16/9" }}
              >
                <p className="font-ui text-xs text-gray-400">No hero video set</p>
              </div>
            )}

            {/* Current URL */}
            {heroMedia && (
              <div className="mt-3">
                <p className="font-ui text-xs text-gray-500">Current video</p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="flex-1 truncate rounded bg-gray-50 px-2 py-1.5 font-mono text-xs text-gray-600">
                    {heroMedia.publicId}
                  </p>
                  <a
                    href={heroMedia.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}

            <button
              onClick={openUploadWidget}
              className="mt-5 w-full rounded-lg border-2 border-dashed border-gray-300 py-4 font-ui text-sm font-medium text-gray-600 transition-colors hover:border-red hover:text-red"
            >
              Upload New Hero Video
            </button>

            <p className="mt-2 font-ui text-xs text-gray-400">
              Accepts MP4, MOV, WebM. Max 200 MB. Replaces the current hero on save.
            </p>
          </div>
        </div>
      )}

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
