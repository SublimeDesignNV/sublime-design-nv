"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ImageIcon, Pencil, Trash2, Video, X } from "lucide-react";
import ServiceMetadataFields from "@/components/admin/ServiceMetadataFields";
import { SERVICE_TAGS } from "@/lib/serviceTags";
import { sanitizeServiceAssetMetadata } from "@/lib/serviceAssetMetadata";

type AdminAsset = {
  id: string;
  kind: "IMAGE" | "VIDEO";
  secureUrl: string;
  title: string | null;
  description: string | null;
  location: string | null;
  primaryServiceSlug: string | null;
  primaryServiceLabel: string | null;
  serviceMetadata: Record<string, unknown> | null;
  published: boolean;
  createdAt: string;
  tags: Array<{ slug: string; title: string }>;
};

type AssetsResponse = {
  assets: AdminAsset[];
};

type Filter = "all" | "published" | "unpublished";

type EditFormState = {
  id: string;
  title: string;
  description: string;
  location: string;
  primaryServiceSlug: string;
  secondaryServiceSlugs: string[];
  serviceMetadata: Record<string, unknown>;
  published: boolean;
};

function toEditForm(asset: AdminAsset): EditFormState {
  const primaryServiceSlug = asset.primaryServiceSlug ?? asset.tags[0]?.slug ?? "";

  return {
    id: asset.id,
    title: asset.title ?? "",
    description: asset.description ?? "",
    location: asset.location ?? "",
    primaryServiceSlug,
    secondaryServiceSlugs: asset.tags
      .map((tag) => tag.slug)
      .filter((slug) => slug !== primaryServiceSlug),
    serviceMetadata: asset.serviceMetadata ?? {},
    published: asset.published,
  };
}

export default function AssetTable() {
  const [assets, setAssets] = useState<AdminAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);

  const loadAssets = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/assets", { cache: "no-store" });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Failed to load assets.");
      }
      const data = (await response.json()) as AssetsResponse;
      setAssets(data.assets);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unknown error.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAssets();
  }, [loadAssets]);

  useEffect(() => {
    function onRefresh() {
      void loadAssets();
    }
    window.addEventListener("admin-assets-refresh", onRefresh);
    return () => window.removeEventListener("admin-assets-refresh", onRefresh);
  }, [loadAssets]);

  const filteredAssets = useMemo(() => {
    if (filter === "published") return assets.filter((asset) => asset.published);
    if (filter === "unpublished") return assets.filter((asset) => !asset.published);
    return assets;
  }, [assets, filter]);

  async function togglePublished(id: string, nextPublished: boolean) {
    const response = await fetch(`/api/admin/assets/${id}/publish`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: nextPublished }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error || "Failed to update published status.");
    }

    setAssets((current) =>
      current.map((asset) =>
        asset.id === id ? { ...asset, published: nextPublished } : asset,
      ),
    );
  }

  function startEditing(asset: AdminAsset) {
    setEditingAssetId(asset.id);
    setEditForm(toEditForm(asset));
    setError(null);
  }

  function closeEditor() {
    setEditingAssetId(null);
    setEditForm(null);
    setIsSaving(false);
  }

  function updateEditForm<K extends keyof EditFormState>(key: K, value: EditFormState[K]) {
    setEditForm((current) => (current ? { ...current, [key]: value } : current));
  }

  function updateMetadataField(key: string, value: string | number | boolean) {
    setEditForm((current) =>
      current
        ? {
            ...current,
            serviceMetadata: {
              ...current.serviceMetadata,
              [key]: value,
            },
          }
        : current,
    );
  }

  function changePrimaryService(nextSlug: string) {
    setEditForm((current) => {
      if (!current) return current;

      const nextMetadata = sanitizeServiceAssetMetadata(nextSlug, current.serviceMetadata);
      const secondaryServiceSlugs = current.secondaryServiceSlugs.filter(
        (slug) => slug !== nextSlug,
      );

      return {
        ...current,
        primaryServiceSlug: nextSlug,
        secondaryServiceSlugs,
        serviceMetadata: nextMetadata,
      };
    });
  }

  function toggleSecondaryService(slug: string) {
    setEditForm((current) => {
      if (!current) return current;

      return {
        ...current,
        secondaryServiceSlugs: current.secondaryServiceSlugs.includes(slug)
          ? current.secondaryServiceSlugs.filter((item) => item !== slug)
          : [...current.secondaryServiceSlugs, slug],
      };
    });
  }

  async function saveChanges() {
    if (!editForm) return;

    setIsSaving(true);
    setError(null);

    const response = await fetch(`/api/admin/assets/${editForm.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editForm.title.trim(),
        description: editForm.description.trim() || undefined,
        location: editForm.location.trim() || undefined,
        primaryServiceSlug: editForm.primaryServiceSlug,
        tagSlugs: [editForm.primaryServiceSlug, ...editForm.secondaryServiceSlugs],
        serviceMetadata: editForm.serviceMetadata,
        published: editForm.published,
      }),
    });

    setIsSaving(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error || "Failed to save asset changes.");
      return;
    }

    await loadAssets();
    closeEditor();
  }

  async function deleteAsset(asset: AdminAsset) {
    const confirmed = window.confirm(
      `Delete "${asset.title || "Untitled asset"}" from the portfolio database? This phase only removes the DB record and leaves the Cloudinary file in place.`,
    );
    if (!confirmed) return;

    setDeletingAssetId(asset.id);
    setError(null);

    const response = await fetch(`/api/admin/assets/${asset.id}`, {
      method: "DELETE",
    });

    setDeletingAssetId(null);

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error || "Failed to delete asset.");
      return;
    }

    setAssets((current) => current.filter((item) => item.id !== asset.id));
    if (editingAssetId === asset.id) {
      closeEditor();
    }
  }

  return (
    <section className="rounded-lg border border-gray-warm bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl text-charcoal">Assets</h2>
        <div className="flex flex-wrap gap-2">
          {(["all", "published", "unpublished"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`font-ui rounded-sm border px-3 py-1 text-sm transition-colors ${
                filter === value
                  ? "border-red bg-red text-white"
                  : "border-gray-warm text-charcoal hover:border-red hover:text-red"
              }`}
            >
              {value === "all"
                ? "All"
                : value === "published"
                  ? "Published"
                  : "Unpublished"}
            </button>
          ))}
          <button
            type="button"
            onClick={() => void loadAssets()}
            className="font-ui rounded-sm border border-gray-warm px-3 py-1 text-sm text-charcoal transition-colors hover:border-navy hover:text-navy"
          >
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? <p className="font-ui mt-4 text-sm text-gray-mid">Loading...</p> : null}
      {error ? <p className="font-ui mt-4 text-sm text-red">{error}</p> : null}

      {!isLoading && !error ? (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-warm text-left">
                <th className="font-ui py-2 pr-3 text-xs uppercase tracking-wide text-gray-mid">
                  Preview
                </th>
                <th className="font-ui py-2 pr-3 text-xs uppercase tracking-wide text-gray-mid">
                  Asset
                </th>
                <th className="font-ui py-2 pr-3 text-xs uppercase tracking-wide text-gray-mid">
                  Services
                </th>
                <th className="font-ui py-2 pr-3 text-xs uppercase tracking-wide text-gray-mid">
                  Published
                </th>
                <th className="font-ui py-2 pr-3 text-xs uppercase tracking-wide text-gray-mid">
                  Created
                </th>
                <th className="font-ui py-2 text-xs uppercase tracking-wide text-gray-mid">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="border-b border-gray-warm/60 align-top">
                  <td className="py-2 pr-3">
                    {asset.kind === "IMAGE" ? (
                      <img
                        src={asset.secureUrl}
                        alt={asset.tags[0]?.title || "Asset preview"}
                        className="h-16 w-16 rounded-sm bg-cream object-contain p-1"
                      />
                    ) : (
                      <span className="inline-flex h-16 w-16 items-center justify-center rounded-sm bg-gray-warm text-charcoal">
                        <Video className="h-5 w-5" />
                      </span>
                    )}
                  </td>
                  <td className="font-ui py-2 pr-3 text-sm text-charcoal">
                    <div className="inline-flex items-center gap-1">
                      {asset.kind === "IMAGE" ? (
                        <ImageIcon className="h-4 w-4 text-gray-mid" />
                      ) : (
                        <Video className="h-4 w-4 text-gray-mid" />
                      )}
                      <span>{asset.title || "Untitled asset"}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-mid">
                      {asset.location || asset.kind}
                    </p>
                    {asset.description ? (
                      <p className="mt-1 max-w-md text-xs text-gray-mid">{asset.description}</p>
                    ) : null}
                  </td>
                  <td className="font-ui py-2 pr-3 text-sm text-charcoal">
                    <p>{asset.primaryServiceLabel || "Unassigned"}</p>
                    {asset.tags.length > 0 ? (
                      <div className="mt-2 flex max-w-xs flex-wrap gap-1.5">
                        {asset.tags.map((tag) => (
                          <span
                            key={tag.slug}
                            className="rounded-full border border-gray-200 bg-cream px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-charcoal"
                          >
                            {tag.title}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </td>
                  <td className="py-2 pr-3">
                    <label className="font-ui inline-flex items-center gap-2 text-sm text-charcoal">
                      <input
                        type="checkbox"
                        checked={asset.published}
                        onChange={async (event) => {
                          try {
                            await togglePublished(asset.id, event.target.checked);
                          } catch (toggleError) {
                            setError(
                              toggleError instanceof Error
                                ? toggleError.message
                                : "Failed to update publish state.",
                            );
                          }
                        }}
                      />
                      {asset.published ? "Yes" : "No"}
                    </label>
                  </td>
                  <td className="font-ui py-2 pr-3 text-sm text-gray-mid">
                    {new Date(asset.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(asset)}
                        className="inline-flex items-center gap-1 rounded-sm border border-gray-warm px-3 py-1.5 font-ui text-xs text-charcoal transition hover:border-navy hover:text-navy"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteAsset(asset)}
                        disabled={deletingAssetId === asset.id}
                        className="inline-flex items-center gap-1 rounded-sm border border-red/30 px-3 py-1.5 font-ui text-xs text-red transition hover:border-red disabled:opacity-60"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {deletingAssetId === asset.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAssets.length === 0 ? (
            <p className="font-ui py-4 text-sm text-gray-mid">No assets found.</p>
          ) : null}
        </div>
      ) : null}

      {editForm ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-charcoal/55 p-4 md:p-8">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl text-charcoal">Edit Asset</h3>
                <p className="mt-1 font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">
                  Update metadata, service placement, and publish status
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-full border border-gray-200 p-2 text-gray-mid transition hover:border-red hover:text-red"
                aria-label="Close editor"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="font-ui text-sm font-semibold text-charcoal">Title</span>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(event) => updateEditForm("title", event.target.value)}
                  className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy"
                />
              </label>

              <label className="block">
                <span className="font-ui text-sm font-semibold text-charcoal">Description</span>
                <textarea
                  value={editForm.description}
                  onChange={(event) => updateEditForm("description", event.target.value)}
                  className="mt-1 min-h-[96px] w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy"
                />
              </label>

              <label className="block">
                <span className="font-ui text-sm font-semibold text-charcoal">Location</span>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(event) => updateEditForm("location", event.target.value)}
                  className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy"
                />
              </label>

              <fieldset>
                <legend className="font-ui text-sm font-semibold text-charcoal">
                  Primary Service
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {SERVICE_TAGS.map((service) => (
                    <button
                      key={service.slug}
                      type="button"
                      onClick={() => changePrimaryService(service.slug)}
                      className={`font-ui rounded-sm border px-3 py-2 text-sm transition ${
                        editForm.primaryServiceSlug === service.slug
                          ? "border-red bg-red text-white"
                          : "border-gray-warm text-charcoal hover:border-red hover:text-red"
                      }`}
                    >
                      {service.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="font-ui text-sm font-semibold text-charcoal">
                  Secondary Services
                </legend>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {SERVICE_TAGS.filter((service) => service.slug !== editForm.primaryServiceSlug).map(
                    (service) => (
                      <label
                        key={service.slug}
                        className="font-ui flex items-center gap-2 rounded-sm border border-gray-warm bg-cream/40 px-3 py-2 text-sm text-charcoal"
                      >
                        <input
                          type="checkbox"
                          checked={editForm.secondaryServiceSlugs.includes(service.slug)}
                          onChange={() => toggleSecondaryService(service.slug)}
                        />
                        <span>{service.label}</span>
                      </label>
                    ),
                  )}
                </div>
              </fieldset>

              <ServiceMetadataFields
                service={editForm.primaryServiceSlug}
                values={editForm.serviceMetadata}
                onChange={updateMetadataField}
              />

              <label className="font-ui flex items-center gap-2 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={editForm.published}
                  onChange={(event) => updateEditForm("published", event.target.checked)}
                />
                Published
              </label>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-sm border border-gray-warm px-4 py-2 font-ui text-sm text-charcoal transition hover:border-gray-mid"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveChanges()}
                disabled={
                  isSaving ||
                  !editForm.title.trim() ||
                  !editForm.primaryServiceSlug
                }
                className="rounded-sm bg-red px-4 py-2 font-ui text-sm font-semibold text-white transition hover:bg-red-dark disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
