"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import ServiceMetadataFields from "@/components/admin/ServiceMetadataFields";
import { buildPublicId, uploadFileToCloudinaryWithProgress } from "@/lib/cloudinaryUpload";
import { CONTEXT_TAGS, SERVICE_TAGS } from "@/lib/serviceTags";
import { AREA_NAMES } from "@/content/areas";
import { BRANDS, FINISH_TYPE, GRADE_CUT, SHEET_GOODS, WOOD_SPECIES } from "@/content/materials";

// ── Types ──────────────────────────────────────────────────────────────────────

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

// ── Utils ──────────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function toTitleCase(str: string) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildAutoText(serviceLabel: string, descriptor: string, location: string) {
  const parts = ["custom", serviceLabel, descriptor, location, "Las Vegas"].filter(Boolean);
  return parts.join(" ");
}

// ── Accordion ──────────────────────────────────────────────────────────────────

function AccordionSection({
  title,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  badge?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between bg-white px-4 py-3 transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <span className="font-ui text-sm font-semibold text-gray-900">{title}</span>
          {badge != null && badge > 0 && (
            <span className="rounded-full bg-red px-2 py-0.5 font-ui text-xs font-bold text-white">
              {badge}
            </span>
          )}
        </div>
        <svg
          className="h-4 w-4 text-gray-400 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-gray-100 bg-white px-4 py-4">{children}</div>
      )}
    </div>
  );
}

// ── ChipSelect ─────────────────────────────────────────────────────────────────

function ChipSelect({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className="rounded-full border px-3 py-1.5 font-ui text-sm font-medium transition-colors"
            style={{
              backgroundColor: active ? "#CC2027" : "white",
              color: active ? "white" : "#374151",
              borderColor: active ? "#CC2027" : "#d1d5db",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ── MultiSelectDropdown ────────────────────────────────────────────────────────

function MultiSelectDropdown({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 font-ui text-sm transition-colors hover:border-gray-300"
      >
        <span className="truncate text-gray-700">
          {selected.length > 0 ? selected.join(", ") : label}
        </span>
        <div className="ml-2 flex flex-shrink-0 items-center gap-1">
          {selected.length > 0 && (
            <span className="rounded-full bg-red px-1.5 py-0.5 font-ui text-xs font-bold text-white">
              {selected.length}
            </span>
          )}
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-52 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {options.map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => onToggle(opt)}
                className="rounded border-gray-300 accent-red"
              />
              <span className="font-ui text-sm text-gray-700">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function AssetUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchSectionRef = useRef<HTMLDivElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [primaryService, setPrimaryService] = useState("");
  const [secondaryServices, setSecondaryServices] = useState<string[]>([]);
  const [contextSlugs, setContextSlugs] = useState<string[]>([]);
  const [locationPreset, setLocationPreset] = useState("");
  const [locationOther, setLocationOther] = useState("");
  const [descriptor, setDescriptor] = useState("");
  const [title, setTitle] = useState("");
  const [titleEdited, setTitleEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [serviceMetadata, setServiceMetadata] = useState<Record<string, unknown>>({});
  const [published, setPublished] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statuses, setStatuses] = useState<UploadStatus[]>([]);
  const [lastCompletedBatch, setLastCompletedBatch] = useState<{
    uploadBatchId: string;
    assetIds: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

  // Derived
  const location = locationPreset === "Other" ? locationOther : locationPreset;
  const serviceLabel = SERVICE_TAGS.find((s) => s.slug === primaryService)?.label ?? "";
  const autoAlt = buildAutoText(serviceLabel, descriptor, location);
  const autoTitle = toTitleCase(autoAlt);
  const hasVideo = files.some((f) => f.type.startsWith("video/"));
  const previewPublicId =
    primaryService && descriptor && location
      ? buildPublicId({ serviceType: primaryService, location, descriptor, isVideo: hasVideo && files.length === 1 })
      : null;

  // Context tag helpers
  const roomLabels = CONTEXT_TAGS.filter((c) => c.group === "room").map((c) => c.label);
  const featureLabels = CONTEXT_TAGS.filter((c) => c.group === "feature").map((c) => c.label);
  const selectedRoomLabels = CONTEXT_TAGS
    .filter((c) => c.group === "room" && contextSlugs.includes(c.slug))
    .map((c) => c.label);
  const selectedFeatureLabels = CONTEXT_TAGS
    .filter((c) => c.group === "feature" && contextSlugs.includes(c.slug))
    .map((c) => c.label);

  // Service chip helpers
  const serviceOptions = SERVICE_TAGS.map((s) => s.label);
  const primaryServiceLabel = SERVICE_TAGS.find((s) => s.slug === primaryService)?.label;
  const secondaryServiceLabels = secondaryServices
    .map((slug) => SERVICE_TAGS.find((s) => s.slug === slug)?.label)
    .filter((l): l is string => Boolean(l));
  const totalServiceCount = (primaryService ? 1 : 0) + secondaryServices.length;

  // Badges
  const contextBadge = contextSlugs.length;
  const metadataBadge = Object.values(serviceMetadata).filter(Boolean).length;

  // Load saved service
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lastUsedServiceType");
      if (saved) setPrimaryService(saved);
    } catch {
      // ignore
    }
  }, []);

  // Auto-populate title
  useEffect(() => {
    if (!titleEdited && autoTitle) setTitle(autoTitle);
  }, [autoTitle, titleEdited]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach((p) => { if (p.previewUrl) URL.revokeObjectURL(p.previewUrl); });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canUpload =
    files.length > 0 &&
    Boolean(primaryService) &&
    Boolean(location) &&
    Boolean(descriptor.trim()) &&
    !isUploading;

  function buildPreviews(selected: File[]): FilePreview[] {
    return selected.map((f) => ({
      name: f.name,
      previewUrl: URL.createObjectURL(f),
      size: f.size,
      isVideo: f.type.startsWith("video/"),
    }));
  }

  function handleFileSelection(selected: File[]) {
    previews.forEach((p) => { if (p.previewUrl) URL.revokeObjectURL(p.previewUrl); });
    setFiles(selected);
    setPreviews(buildPreviews(selected));
  }

  function removeFile(index: number) {
    const nextFiles = files.filter((_, i) => i !== index);
    const nextPreviews = previews.filter((_, i) => i !== index);
    if (previews[index]?.previewUrl) URL.revokeObjectURL(previews[index].previewUrl);
    setFiles(nextFiles);
    setPreviews(nextPreviews);
  }

  function updateStatus(name: string, next: Partial<UploadStatus>) {
    setStatuses((current) =>
      current.map((item) => (item.name === name ? { ...item, ...next } : item)),
    );
  }

  function toggleService(label: string) {
    const service = SERVICE_TAGS.find((s) => s.label === label);
    if (!service) return;
    const slug = service.slug;

    if (slug === primaryService) {
      // Deselect primary — promote first secondary if any
      const next = secondaryServices[0] ?? "";
      setPrimaryService(next);
      setSecondaryServices((prev) => prev.slice(1));
      if (!next) setServiceMetadata({});
      try { localStorage.setItem("lastUsedServiceType", next); } catch {}
    } else if (secondaryServices.includes(slug)) {
      // Deselect secondary
      setSecondaryServices((prev) => prev.filter((s) => s !== slug));
    } else if (!primaryService) {
      // No primary yet — set as primary
      setPrimaryService(slug);
      setServiceMetadata({});
      try { localStorage.setItem("lastUsedServiceType", slug); } catch {}
    } else {
      // Primary exists — add as secondary
      setSecondaryServices((prev) => [...prev, slug]);
    }
  }

  function toggleContextByLabel(label: string) {
    const ctx = CONTEXT_TAGS.find((c) => c.label === label);
    if (!ctx) return;
    setContextSlugs((current) =>
      current.includes(ctx.slug)
        ? current.filter((s) => s !== ctx.slug)
        : [...current, ctx.slug],
    );
  }

  function toggleMaterial(material: string) {
    setSelectedMaterials((prev) =>
      prev.includes(material) ? prev.filter((m) => m !== material) : [...prev, material],
    );
  }

  function updateMetadataField(key: string, value: string | number | boolean) {
    setServiceMetadata((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!canUpload) return;

    setIsUploading(true);
    setStatuses(files.map((file) => ({ name: file.name, state: "pending", progress: 0 })));

    const uploadBatchId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`;
    const createdAssetIds: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i]!;
      try {
        updateStatus(file.name, { state: "uploading", progress: 0 });

        const isVideo = file.type.startsWith("video/");
        const basePublicId = buildPublicId({ serviceType: primaryService, location, descriptor, isVideo });
        const publicId = i === 0 ? basePublicId : `${basePublicId}-${i + 1}`;

        const uploadResult = await uploadFileToCloudinaryWithProgress(
          file,
          (percent) => updateStatus(file.name, { progress: percent }),
          { publicId },
        );

        updateStatus(file.name, { state: "saving", progress: 95 });

        const tagSlugs = [primaryService, ...secondaryServices].filter(Boolean);
        const saveResponse = await fetch("/api/admin/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...uploadResult,
            uploadBatchId,
            title: title.trim() || autoTitle,
            alt: autoAlt,
            description: description.trim() || undefined,
            location: location.trim() || undefined,
            primaryServiceSlug: primaryService,
            serviceMetadata,
            published,
            tagSlugs,
            contextSlugs,
            materials: selectedMaterials,
          }),
        });

        const saveBody = (await saveResponse.json().catch(() => ({}))) as {
          error?: string;
          asset?: { id?: string };
        };

        if (!saveResponse.ok) throw new Error(saveBody.error || "Failed to save photo metadata.");
        if (saveBody.asset?.id) createdAssetIds.push(saveBody.asset.id);
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
      setTimeout(() => {
        batchSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 400);
    }
  }

  return (
    <section className="rounded-lg border border-gray-warm bg-white p-4 shadow-sm md:p-6">
      <h2 className="text-2xl text-charcoal">Upload Media</h2>

      {/* Drop zone — always visible */}
      <div className="mt-5">
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
              {previews.map((p, index) => (
                <div key={p.name} className="group relative flex flex-col items-center gap-1">
                  {p.isVideo ? (
                    <span className="relative inline-flex h-16 w-16 overflow-hidden rounded-lg bg-charcoal">
                      <video src={p.previewUrl} preload="metadata" muted className="h-full w-full object-cover" />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </span>
                    </span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.previewUrl} alt={p.name} className="h-16 w-16 rounded-lg object-cover" />
                  )}
                  {!isUploading && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 font-ui text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Remove file"
                    >
                      ✕
                    </button>
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

      <form className="mt-4 space-y-2" onSubmit={handleSubmit}>

        {/* 1 — Service */}
        <AccordionSection title="Service" badge={totalServiceCount} defaultOpen>
          <div className="flex flex-wrap gap-2">
            {serviceOptions.map((label) => {
              const isPrimary = label === primaryServiceLabel;
              const isSecondary = secondaryServiceLabels.includes(label);
              const isSelected = isPrimary || isSecondary;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleService(label)}
                  className="rounded-full border px-3 py-1.5 font-ui text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: isPrimary ? "#CC2027" : "white",
                    color: isPrimary ? "white" : isSecondary ? "#CC2027" : "#374151",
                    borderColor: isSelected ? "#CC2027" : "#d1d5db",
                  }}
                >
                  {label}
                  {isSecondary && <span className="ml-1 text-xs opacity-70">+</span>}
                </button>
              );
            })}
          </div>
          {secondaryServiceLabels.length > 0 && (
            <p className="mt-2 font-ui text-xs text-gray-mid">
              Primary: <strong>{primaryServiceLabel}</strong> · Also: {secondaryServiceLabels.join(", ")}
            </p>
          )}
        </AccordionSection>

        {/* 2 — Location */}
        <AccordionSection title="Location" badge={location ? 1 : 0} defaultOpen>
          <ChipSelect
            options={[...AREA_NAMES]}
            selected={locationPreset ? [locationPreset] : []}
            onToggle={(val) => {
              setLocationPreset((prev) => (prev === val ? "" : val));
              setLocationOther("");
            }}
          />
          {locationPreset === "Other" && (
            <input
              type="text"
              value={locationOther}
              onChange={(e) => setLocationOther(e.target.value)}
              className="mt-3 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none transition focus:border-navy"
              placeholder="Enter location"
              autoFocus
            />
          )}
        </AccordionSection>

        {/* 3 — File Info */}
        <AccordionSection title="File Info" badge={descriptor.trim() ? 1 : 0} defaultOpen>
          <div className="space-y-4">
            <label className="block">
              <span className="font-ui text-sm font-semibold text-charcoal">
                What does this show? <span className="text-red">*</span>
              </span>
              <span className="mt-0.5 block font-ui text-xs text-gray-mid">
                2–4 words describing the specific shot. This becomes the file name.
              </span>
              <input
                type="text"
                value={descriptor}
                onChange={(e) => setDescriptor(e.target.value.slice(0, 50))}
                className="mt-1.5 w-full rounded-sm border border-gray-warm bg-white px-3 py-2.5 font-ui text-sm text-charcoal outline-none transition focus:border-navy"
                placeholder="e.g. living-room-walnut-shelves, master-bedroom-black-hardware"
                maxLength={50}
              />
            </label>
            {previewPublicId && (
              <p className="rounded-sm bg-navy/5 px-3 py-2 font-mono text-[11px] text-navy">
                📁 {previewPublicId}
              </p>
            )}

            <label className="block">
              <span className="font-ui text-sm font-semibold text-charcoal">Title</span>
              <input
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setTitleEdited(true); }}
                onBlur={() => { if (!title.trim()) setTitleEdited(false); }}
                className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2.5 font-ui text-sm text-charcoal outline-none transition focus:border-navy"
                placeholder="Auto-generated from service + descriptor + location"
              />
            </label>

          </div>
        </AccordionSection>

        {/* 4 — Project Context */}
        <AccordionSection title="Project Context" badge={contextBadge}>
          <div className="space-y-4">
            <div>
              <p className="mb-2 font-ui text-xs font-semibold uppercase tracking-[0.16em] text-gray-mid">
                Rooms
              </p>
              <ChipSelect
                options={roomLabels}
                selected={selectedRoomLabels}
                onToggle={toggleContextByLabel}
              />
            </div>
            <div>
              <p className="mb-2 font-ui text-xs font-semibold uppercase tracking-[0.16em] text-gray-mid">
                Features
              </p>
              <ChipSelect
                options={featureLabels}
                selected={selectedFeatureLabels}
                onToggle={toggleContextByLabel}
              />
            </div>
          </div>
        </AccordionSection>

        {/* 5 — Material Type */}
        <AccordionSection title="Material Type" badge={selectedMaterials.length}>
          <div className="space-y-5">
            <div>
              <p className="mb-2 font-ui text-xs font-semibold uppercase tracking-[0.16em] text-gray-mid">
                Wood Species
              </p>
              <ChipSelect
                options={WOOD_SPECIES}
                selected={selectedMaterials.filter((m) => WOOD_SPECIES.includes(m))}
                onToggle={toggleMaterial}
              />
            </div>
            <div>
              <p className="mb-2 font-ui text-xs font-semibold uppercase tracking-[0.16em] text-gray-mid">
                Sheet Goods & Engineered
              </p>
              <MultiSelectDropdown
                label="Select sheet goods..."
                options={SHEET_GOODS}
                selected={selectedMaterials.filter((m) => SHEET_GOODS.includes(m))}
                onToggle={toggleMaterial}
              />
            </div>
            <div>
              <p className="mb-2 font-ui text-xs font-semibold uppercase tracking-[0.16em] text-gray-mid">
                Grade & Cut
              </p>
              <MultiSelectDropdown
                label="Select grade or cut..."
                options={GRADE_CUT}
                selected={selectedMaterials.filter((m) => GRADE_CUT.includes(m))}
                onToggle={toggleMaterial}
              />
            </div>
            <div>
              <p className="mb-2 font-ui text-xs font-semibold uppercase tracking-[0.16em] text-gray-mid">
                Finish Type
              </p>
              <MultiSelectDropdown
                label="Select finish..."
                options={FINISH_TYPE}
                selected={selectedMaterials.filter((m) => FINISH_TYPE.includes(m))}
                onToggle={toggleMaterial}
              />
            </div>
            <div>
              <p className="mb-2 font-ui text-xs font-semibold uppercase tracking-[0.16em] text-gray-mid">
                Brands & Product Lines
              </p>
              <MultiSelectDropdown
                label="Select brand..."
                options={BRANDS}
                selected={selectedMaterials.filter((m) => BRANDS.includes(m))}
                onToggle={toggleMaterial}
              />
            </div>
          </div>
        </AccordionSection>

        {/* 6 — Service Details */}
        {primaryService && (
          <AccordionSection title="Service Details" badge={metadataBadge}>
            <ServiceMetadataFields
              service={primaryService}
              values={serviceMetadata}
              onChange={updateMetadataField}
            />
          </AccordionSection>
        )}

        {/* 7 — Description & Notes */}
        <AccordionSection title="Description & Notes">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[80px] w-full rounded-sm border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none transition focus:border-navy"
            placeholder="Short scope summary, finish notes, or install details"
          />
        </AccordionSection>

        {/* Publish + Upload — always visible */}
        <div className="pt-2">
          <label className="font-ui flex items-center gap-2 text-sm text-charcoal">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Publish immediately
          </label>
        </div>

        {error ? <p className="font-ui text-sm text-red">{error}</p> : null}

        <div className="sticky bottom-0 -mx-4 bg-white px-4 pb-4 pt-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] md:relative md:bottom-auto md:mx-0 md:bg-transparent md:px-0 md:pb-0 md:pt-0 md:shadow-none">
          <button
            type="submit"
            disabled={!canUpload}
            title={!canUpload && !isUploading ? "Select a service, location, and descriptor first" : undefined}
            className="w-full rounded-xl bg-red py-3 font-ui text-base font-semibold text-white transition-colors hover:bg-red-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isUploading
              ? "Uploading..."
              : `Upload ${files.length > 0 ? files.length + " " : ""}Selected File${files.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </form>

      {/* Per-file progress */}
      {statuses.length > 0 && (
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
      )}

      {/* Completed batch actions */}
      <div ref={batchSectionRef}>
        {lastCompletedBatch && (
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
        )}
      </div>
    </section>
  );
}
