"use client";

import { FormEvent, useMemo, useState } from "react";
import { uploadFileToCloudinary } from "@/lib/cloudinaryUpload";
import { SERVICE_TAGS } from "@/lib/serviceTags";

type UploadStatus = {
  name: string;
  state: "pending" | "uploading" | "saving" | "success" | "error";
  message?: string;
};

export default function AssetUploader() {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [alt, setAlt] = useState("");
  const [published, setPublished] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statuses, setStatuses] = useState<UploadStatus[]>([]);
  const [error, setError] = useState<string | null>(null);

  const canUpload = useMemo(
    () => files.length > 0 && selectedTags.length > 0 && !isUploading,
    [files.length, isUploading, selectedTags.length],
  );

  function updateStatus(name: string, next: Partial<UploadStatus>) {
    setStatuses((current) =>
      current.map((item) => (item.name === name ? { ...item, ...next } : item)),
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
        const saveResponse = await fetch("/api/admin/assets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...uploadResult,
            alt: alt || undefined,
            published,
            tagSlugs: selectedTags,
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
      <p className="font-ui mt-2 text-sm text-gray-mid">
        Upload images or videos directly to Cloudinary, then save metadata and tags to
        the portfolio database.
      </p>
      <p className="font-ui mt-2 text-xs text-gray-mid">
        Public service pages only show assets that are tagged to a canonical service and marked
        published. Use &ldquo;Publish immediately&rdquo; here or turn publishing on in the asset list
        below after upload.
      </p>

      <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="font-ui text-sm font-semibold text-charcoal">
            Files (images/videos)
          </span>
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

        <fieldset>
          <legend className="font-ui text-sm font-semibold text-charcoal">
            Service Tags
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SERVICE_TAGS.map((service) => {
              const checked = selectedTags.includes(service.slug);
              return (
                <label
                  key={service.slug}
                  className="font-ui flex items-center gap-2 rounded-sm border border-gray-warm px-2 py-1 text-sm text-charcoal"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => {
                      setSelectedTags((current) => {
                        if (event.target.checked) {
                          return [...current, service.slug];
                        }
                        return current.filter((slug) => slug !== service.slug);
                      });
                    }}
                  />
                  {service.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        <label className="block">
          <span className="font-ui text-sm font-semibold text-charcoal">
            Alt Text (optional)
          </span>
          <input
            type="text"
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy"
            placeholder="e.g. Floating shelf install in Summerlin"
          />
        </label>

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
