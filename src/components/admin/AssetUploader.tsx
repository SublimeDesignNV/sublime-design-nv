"use client";

import { FormEvent, useState } from "react";
import ServiceMetadataFields from "@/components/admin/ServiceMetadataFields";
import { uploadFileToCloudinary } from "@/lib/cloudinaryUpload";
import { SERVICE_TAGS } from "@/lib/serviceTags";

type UploadStatus = {
  name: string;
  state: "pending" | "uploading" | "saving" | "success" | "error";
  message?: string;
};

export default function AssetUploader() {
  const [files, setFiles] = useState<File[]>([]);
  const [primaryService, setPrimaryService] = useState("");
  const [secondaryServices, setSecondaryServices] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [serviceMetadata, setServiceMetadata] = useState<Record<string, unknown>>({});
  const [published, setPublished] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statuses, setStatuses] = useState<UploadStatus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const canUpload =
    files.length > 0 && Boolean(primaryService) && Boolean(title.trim()) && !isUploading;

  function updateStatus(name: string, next: Partial<UploadStatus>) {
    setStatuses((current) =>
      current.map((item) => (item.name === name ? { ...item, ...next } : item)),
    );
  }

  function handleServiceChange(nextService: string) {
    setPrimaryService(nextService);
    setSecondaryServices((current) => current.filter((slug) => slug !== nextService));
    setServiceMetadata({});
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!canUpload) return;

    setIsUploading(true);
    setStatuses(
      files.map((file) => ({
        name: file.name,
        state: "pending",
      })),
    );

    for (const file of files) {
      try {
        updateStatus(file.name, { state: "uploading" });
        const uploadResult = await uploadFileToCloudinary(file);

        updateStatus(file.name, { state: "saving" });
        const tagSlugs = [primaryService, ...secondaryServices].filter(Boolean);
        const saveResponse = await fetch("/api/admin/assets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...uploadResult,
            title: title.trim(),
            description: description.trim() || undefined,
            location: location.trim() || undefined,
            primaryServiceSlug: primaryService,
            serviceMetadata,
            published,
            tagSlugs,
          }),
        });

        if (!saveResponse.ok) {
          const body = (await saveResponse.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(body.error || "Failed to save asset metadata.");
        }

        updateStatus(file.name, { state: "success" });
      } catch (uploadError) {
        updateStatus(file.name, {
          state: "error",
          message:
            uploadError instanceof Error ? uploadError.message : "Unknown upload error.",
        });
      }
    }

    setIsUploading(false);
    window.dispatchEvent(new Event("admin-assets-refresh"));
  }

  return (
    <section className="rounded-lg border border-gray-warm bg-white p-6 shadow-sm">
      <h2 className="text-2xl text-charcoal">Upload Assets</h2>

      <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
        <fieldset>
          <legend className="font-ui text-sm font-semibold text-charcoal">Primary Service</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
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
          <p className="mt-2 text-xs text-gray-mid">
            Choose the main service this asset should lead with.
          </p>
        </fieldset>

        <fieldset>
          <legend className="font-ui text-sm font-semibold text-charcoal">
            Secondary Services
          </legend>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SERVICE_TAGS.filter((service) => service.slug !== primaryService).map((service) => (
              <label
                key={service.slug}
                className="font-ui flex items-center gap-2 rounded-sm border border-gray-warm bg-cream/40 px-3 py-2 text-sm text-charcoal"
              >
                <input
                  type="checkbox"
                  checked={secondaryServices.includes(service.slug)}
                  onChange={() => toggleSecondaryService(service.slug)}
                />
                <span>{service.label}</span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-mid">
            Add any other service pages where this hybrid project should appear.
          </p>
        </fieldset>

        <label className="block">
          <span className="font-ui text-sm font-semibold text-charcoal">Files</span>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(event) => {
              const selected = Array.from(event.target.files || []);
              setFiles(selected);
            }}
            className="mt-1 block w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal file:mr-4 file:rounded-sm file:border-0 file:bg-navy file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
        </label>

        <label className="block">
          <span className="font-ui text-sm font-semibold text-charcoal">Title</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy"
            placeholder="Double barn door install in Anthem"
          />
        </label>

        <label className="block">
          <span className="font-ui text-sm font-semibold text-charcoal">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-1 min-h-[96px] w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy"
            placeholder="Short scope summary, finish notes, or install details"
          />
        </label>

        <label className="block">
          <span className="font-ui text-sm font-semibold text-charcoal">Location</span>
          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy"
            placeholder="Summerlin, Henderson, Anthem, etc."
          />
        </label>

        <ServiceMetadataFields
          service={primaryService}
          values={serviceMetadata}
          onChange={updateMetadataField}
        />

        <label className="font-ui flex items-center gap-2 text-sm text-charcoal">
          <input
            type="checkbox"
            checked={published}
            onChange={(event) => setPublished(event.target.checked)}
          />
          Publish immediately
        </label>

        {error ? <p className="font-ui text-sm text-red">{error}</p> : null}

        <button
          type="submit"
          disabled={!canUpload}
          className="font-ui rounded-sm bg-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isUploading ? "Uploading..." : "Upload Selected Files"}
        </button>
      </form>

      {statuses.length > 0 ? (
        <div className="mt-6 space-y-2">
          {statuses.map((status) => (
            <div
              key={status.name}
              className="font-ui rounded-sm border border-gray-warm bg-cream px-3 py-2 text-sm text-charcoal"
            >
              <span className="font-semibold">{status.name}</span>: {status.state}
              {status.message ? ` — ${status.message}` : ""}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
