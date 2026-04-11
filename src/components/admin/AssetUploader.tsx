"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import PaintColorPicker, { type PaintColor } from "@/components/admin/PaintColorPicker";
import ServiceMetadataFields from "@/components/admin/ServiceMetadataFields";
import { buildPublicId, uploadFileToCloudinaryWithProgress } from "@/lib/cloudinaryUpload";
import { CONTEXT_TAGS, SERVICE_TAGS } from "@/lib/serviceTags";
import { AREA_NAMES } from "@/content/areas";
import {
  GRADE_CUT_OPTIONS,
  MATERIAL_GRADES,
  PAINT_BRANDS,
  PAINT_GRADE_SUBSTRATES,
  PAINT_SHEENS,
  STAIN_BRANDS,
  STAIN_FINISH_TYPES,
  STAIN_GRADE_SUBSTRATES,
  STAIN_SHEENS,
  TFL_BRANDS,
  TFL_SUBSTRATES,
  TFL_SHEENS,
  WOOD_SPECIES,
  type MaterialGrade,
} from "@/content/materials";

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

function toSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ── Generic primary/secondary toggle factory ───────────────────────────────────

function makeToggle(
  primary: string,
  setPrimary: (v: string) => void,
  secondary: string[],
  setSecondary: (fn: (prev: string[]) => string[]) => void,
) {
  return (val: string) => {
    if (val === primary) {
      setPrimary(secondary[0] ?? "");
      setSecondary((prev) => prev.slice(1));
    } else if (secondary.includes(val)) {
      setSecondary((prev) => prev.filter((s) => s !== val));
    } else if (!primary) {
      setPrimary(val);
    } else {
      setSecondary((prev) => [...prev, val]);
    }
  };
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
    <div className="rounded-xl border border-gray-200">
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
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
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

// ── ChipGroup — primary (solid red) + secondary (red outline) ──────────────────

function ChipGroup({
  options,
  primary,
  secondary,
  onToggle,
}: {
  options: string[];
  primary: string;
  secondary: string[];
  onToggle: (val: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isPrimary = opt === primary;
        const isSecondary = secondary.includes(opt);
        const isSelected = isPrimary || isSecondary;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className="rounded-full border px-3 py-1.5 font-ui text-sm font-medium transition-colors"
            style={{
              backgroundColor: isPrimary ? "#CC2027" : "white",
              color: isPrimary ? "white" : isSecondary ? "#CC2027" : "#374151",
              borderColor: isSelected ? "#CC2027" : "#d1d5db",
            }}
          >
            {opt}
            {isSecondary && <span className="ml-1 text-xs opacity-70">+</span>}
          </button>
        );
      })}
    </div>
  );
}

// ── SimpleChips — single-select or multi-select (no primary/secondary) ─────────

function SimpleChips({
  options,
  selected,
  onToggle,
  multi = false,
}: {
  options: string[];
  selected: string | string[];
  onToggle: (val: string) => void;
  multi?: boolean;
}) {
  const isActive = (opt: string) =>
    multi ? (selected as string[]).includes(opt) : selected === opt;

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onToggle(opt)}
          className="rounded-full border px-3 py-1.5 font-ui text-sm font-medium transition-colors"
          style={{
            backgroundColor: isActive(opt) ? "#CC2027" : "white",
            color: isActive(opt) ? "white" : "#374151",
            borderColor: isActive(opt) ? "#CC2027" : "#d1d5db",
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ── CategoryLabel ──────────────────────────────────────────────────────────────

function CategoryLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 font-ui text-xs font-semibold uppercase tracking-[0.16em] text-gray-mid">
      {children}
    </p>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function AssetUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchSectionRef = useRef<HTMLDivElement>(null);

  // Files
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Service
  const [primaryService, setPrimaryService] = useState("");
  const [secondaryServices, setSecondaryServices] = useState<string[]>([]);

  // Location
  const [primaryLocation, setPrimaryLocation] = useState("");
  const [secondaryLocations, setSecondaryLocations] = useState<string[]>([]);
  const [locationOther, setLocationOther] = useState("");

  // Rooms
  const [primaryRoom, setPrimaryRoom] = useState("");
  const [secondaryRooms, setSecondaryRooms] = useState<string[]>([]);

  // Features
  const [primaryFeature, setPrimaryFeature] = useState("");
  const [secondaryFeatures, setSecondaryFeatures] = useState<string[]>([]);

  // Material — three-path system
  const [materialGrade, setMaterialGrade] = useState<MaterialGrade | "">("");
  const [selectedSubstrates, setSelectedSubstrates] = useState<string[]>([]);
  const [selectedSheen, setSelectedSheen] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [stainFinishType, setStainFinishType] = useState("");
  const [selectedGradeCut, setSelectedGradeCut] = useState<string[]>([]);
  const [primaryWoodSpecies, setPrimaryWoodSpecies] = useState("");
  const [secondaryWoodSpecies, setSecondaryWoodSpecies] = useState<string[]>([]);

  // Color spec (Paint + Stain) — searchable SW picker
  const [selectedPaintColor, setSelectedPaintColor] = useState<PaintColor | null>(null);
  const [selectedStainColor, setSelectedStainColor] = useState<PaintColor | null>(null);

  // File info
  const [filenameOverride, setFilenameOverride] = useState("");
  const [title, setTitle] = useState("");
  const [titleEdited, setTitleEdited] = useState(false);
  const [description, setDescription] = useState("");

  // Misc
  const [serviceMetadata, setServiceMetadata] = useState<Record<string, unknown>>({});
  const [published, setPublished] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statuses, setStatuses] = useState<UploadStatus[]>([]);
  const [lastCompletedBatch, setLastCompletedBatch] = useState<{
    uploadBatchId: string;
    assetIds: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Derived ──────────────────────────────────────────────────────────────────

  const resolvedLocation = primaryLocation === "Other" ? locationOther : primaryLocation;
  const primaryServiceLabel = SERVICE_TAGS.find((s) => s.slug === primaryService)?.label ?? "";
  const secondaryServiceLabels = secondaryServices
    .map((slug) => SERVICE_TAGS.find((s) => s.slug === slug)?.label)
    .filter((l): l is string => Boolean(l));

  const roomLabels = CONTEXT_TAGS.filter((c) => c.group === "room").map((c) => c.label);
  const featureLabels = CONTEXT_TAGS.filter((c) => c.group === "feature").map((c) => c.label);

  const totalServiceCount = (primaryService ? 1 : 0) + secondaryServices.length;
  const locationBadge = (primaryLocation ? 1 : 0) + secondaryLocations.length;
  const contextBadge =
    (primaryRoom ? 1 : 0) + secondaryRooms.length +
    (primaryFeature ? 1 : 0) + secondaryFeatures.length;
  const materialBadge = materialGrade
    ? 1 + selectedSubstrates.length + (selectedSheen ? 1 : 0) + (selectedBrand ? 1 : 0)
    : 0;
  const metadataBadge = Object.values(serviceMetadata).filter(Boolean).length;

  const autoFilename = useMemo(() => {
    const parts: string[] = [];
    if (primaryServiceLabel) parts.push(primaryServiceLabel);
    if (primaryRoom) parts.push(primaryRoom);
    else if (primaryFeature) parts.push(primaryFeature);
    if (resolvedLocation) parts.push(resolvedLocation);
    if (primaryWoodSpecies) parts.push(primaryWoodSpecies);
    return toSlug(parts.join("-")).slice(0, 60) || "untitled";
  }, [primaryServiceLabel, primaryRoom, primaryFeature, resolvedLocation, primaryWoodSpecies]);

  const finalFilename = filenameOverride.trim() || autoFilename;

  const autoAlt = [primaryServiceLabel, primaryRoom || primaryFeature, resolvedLocation, "Las Vegas"]
    .filter(Boolean).join(" ");
  const autoTitle = toTitleCase(autoAlt);

  const hasVideo = files.some((f) => f.type.startsWith("video/"));
  const previewPublicId =
    primaryService && resolvedLocation
      ? buildPublicId({ serviceType: primaryService, location: resolvedLocation, descriptor: finalFilename, isVideo: hasVideo && files.length === 1 })
      : null;

  // Context slugs for API
  const allContextLabels = [primaryRoom, ...secondaryRooms, primaryFeature, ...secondaryFeatures].filter(Boolean);
  const contextSlugs = allContextLabels
    .map((label) => CONTEXT_TAGS.find((c) => c.label === label)?.slug)
    .filter((s): s is string => Boolean(s));

  // Flatten material selections for API (materials String[])
  const allMaterials = [
    materialGrade,
    ...selectedSubstrates,
    selectedSheen,
    selectedBrand,
    stainFinishType,
    ...selectedGradeCut,
    primaryWoodSpecies,
    ...secondaryWoodSpecies,
    selectedPaintColor?.name,
    selectedPaintColor?.code,
    selectedStainColor?.name,
    selectedStainColor?.code,
  ].filter(Boolean);

  const canUpload =
    files.length > 0 &&
    Boolean(primaryService) &&
    Boolean(resolvedLocation) &&
    !isUploading;

  // ── Toggles ───────────────────────────────────────────────────────────────────

  function toggleService(label: string) {
    const service = SERVICE_TAGS.find((s) => s.label === label);
    if (!service) return;
    const slug = service.slug;
    if (slug === primaryService) {
      const next = secondaryServices[0] ?? "";
      setPrimaryService(next);
      setSecondaryServices((prev) => prev.slice(1));
      if (!next) setServiceMetadata({});
      try { localStorage.setItem("lastUsedServiceType", next); } catch {}
    } else if (secondaryServices.includes(slug)) {
      setSecondaryServices((prev) => prev.filter((s) => s !== slug));
    } else if (!primaryService) {
      setPrimaryService(slug);
      setServiceMetadata({});
      try { localStorage.setItem("lastUsedServiceType", slug); } catch {}
    } else {
      setSecondaryServices((prev) => [...prev, slug]);
    }
  }

  const toggleLocation = makeToggle(primaryLocation, setPrimaryLocation, secondaryLocations, setSecondaryLocations);
  const toggleRoom = makeToggle(primaryRoom, setPrimaryRoom, secondaryRooms, setSecondaryRooms);
  const toggleFeature = makeToggle(primaryFeature, setPrimaryFeature, secondaryFeatures, setSecondaryFeatures);
  const toggleWoodSpecies = makeToggle(primaryWoodSpecies, setPrimaryWoodSpecies, secondaryWoodSpecies, setSecondaryWoodSpecies);

  function toggleSubstrate(val: string) {
    setSelectedSubstrates((prev) =>
      prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val],
    );
  }

  function toggleGradeCut(val: string) {
    setSelectedGradeCut((prev) =>
      prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val],
    );
  }

  // ── Effects ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lastUsedServiceType");
      if (saved) setPrimaryService(saved);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!titleEdited && autoTitle) setTitle(autoTitle);
  }, [autoTitle, titleEdited]);

  useEffect(() => {
    setServiceMetadata({});
  }, [primaryService]);

  // Reset all material state when grade path changes
  useEffect(() => {
    setSelectedSubstrates([]);
    setSelectedSheen("");
    setSelectedBrand("");
    setStainFinishType("");
    setSelectedGradeCut([]);
    setPrimaryWoodSpecies("");
    setSecondaryWoodSpecies([]);
    setSelectedPaintColor(null);
    setSelectedStainColor(null);
  }, [materialGrade]);

  useEffect(() => {
    return () => {
      previews.forEach((p) => { if (p.previewUrl) URL.revokeObjectURL(p.previewUrl); });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── File helpers ──────────────────────────────────────────────────────────────

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
    if (previews[index]?.previewUrl) URL.revokeObjectURL(previews[index].previewUrl);
    setFiles((f) => f.filter((_, i) => i !== index));
    setPreviews((p) => p.filter((_, i) => i !== index));
  }

  function updateStatus(name: string, next: Partial<UploadStatus>) {
    setStatuses((current) => current.map((item) => (item.name === name ? { ...item, ...next } : item)));
  }

  // ── Submit ────────────────────────────────────────────────────────────────────

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
        const basePublicId = buildPublicId({
          serviceType: primaryService,
          location: resolvedLocation,
          descriptor: finalFilename,
          isVideo,
        });
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
            location: resolvedLocation || undefined,
            primaryServiceSlug: primaryService,
            serviceMetadata,
            published,
            tagSlugs,
            contextSlugs,
            materials: allMaterials,
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

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <section className="rounded-lg border border-gray-warm bg-white p-4 shadow-sm md:p-6">
      <h2 className="text-2xl text-charcoal">Upload Media</h2>

      {/* Drop zone */}
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
            isDragging ? "border-red bg-red/5"
              : files.length > 0 ? "border-navy/30 bg-navy/[0.03]"
              : "border-gray-warm hover:border-navy/40"
          }`}
        >
          <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" className="hidden"
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
                    <button type="button" onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 font-ui text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Remove file"
                    >✕</button>
                  )}
                  <span className="max-w-[64px] truncate font-ui text-[10px] text-gray-mid">{p.name}</span>
                  <span className="font-ui text-[10px] text-gray-mid">{formatBytes(p.size)}</span>
                </div>
              ))}
              <div className="flex h-16 w-16 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-warm font-ui text-lg text-gray-mid hover:border-navy/40">+</div>
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

        {/* 1 — Location */}
        <AccordionSection title="Location" badge={locationBadge} defaultOpen>
          <ChipGroup
            options={[...AREA_NAMES]}
            primary={primaryLocation}
            secondary={secondaryLocations}
            onToggle={(val) => {
              if (val === "Other" && primaryLocation !== "Other") setLocationOther("");
              toggleLocation(val);
            }}
          />
          {(primaryLocation === "Other" || secondaryLocations.includes("Other")) && (
            <input
              type="text"
              value={locationOther}
              onChange={(e) => setLocationOther(e.target.value)}
              className="mt-3 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none transition focus:border-navy"
              placeholder="Enter location"
            />
          )}
        </AccordionSection>

        {/* 2 — Service + inline Service Details */}
        <AccordionSection title="Service" badge={totalServiceCount + metadataBadge} defaultOpen>
          <ChipGroup
            options={SERVICE_TAGS.map((s) => s.label)}
            primary={primaryServiceLabel}
            secondary={secondaryServiceLabels}
            onToggle={toggleService}
          />
          {secondaryServiceLabels.length > 0 && (
            <p className="mt-2 font-ui text-xs text-gray-mid">
              Primary: <strong>{primaryServiceLabel}</strong> · Also: {secondaryServiceLabels.join(", ")}
            </p>
          )}
          {primaryService && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <ServiceMetadataFields
                service={primaryService}
                values={serviceMetadata}
                onChange={(key, value) => setServiceMetadata((c) => ({ ...c, [key]: value }))}
              />
            </div>
          )}
        </AccordionSection>

        {/* 3 — Project Context */}
        <AccordionSection title="Project Context" badge={contextBadge}>
          <div className="space-y-4">
            <div>
              <CategoryLabel>Rooms</CategoryLabel>
              <ChipGroup
                options={roomLabels}
                primary={primaryRoom}
                secondary={secondaryRooms}
                onToggle={toggleRoom}
              />
            </div>
            <div>
              <CategoryLabel>Features</CategoryLabel>
              <ChipGroup
                options={featureLabels}
                primary={primaryFeature}
                secondary={secondaryFeatures}
                onToggle={toggleFeature}
              />
            </div>
          </div>
        </AccordionSection>

        {/* 4 — Material Type — three-path */}
        <AccordionSection title="Material Type" badge={materialBadge}>
          {/* Grade toggle */}
          <div className="mb-5">
            <CategoryLabel>Grade</CategoryLabel>
            <div className="flex flex-wrap gap-2">
              {MATERIAL_GRADES.map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => setMaterialGrade(grade === materialGrade ? "" : grade)}
                  className="rounded-full border px-4 py-2 font-ui text-sm font-semibold transition-colors"
                  style={{
                    backgroundColor: materialGrade === grade ? "#1B2A6B" : "white",
                    color: materialGrade === grade ? "white" : "#374151",
                    borderColor: materialGrade === grade ? "#1B2A6B" : "#d1d5db",
                  }}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>

          {/* Empty state */}
          {!materialGrade && (
            <p className="font-ui text-sm text-gray-400">
              Select Paint Grade, Stain Grade, or TFL / Melamine to see relevant options.
            </p>
          )}

          {/* ── Paint Grade path ── */}
          {materialGrade === "Paint Grade" && (
            <div className="space-y-5">
              <div>
                <CategoryLabel>Substrate</CategoryLabel>
                <SimpleChips
                  options={PAINT_GRADE_SUBSTRATES}
                  selected={selectedSubstrates}
                  onToggle={toggleSubstrate}
                  multi
                />
              </div>
              <div>
                <CategoryLabel>Sheen Level</CategoryLabel>
                <SimpleChips
                  options={PAINT_SHEENS.map((s) => `${s.name} — ${s.value}`)}
                  selected={selectedSheen}
                  onToggle={(val) => setSelectedSheen(selectedSheen === val ? "" : val)}
                />
              </div>
              <div>
                <CategoryLabel>Paint Brand</CategoryLabel>
                <SimpleChips
                  options={PAINT_BRANDS}
                  selected={selectedBrand}
                  onToggle={(val) => setSelectedBrand(selectedBrand === val ? "" : val)}
                />
              </div>
              {/* Paint Color Spec */}
              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div>
                  <p className="font-ui text-xs font-semibold uppercase tracking-[0.16em] text-gray-700">Paint Color</p>
                  <p className="mt-0.5 font-ui text-xs text-gray-400">Document the client&apos;s chosen color — independent of which vendor mixed it.</p>
                </div>
                <PaintColorPicker
                  brand="Sherwin-Williams"
                  selected={selectedPaintColor}
                  onSelect={setSelectedPaintColor}
                  placeholder="Search SW colors by name or code..."
                />
              </div>
            </div>
          )}

          {/* ── Stain Grade path ── */}
          {materialGrade === "Stain Grade" && (
            <div className="space-y-5">
              <div>
                <CategoryLabel>Wood Species</CategoryLabel>
                <ChipGroup
                  options={WOOD_SPECIES}
                  primary={primaryWoodSpecies}
                  secondary={secondaryWoodSpecies}
                  onToggle={toggleWoodSpecies}
                />
                {secondaryWoodSpecies.length > 0 && (
                  <p className="mt-1 font-ui text-xs text-gray-400">
                    Primary: <strong>{primaryWoodSpecies}</strong> · Also: {secondaryWoodSpecies.join(", ")}
                  </p>
                )}
              </div>
              <div>
                <CategoryLabel>Substrate</CategoryLabel>
                <SimpleChips
                  options={STAIN_GRADE_SUBSTRATES}
                  selected={selectedSubstrates}
                  onToggle={toggleSubstrate}
                  multi
                />
              </div>
              <div>
                <CategoryLabel>Grade & Cut</CategoryLabel>
                <SimpleChips
                  options={GRADE_CUT_OPTIONS}
                  selected={selectedGradeCut}
                  onToggle={toggleGradeCut}
                  multi
                />
              </div>
              <div>
                <CategoryLabel>Finish Type</CategoryLabel>
                <select
                  value={stainFinishType}
                  onChange={(e) => setStainFinishType(e.target.value)}
                  className="w-full rounded-sm border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none transition focus:border-navy"
                >
                  <option value="">Select finish type...</option>
                  {STAIN_FINISH_TYPES.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <CategoryLabel>Sheen Level</CategoryLabel>
                <SimpleChips
                  options={STAIN_SHEENS.map((s) => `${s.name} — ${s.value}`)}
                  selected={selectedSheen}
                  onToggle={(val) => setSelectedSheen(selectedSheen === val ? "" : val)}
                />
              </div>
              <div>
                <CategoryLabel>Finish Brand</CategoryLabel>
                <SimpleChips
                  options={STAIN_BRANDS}
                  selected={selectedBrand}
                  onToggle={(val) => setSelectedBrand(selectedBrand === val ? "" : val)}
                />
              </div>
              {/* Stain Color Spec */}
              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div>
                  <p className="font-ui text-xs font-semibold uppercase tracking-[0.16em] text-gray-700">Stain Color</p>
                  <p className="mt-0.5 font-ui text-xs text-gray-400">Document the client&apos;s chosen stain color so the job can be recreated exactly.</p>
                </div>
                <PaintColorPicker
                  brand="Sherwin-Williams"
                  selected={selectedStainColor}
                  onSelect={setSelectedStainColor}
                  placeholder="Search SW colors by name or code..."
                />
              </div>
            </div>
          )}

          {/* ── TFL / Melamine path ── */}
          {materialGrade === "TFL / Melamine" && (
            <div className="space-y-5">
              <div>
                <CategoryLabel>Surface Product</CategoryLabel>
                <SimpleChips
                  options={TFL_SUBSTRATES}
                  selected={selectedSubstrates}
                  onToggle={toggleSubstrate}
                  multi
                />
              </div>
              <div>
                <CategoryLabel>Surface Sheen</CategoryLabel>
                <SimpleChips
                  options={TFL_SHEENS.map((s) =>
                    s.value > 0 ? `${s.name} — ${s.value}` : s.name,
                  )}
                  selected={selectedSheen}
                  onToggle={(val) => setSelectedSheen(selectedSheen === val ? "" : val)}
                />
              </div>
              <div>
                <CategoryLabel>Brand</CategoryLabel>
                <SimpleChips
                  options={TFL_BRANDS}
                  selected={selectedBrand}
                  onToggle={(val) => setSelectedBrand(selectedBrand === val ? "" : val)}
                />
              </div>
            </div>
          )}
        </AccordionSection>

        {/* 5 — Description & Notes */}
        <AccordionSection title="Description & Notes">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[80px] w-full rounded-sm border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none transition focus:border-navy"
            placeholder="Short scope summary, finish notes, or install details"
          />
        </AccordionSection>

        {/* 6 — File Info */}
        <AccordionSection title="File Info">
          <div className="space-y-4">
            <div>
              <CategoryLabel>Auto Filename</CategoryLabel>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <span className="flex-1 font-mono text-sm text-gray-700">{finalFilename}</span>
                <span className="font-ui text-xs text-gray-400">.jpg / .mp4</span>
              </div>
              {previewPublicId && (
                <p className="mt-1 rounded-sm bg-navy/5 px-3 py-1.5 font-mono text-[11px] text-navy">
                  📁 {previewPublicId}
                </p>
              )}
              <p className="mt-1 font-ui text-xs text-gray-400">
                Generated from your selections. Override below if needed.
              </p>
            </div>
            <div>
              <CategoryLabel>Override Filename <span className="font-normal normal-case">(optional)</span></CategoryLabel>
              <input
                type="text"
                value={filenameOverride}
                onChange={(e) => setFilenameOverride(e.target.value)}
                className="w-full rounded-sm border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none transition focus:border-navy"
                placeholder="Leave blank to use auto filename"
              />
            </div>
            <div>
              <CategoryLabel>Title</CategoryLabel>
              <input
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setTitleEdited(true); }}
                onBlur={() => { if (!title.trim()) setTitleEdited(false); }}
                className="w-full rounded-sm border border-gray-warm bg-white px-3 py-2.5 font-ui text-sm text-charcoal outline-none transition focus:border-navy"
                placeholder="Auto-generated from selections"
              />
            </div>
          </div>
        </AccordionSection>

        {/* Review bar + upload */}
        {error && <p className="font-ui text-sm text-red">{error}</p>}

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
          <p className="font-ui text-sm font-semibold text-gray-900">Review Before Uploading</p>
          <div className="grid grid-cols-2 gap-2 font-ui text-xs text-gray-600">
            <div><span className="font-semibold">Service:</span> {primaryServiceLabel || "—"}</div>
            <div><span className="font-semibold">Location:</span> {resolvedLocation || "—"}</div>
            <div><span className="font-semibold">Filename:</span> <span className="font-mono">{finalFilename}</span></div>
            <div><span className="font-semibold">Files:</span> {files.length} selected</div>
          </div>
          <label className="flex cursor-pointer items-center gap-2 font-ui text-sm text-charcoal">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded border-gray-300 accent-red"
            />
            Publish immediately
          </label>
          <button
            type="submit"
            disabled={!canUpload}
            title={!canUpload && !isUploading ? "Select a service, location, and at least one file first" : undefined}
            className="w-full rounded-xl bg-red py-3 font-ui text-base font-semibold text-white transition-colors hover:bg-red-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading
              ? "Uploading..."
              : `Upload ${files.length > 0 ? files.length + " " : ""}File${files.length !== 1 ? "s" : ""}`}
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
                  <div className="h-full rounded-full bg-red transition-all duration-300" style={{ width: `${status.progress}%` }} />
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
              {lastCompletedBatch.assetIds.length} file{lastCompletedBatch.assetIds.length === 1 ? "" : "s"} saved.
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
