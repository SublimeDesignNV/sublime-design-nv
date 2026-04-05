"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import ServiceMetadataFields from "@/components/admin/ServiceMetadataFields";
import { uploadFileToCloudinaryWithProgress } from "@/lib/cloudinaryUpload";
import { CONTEXT_TAGS, SERVICE_TAGS } from "@/lib/serviceTags";

type UploadStatus = {
  name: string;
  state: "pending" | "uploading" | "saving" | "success" | "error";
  progress: number;
  message?: string;
};

type FilePreview = {
  name: string;
  previewUrl: string;
  size: number;
  isVideo: boolean;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function AssetUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchSectionRef = useRef<HTMLDivElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [primaryService, setPrimaryService] = useState("");
  const [secondaryServices, setSecondaryServices] = useState<string[]>([]);
  const [showSecondary, setShowSecondary] = useState(false);
  const [contextSlugs, setContextSlugs] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationPreset, setLocationPreset] = useState("");
  const [locationOther, setLocationOther] = useState("");
  const location = locationPreset === "Other" ? locationOther : locationPreset;
  const [serviceMetadata, setServiceMetadata] = useState<Record<string, unknown>>({});
  const [published, setPublished] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statuses, setStatuses] = useState<UploadStatus[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [lastCompletedBatch, setLastCompletedBatch] = useState<{
    uploadBatchId: string;
    assetIds: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Change 3 — pre-select last used service from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lastUsedServiceType");
      if (saved) setPrimaryService(saved);
      const detailsSaved = localStorage.getItem("upload_details_open");
      if (detailsSaved === "true") setDetailsOpen(true);
    } catch {
      // ignore
    }
  }, []);

  // Cleanup preview object URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach((p) => { if (p.previewUrl) URL.revokeObjectURL(p.previewUrl); });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canUpload =
    files.length > 0 && Boolean(primaryService) && Boolean(title.trim()) && !isUploading;

  function buildPreviews(selected: File[]): FilePreview[] {
    return selected.map((f) => ({
      name: f.name,
      previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : "",
      size: f.size,
      isVideo: f.type.startsWith("video/"),
    }));
  }

  function handleFileSelection(selected: File[]) {
    previews.forEach((p) => { if (p.previewUrl) URL.revokeObjectURL(p.previewUrl); });
    setFiles(selected);
    setPreviews(buildPreviews(selected));
  }

  function updateStatus(name: string, next: Partial<UploadStatus>) {
    setStatuses((current) =>
      current.map((item) => (item.name === name ? { ...item, ...next } : item)),
    );
  }

  // Change 3 — save last used service to localStorage
  function handleServiceChange(nextService: string) {
    setPrimaryService(nextService);
    setSecondaryServices((current) => current.filter((slug) => slug !== nextService));
    setServiceMetadata({});
    try { localStorage.setItem("lastUsedServiceType", nextService); } catch {}
  }

  function updateMetadataField(key: string, value: string | number | boolean) {
    setServiceMetadata((current) => ({ ...current, [key]: value }));
  }

  function toggleSecondaryService(slug: string) {
    setSecondaryServices((current) =>
      current.includes(slug)
        ? current.filter((currentSlug) => currentSlug !== slug)
        : [...current, slug],
    );
  }

  function toggleContext(slug: string) {
    setContextSlugs((current) =>
      current.includes(slug)
        ? current.filter((currentSlug) => currentSlug !== slug)
        : [...current, slug],
    );
  }

  // Change 2 — toggle details with localStorage persistence
  function toggleDetails() {
    setDetailsOpen((prev) => {
      const next = !prev;
      try { localStorage.setItem("upload_details_open", String(next)); } catch {}
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!canUpload) return;

    setIsUploading(true);
    setStatuses(
      files.map((file) => ({
        name: file.name,
        state: "pending",
        progress: 0,
      })),
    );

    const uploadBatchId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`;
    const createdAssetIds: string[] = [];

    for (const file of files) {
      try {
        updateStatus(file.name, { state: "uploading", progress: 0 });

        // Change 5 — progress callback
        const uploadResult = await uploadFileToCloudinaryWithProgress(file, (percent) => {
          updateStatus(file.name, { progress: percent });
        });

        updateStatus(file.name, { state: "saving", progress: 95 });
        const tagSlugs = [primaryService, ...secondaryServices].filter(Boolean);
        const saveResponse = await fetch("/api/admin/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...uploadResult,
            uploadBatchId,
            title: title.trim(),
            description: description.trim() || undefined,
            location: location.trim() || undefined,
            primaryServiceSlug: primaryService,
            serviceMetadata,
            published,
            tagSlugs,
            contextSlugs,
          }),
        });

        const saveBody = (await saveResponse.json().catch(() => ({}))) as {
          error?: string;
          asset?: { id?: string };
        };

        if (!saveResponse.ok) {
          throw new Error(saveBody.error || "Failed to save photo metadata.");
        }

        if (saveBody.asset?.id) {
          createdAssetIds.push(saveBody.asset.id);
        }

        updateStatus(file.name, { state: "success", progress: 100 });
      } catch (uploadError) {
        updateStatus(file.name, {
          state: "error",
          progress: 0,
          message: uploadError instanceof Error ? uploadError.message : "Unknown upload error.",
        });
      }
    }

    setIsUploading(false);
    window.dispatchEvent(new Event("admin-assets-refresh"));

    if (createdAssetIds.length > 0) {
      setLastCompletedBatch({ uploadBatchId, assetIds: createdAssetIds });
      window.dispatchEvent(
        new CustomEvent("admin-assets-created", {
          detail: { assetIds: createdAssetIds, uploadBatchId },
        }),
      );
      // Change 5 — auto-scroll to batch section
      setTimeout(() => {
        batchSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 400);
    }
  }

  return (
    <section className="rounded-lg border border-gray-warm bg-white p-4 shadow-sm md:p-6">
      <h2 className="text-2xl text-charcoal">Upload Photos</h2>

      <form className="mt-5 space-y-5" onSubmit={handleSubmit}>

        {/* Change 1 — Drag and drop zone */}
        <div>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const dropped = Array.from(e.dataTransfer.files);
              if (dropped.length) handleFileSelection(dropped);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
              isDragging
                ? "border-red bg-red/5"
                : files.length > 0
                  ? "border-navy/30 bg-navy/[0.03]"
                  : "border-gray-warm hover:border-navy/40"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                const selected = Array.from(e.target.files || []);
                if (selected.length) handleFileSelection(selected);
              }}
            />
            {files.length === 0 ? (
              <>
                <svg className="mb-3 h-8 w-8 text-gray-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="font-ui text-sm font-semibold text-charcoal">Drag photos or videos here, or click to browse</p>
                <p className="mt-1 font-ui text-xs text-gray-mid">Images and videos accepted — multiple files at once</p>
              </>
            ) : (
              <div className="flex flex-wrap justify-center gap-3">
                {previews.map((p) => (
                  <div key={p.name} className="flex flex-col items-center gap-1">
                    {p.previewUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.previewUrl} alt={p.name} className="h-16 w-16 rounded-lg object-cover" />
                      </>
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-charcoal/10 font-ui text-xs text-gray-mid">
                        Video
                      </div>
                    )}
                    <span className="max-w-[64px] truncate font-ui text-[10px] text-gray-mid">{p.name}</span>
                    <span className="font-ui text-[10px] text-gray-mid">{formatBytes(p.size)}</span>
                  </div>
                ))}
                <div className="flex h-16 w-16 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-warm font-ui text-lg text-gray-mid hover:border-navy/40">
                  +
                </div>
              </div>
            )}
          </div>
          {files.length > 0 && (
            <p className="mt-1.5 font-ui text-xs text-gray-mid">
              {files.length} file{files.length !== 1 ? "s" : ""} selected — click zone to add more
            </p>
          )}
        </div>

        {/* Change 3 — Service type: flex wrap, pre-selected from localStorage */}
        <fieldset>
          <legend className="font-ui text-sm font-semibold text-charcoal">Primary Service</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {SERVICE_TAGS.map((service) => {
              const active = primaryService === service.slug;
              return (
                <button
                  key={service.slug}
                  type="button"
                  onClick={() => handleServiceChange(service.slug)}
                  className={`font-ui rounded-sm border px-3 py-2 text-sm transition ${
                    active
                      ? "border-red bg-red text-white"
                      : "border-gray-warm text-charcoal hover:border-red hover:text-red"
                  }`}
                >
                  {service.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Change 6 — Secondary services behind toggle */}
        <div>
          <label className="font-ui inline-flex cursor-pointer items-center gap-2 text-sm text-charcoal">
            <input
              type="checkbox"
              checked={showSecondary}
              onChange={(e) => {
                setShowSecondary(e.target.checked);
                if (!e.target.checked) setSecondaryServices([]);
              }}
            />
            This photo shows multiple services
          </label>
          {showSecondary && (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SERVICE_TAGS.filter((service) => service.slug !== primaryService).map((service) => {
                const active = secondaryServices.includes(service.slug);
                return (
                  <label
                    key={service.slug}
                    className={`font-ui flex min-h-[44px] cursor-pointer items-center gap-2 rounded-sm border px-3 py-2 text-sm transition ${
                      active
                        ? "border-red bg-red text-white"
                        : "border-gray-warm bg-cream/40 text-charcoal hover:border-red hover:text-red"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleSecondaryService(service.slug)}
                      className="h-4 w-4 flex-shrink-0 accent-red"
                    />
                    <span className="leading-5">{service.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Project Context */}
        <fieldset>
          <legend className="font-ui text-sm font-semibold text-charcoal">Project Context</legend>
          <div className="mt-2 space-y-3">
            {(["room", "feature"] as const).map((group) => (
              <div key={group}>
                <p className="font-ui text-xs uppercase tracking-[0.16em] text-gray-mid">
                  {group === "room" ? "Rooms" : "Features"}
                </p>
                <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                  {CONTEXT_TAGS.filter((context) => context.group === group).map((context) => (
                    <label
                      key={context.slug}
                      className="font-ui flex items-center gap-2 rounded-sm border border-gray-warm bg-cream/40 px-3 py-2 text-xs text-charcoal"
                    >
                      <input
                        type="checkbox"
                        checked={contextSlugs.includes(context.slug)}
                        onChange={() => toggleContext(context.slug)}
                      />
                      <span>{context.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        {/* Title — always visible */}
        <label className="block">
          <span className="font-ui text-sm font-semibold text-charcoal">Title <span className="text-red">*</span></span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition focus:border-navy"
            placeholder="Double barn door install in Anthem"
          />
        </label>

        {/* Change 2 — Collapsible details section */}
        <div className="rounded-lg border border-gray-warm">
          <button
            type="button"
            onClick={toggleDetails}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <span className="font-ui text-sm font-semibold text-charcoal">Add Details <span className="font-normal text-gray-mid">(optional)</span></span>
            <span className="flex items-center gap-2">
              <span className="font-ui text-xs text-gray-mid">Details help with SEO and filtering</span>
              <svg
                className={`h-4 w-4 text-gray-mid transition-transform ${detailsOpen ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>
          {detailsOpen && (
            <div className="space-y-4 border-t border-gray-warm px-4 pb-4 pt-4">
              <label className="block">
                <span className="font-ui text-sm font-semibold text-charcoal">Description</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 min-h-[80px] w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy"
                  placeholder="Short scope summary, finish notes, or install details"
                />
              </label>
              <div>
                <span className="font-ui text-sm font-semibold text-charcoal">Location</span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["Summerlin", "Henderson", "Lake Las Vegas", "Anthem", "Red Rock", "North Las Vegas", "Downtown Las Vegas", "Other"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => { setLocationPreset(preset === locationPreset ? "" : preset); setLocationOther(""); }}
                      className={`font-ui rounded-sm border px-3 py-1.5 text-xs transition ${
                        locationPreset === preset
                          ? "border-navy bg-navy text-white"
                          : "border-gray-warm text-charcoal hover:border-navy hover:text-navy"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                {locationPreset === "Other" && (
                  <input
                    type="text"
                    value={locationOther}
                    onChange={(e) => setLocationOther(e.target.value)}
                    className="mt-2 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy"
                    placeholder="Enter location"
                    autoFocus
                  />
                )}
              </div>
              <ServiceMetadataFields
                service={primaryService}
                values={serviceMetadata}
                onChange={updateMetadataField}
              />
            </div>
          )}
        </div>

        <label className="font-ui flex items-center gap-2 text-sm text-charcoal">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Publish immediately
        </label>

        {error ? <p className="font-ui text-sm text-red">{error}</p> : null}

        {/* Change 7 — Sticky submit button on mobile */}
        <div className="sticky bottom-0 -mx-4 bg-white px-4 pb-4 pt-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] md:relative md:bottom-auto md:mx-0 md:bg-transparent md:px-0 md:pb-0 md:pt-0 md:shadow-none">
          <button
            type="submit"
            disabled={!canUpload}
            className="w-full rounded-sm bg-red px-4 py-3 font-ui text-sm font-semibold text-white transition-colors hover:bg-red-dark disabled:cursor-not-allowed disabled:opacity-70 md:w-auto"
          >
            {isUploading ? "Uploading..." : `Upload ${files.length > 0 ? files.length + " " : ""}Selected File${files.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </form>

      {/* Change 5 — Per-file progress and status */}
      {statuses.length > 0 ? (
        <div className="mt-5 space-y-2.5">
          {statuses.map((status) => (
            <div key={status.name} className="rounded-lg border border-gray-warm bg-cream/50 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 flex-1 truncate font-ui text-sm font-semibold text-charcoal">{status.name}</span>
                <span className={`flex-shrink-0 font-ui text-xs ${
                  status.state === "success" ? "text-emerald-600" : status.state === "error" ? "text-red" : "text-gray-mid"
                }`}>
                  {status.state === "success" ? "✓ Uploaded" : status.state === "error" ? "✕ Failed" : status.state === "uploading" ? `${status.progress}%` : status.state}
                </span>
              </div>
              {(status.state === "uploading" || status.state === "saving") && (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-warm">
                  <div
                    className="h-full rounded-full bg-red transition-all duration-300"
                    style={{ width: `${status.progress}%` }}
                  />
                </div>
              )}
              {status.state === "error" && status.message && (
                <p className="mt-1 font-ui text-xs text-red">{status.message}</p>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {/* Completed batch actions */}
      <div ref={batchSectionRef}>
        {lastCompletedBatch ? (
          <div className="mt-5 rounded-xl border border-navy/20 bg-navy/5 p-4">
            <p className="font-ui text-xs uppercase tracking-[0.18em] text-navy">Batch Uploaded</p>
            <h3 className="mt-2 text-lg text-charcoal">Finish this project now</h3>
            <p className="mt-2 text-sm text-gray-mid">
              {lastCompletedBatch.assetIds.length} photo{lastCompletedBatch.assetIds.length === 1 ? "" : "s"} saved.
              Create a project, add to an existing one, or leave as standalone.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/admin/upload-batches?batch=${lastCompletedBatch.uploadBatchId}`}
                className="font-ui rounded-sm bg-red px-4 py-2 text-sm font-semibold text-white"
              >
                Create Project from This Batch
              </Link>
              <Link
                href={`/admin/upload-batches?batch=${lastCompletedBatch.uploadBatchId}&mode=link`}
                className="font-ui rounded-sm border border-gray-warm px-4 py-2 text-sm text-charcoal"
              >
                Add to Existing Project
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
