"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AREA_LIST } from "@/content/areas";
import { SERVICE_TAGS } from "@/lib/serviceTags";

type UploadBatchSummary = {
  uploadBatchId: string;
  assetCount: number;
  createdAt: string;
  updatedAt: string;
  linkedAssetCount: number;
  publishedAssetCount: number;
  draftAssetCount: number;
  serviceSlugs: string[];
  status: "linked" | "partial" | "unlinked";
  thumbnails: string[];
  assetIds: string[];
  publicIds: string[];
  projectIds: string[];
  projectSlugs: string[];
  projectTitles: string[];
};

type ProjectOption = {
  id: string;
  slug: string;
  title: string;
  status: "DRAFT" | "READY" | "PUBLISHED";
  published: boolean;
  assetCount: number;
};

type ProjectRecord = {
  id: string;
  title: string;
  slug: string;
  serviceSlug: string | null;
  areaSlug: string | null;
  location: string | null;
  description: string | null;
  status: "DRAFT" | "READY" | "PUBLISHED";
  published: boolean;
  featured: boolean;
  homepageSpotlight: boolean;
  heroEligible: boolean;
  spotlightRank: number | null;
  coverAssetId: string | null;
  assets: Array<{ id: string }>;
};

type OrphanAsset = {
  id: string;
  title: string | null;
  description: string | null;
  location: string | null;
  primaryServiceSlug: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  renderable: boolean;
  diagnosis: string;
  createdAt: string;
  uploadBatchId: string | null;
  published: boolean;
};

type RecentPublishingAction = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "READY" | "PUBLISHED";
  coverImageUrl: string | null;
  serviceSlug: string | null;
  serviceLabel: string | null;
  areaSlug: string | null;
  areaLabel: string | null;
  assetCount: number;
  featured: boolean;
  homepageSpotlight: boolean;
  updatedAt: string;
  diagnosis: string;
};

type ProjectsResponse = {
  ok: boolean;
  projects: ProjectRecord[];
  orphanAssets: OrphanAsset[];
  projectOptions: ProjectOption[];
  uploadBatches: UploadBatchSummary[];
  recentPublishingActions: RecentPublishingAction[];
};

type BatchActionState = {
  uploadBatchId: string;
  title: string;
  slug: string;
  serviceSlug: string;
  areaSlug: string;
  description: string;
  location: string;
  status: "DRAFT" | "READY" | "PUBLISHED";
  featured: boolean;
  homepageSpotlight: boolean;
  heroEligible: boolean;
  spotlightRank: string;
  coverAssetId: string;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getPreviewImage(src?: string | null, fallback?: string | null) {
  return src || fallback || "";
}

export default function RecentUploadBatches({
  focusBatchId,
}: {
  focusBatchId?: string;
}) {
  const [data, setData] = useState<ProjectsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentFilter, setRecentFilter] = useState<"all" | "today" | "week">(
    focusBatchId ? "all" : "week",
  );
  const [showUnlinkedOnly, setShowUnlinkedOnly] = useState(true);
  const [showPublishedOnly, setShowPublishedOnly] = useState(false);
  const [showDraftOnly, setShowDraftOnly] = useState(false);
  const [batchForm, setBatchForm] = useState<BatchActionState | null>(null);
  const [linkBatchId, setLinkBatchId] = useState<string | null>(null);
  const [linkProjectId, setLinkProjectId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [deletingBatchId, setDeletingBatchId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/projects${recentFilter === "all" ? "" : `?recent=${recentFilter}`}`,
        { cache: "no-store" },
      );
      const body = (await response.json().catch(() => ({}))) as ProjectsResponse & {
        error?: string;
      };
      if (!response.ok || !body.ok) {
        throw new Error(body.error || "Failed to load upload batches.");
      }
      setData(body);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unknown error.");
    } finally {
      setIsLoading(false);
    }
  }, [recentFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    function refresh() {
      void load();
    }
    window.addEventListener("admin-assets-created", refresh);
    window.addEventListener("admin-projects-refresh", refresh);
    window.addEventListener("admin-assets-refresh", refresh);
    return () => {
      window.removeEventListener("admin-assets-created", refresh);
      window.removeEventListener("admin-projects-refresh", refresh);
      window.removeEventListener("admin-assets-refresh", refresh);
    };
  }, [load]);

  const filteredBatches = useMemo(() => {
    const batches = data?.uploadBatches ?? [];
    return batches.filter((batch) => {
      if (focusBatchId && batch.uploadBatchId !== focusBatchId) return false;
      if (showUnlinkedOnly && batch.linkedAssetCount > 0) return false;
      if (showPublishedOnly && batch.publishedAssetCount === 0) return false;
      if (showDraftOnly && batch.draftAssetCount === 0) return false;
      return true;
    });
  }, [data?.uploadBatches, focusBatchId, showUnlinkedOnly, showPublishedOnly, showDraftOnly]);

  const recentUnlinkedAssets = useMemo(() => {
    const assets = data?.orphanAssets ?? [];
    return assets.filter((asset) => {
      if (showPublishedOnly && !asset.published) return false;
      if (showDraftOnly && asset.published) return false;
      return true;
    });
  }, [data?.orphanAssets, showPublishedOnly, showDraftOnly]);

  function startCreateProject(batch: UploadBatchSummary) {
    const leadService = batch.serviceSlugs[0] ?? "";
    const title = batch.projectTitles[0] || "";
    setBatchForm({
      uploadBatchId: batch.uploadBatchId,
      title,
      slug: title ? slugify(title) : "",
      serviceSlug: leadService,
      areaSlug: "",
      description: "",
      location: "",
      status: "DRAFT",
      featured: false,
      homepageSpotlight: false,
      heroEligible: false,
      spotlightRank: "",
      coverAssetId: batch.assetIds[0] ?? "",
    });
    setLinkBatchId(null);
  }

  async function submitBatchProject() {
    if (!batchForm || !data) return;
    const batch = data.uploadBatches.find((item) => item.uploadBatchId === batchForm.uploadBatchId);
    if (!batch) return;

    setIsSubmitting(true);
    setError(null);
    const response = await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: batchForm.title.trim(),
        slug: batchForm.slug.trim() || undefined,
        serviceSlug: batchForm.serviceSlug || undefined,
        areaSlug: batchForm.areaSlug || undefined,
        description: batchForm.description.trim() || undefined,
        location: batchForm.location.trim() || undefined,
        status: batchForm.status,
        featured: batchForm.featured,
        homepageSpotlight: batchForm.homepageSpotlight,
        heroEligible: batchForm.heroEligible,
        spotlightRank: batchForm.spotlightRank ? Number(batchForm.spotlightRank) : null,
        coverAssetId: batchForm.coverAssetId || batch.assetIds[0],
        assetIds: batch.assetIds,
      }),
    });
    setIsSubmitting(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error || "Failed to create project from batch.");
      return;
    }

    setBatchForm(null);
    await load();
    window.dispatchEvent(new Event("admin-projects-refresh"));
  }

  async function linkBatchToExistingProject() {
    if (!data || !linkBatchId || !linkProjectId) return;
    const batch = data.uploadBatches.find((item) => item.uploadBatchId === linkBatchId);
    const project = data.projects.find((item) => item.id === linkProjectId);
    if (!batch || !project) return;

    setIsSubmitting(true);
    setError(null);
    const response = await fetch(`/api/admin/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: project.title,
        slug: project.slug,
        serviceSlug: project.serviceSlug || undefined,
        areaSlug: project.areaSlug || undefined,
        location: project.location || undefined,
        description: project.description || undefined,
        status: project.status,
        featured: project.featured,
        homepageSpotlight: project.homepageSpotlight,
        heroEligible: project.heroEligible,
        spotlightRank: project.spotlightRank,
        coverAssetId: project.coverAssetId || batch.assetIds[0],
        assetIds: Array.from(new Set([...project.assets.map((asset) => asset.id), ...batch.assetIds])),
      }),
    });
    setIsSubmitting(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error || "Failed to link batch to project.");
      return;
    }
    setLinkBatchId(null);
    setLinkProjectId("");
    await load();
    window.dispatchEvent(new Event("admin-projects-refresh"));
  }

  async function updateBatchPublish(batch: UploadBatchSummary, published: boolean) {
    if (!data) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await Promise.all(
        batch.assetIds.map(async (assetId) => {
          const response = await fetch(`/api/admin/assets/${assetId}/publish`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ published }),
          });
          if (!response.ok) {
            const body = (await response.json().catch(() => ({}))) as { error?: string };
            throw new Error(body.error || "Failed to update photo publish state.");
          }
        }),
      );
      await load();
      window.dispatchEvent(new Event("admin-assets-refresh"));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update batch.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteBatch(batch: UploadBatchSummary) {
    if (!window.confirm(`Delete all ${batch.assetCount} photo${batch.assetCount === 1 ? "" : "s"} in this batch? This cannot be undone.`)) return;
    setDeletingBatchId(batch.uploadBatchId);
    setError(null);
    try {
      await Promise.all(
        batch.assetIds.map(async (assetId) => {
          const response = await fetch(`/api/admin/assets/${assetId}`, { method: "DELETE" });
          if (!response.ok) {
            const body = (await response.json().catch(() => ({}))) as { error?: string };
            throw new Error(body.error || "Failed to delete asset.");
          }
        }),
      );
      await load();
      window.dispatchEvent(new Event("admin-assets-refresh"));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete batch.");
    } finally {
      setDeletingBatchId(null);
    }
  }

  return (
    <section className="rounded-lg border border-gray-warm bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl text-charcoal">Recent Upload Batches</h2>
          <p className="mt-2 font-ui text-sm text-gray-mid">
            Upload, open the batch, create or link a project, then move it from draft to ready to published without hunting through the full photo library.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "today", "week"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setRecentFilter(filter)}
              className={`rounded-sm border px-3 py-2 font-ui text-xs ${
                recentFilter === filter
                  ? "border-red bg-red text-white"
                  : "border-gray-warm text-charcoal"
              }`}
            >
              {filter === "all" ? "All time" : filter === "today" ? "Today" : "This week"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <label className="font-ui inline-flex items-center gap-2 text-xs text-charcoal">
          <input
            type="checkbox"
            checked={showUnlinkedOnly}
            onChange={(event) => setShowUnlinkedOnly(event.target.checked)}
          />
          Unlinked only
        </label>
        <label className="font-ui inline-flex items-center gap-2 text-xs text-charcoal">
          <input
            type="checkbox"
            checked={showPublishedOnly}
            onChange={(event) => setShowPublishedOnly(event.target.checked)}
          />
          Published only
        </label>
        <label className="font-ui inline-flex items-center gap-2 text-xs text-charcoal">
          <input
            type="checkbox"
            checked={showDraftOnly}
            onChange={(event) => setShowDraftOnly(event.target.checked)}
          />
          Draft photos only
        </label>
      </div>

      {isLoading ? <p className="mt-4 font-ui text-sm text-gray-mid">Loading...</p> : null}
      {error ? <p className="mt-4 font-ui text-sm text-red">{error}</p> : null}

      {!isLoading ? (
        <div className="mt-6 grid gap-4">
          {filteredBatches.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-cream p-5">
              <p className="font-ui text-sm text-gray-mid">No recent upload batches match the current filters.</p>
            </div>
          ) : (
            filteredBatches.map((batch) => (
              <article key={batch.uploadBatchId} className="rounded-xl border border-gray-200 bg-cream/50 p-4">
                <div className="flex items-start gap-4">
                  {/* Thumbnail — fixed 120px, fallback shows service label */}
                  <button
                    type="button"
                    onClick={() => batch.thumbnails[0] && setLightboxUrl(batch.thumbnails[0])}
                    className="group relative h-[90px] w-[120px] flex-shrink-0 overflow-hidden rounded-lg bg-gray-warm"
                  >
                    {batch.thumbnails[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={batch.thumbnails[0]}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    )}
                    <div className="flex h-full items-center justify-center p-1 text-center font-ui text-[10px] text-gray-mid">
                      {SERVICE_TAGS.find((s) => s.slug === batch.serviceSlugs[0])?.label ?? "Photo"}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                      <span className="font-ui text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">View</span>
                    </div>
                  </button>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-ui text-xs font-semibold text-charcoal">
                        Batch {batch.uploadBatchId.slice(0, 8)}
                      </span>
                      <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 font-ui text-[10px] uppercase tracking-[0.16em] text-gray-mid">
                        {batch.assetCount} photo{batch.assetCount === 1 ? "" : "s"}
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 font-ui text-[10px] uppercase tracking-[0.16em] ${
                        batch.status === "linked"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : batch.status === "partial"
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : "border-red/20 bg-red/5 text-red"
                      }`}>
                        {batch.status}
                      </span>
                    </div>
                    <p className="mt-1.5 font-ui text-[11px] text-gray-mid">
                      {new Date(batch.updatedAt).toLocaleString()} · {batch.publishedAssetCount} published · {batch.draftAssetCount} draft
                    </p>
                    {batch.projectTitles.length ? (
                      <p className="mt-1 font-ui text-xs text-charcoal">
                        {batch.projectTitles.join(", ")}
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setLinkBatchId(batch.uploadBatchId); setBatchForm(null); }}
                        className="mt-1 font-ui text-xs text-navy hover:underline"
                      >
                        Link to a project →
                      </button>
                    )}
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {batch.serviceSlugs.map((slug) => (
                        <span
                          key={slug}
                          className="rounded-full border border-red/20 bg-white px-2 py-0.5 font-ui text-[10px] uppercase tracking-[0.14em] text-red"
                        >
                          {SERVICE_TAGS.find((service) => service.slug === slug)?.label ?? slug}
                        </span>
                      ))}
                    </div>
                    {batch.publicIds[0] && (
                      <p className="mt-1.5 truncate font-mono text-[10px] text-gray-mid" title={batch.publicIds[0]}>
                        {batch.publicIds[0]}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-shrink-0 flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => startCreateProject(batch)}
                      className="whitespace-nowrap rounded-sm bg-red px-3 py-1.5 font-ui text-xs font-semibold text-white"
                    >
                      Create Project
                    </button>
                    <button
                      type="button"
                      onClick={() => void updateBatchPublish(batch, true)}
                      disabled={isSubmitting}
                      className="whitespace-nowrap rounded-sm border border-emerald-300 bg-emerald-50 px-3 py-1.5 font-ui text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                    >
                      ⚡ Quick Publish
                    </button>
                    <button
                      type="button"
                      onClick={() => void updateBatchPublish(batch, false)}
                      disabled={isSubmitting}
                      className="whitespace-nowrap rounded-sm border border-gray-warm px-3 py-1.5 font-ui text-xs text-charcoal disabled:opacity-60"
                    >
                      Hide Photos
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteBatch(batch)}
                      disabled={isSubmitting || deletingBatchId === batch.uploadBatchId}
                      className="whitespace-nowrap rounded-sm border border-red/20 px-3 py-1.5 font-ui text-xs text-red hover:border-red hover:bg-red/5 disabled:opacity-60"
                    >
                      {deletingBatchId === batch.uploadBatchId ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>

                {linkBatchId === batch.uploadBatchId ? (
                  <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                    <p className="font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">
                      Link Batch to Existing Project
                    </p>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                      <select
                        value={linkProjectId}
                        onChange={(event) => setLinkProjectId(event.target.value)}
                        className="rounded-sm border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal"
                      >
                        <option value="">Choose a project</option>
                        {(data?.projectOptions ?? []).map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.title} ({project.status.toLowerCase()})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => void linkBatchToExistingProject()}
                        disabled={!linkProjectId || isSubmitting}
                        className="rounded-sm bg-navy px-4 py-2 font-ui text-sm font-semibold text-white disabled:opacity-60"
                      >
                        Link Batch
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            ))
          )}
        </div>
      ) : null}

      {batchForm ? (
        <div className="fixed inset-0 z-[70] flex items-start justify-center bg-charcoal/55 p-4 md:p-8">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl text-charcoal">Create Project from Batch</h3>
                <p className="mt-1 font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">
                  Fast batch completion flow
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBatchForm(null)}
                className="rounded-full border border-gray-200 p-2 text-gray-mid"
              >
                ×
              </button>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="font-ui text-sm font-semibold text-charcoal">Title</span>
                <input
                  type="text"
                  value={batchForm.title}
                  onChange={(event) =>
                    setBatchForm((current) =>
                      current
                        ? {
                            ...current,
                            title: event.target.value,
                            slug: current.slug || slugify(event.target.value),
                          }
                        : current,
                    )
                  }
                  className="mt-1 w-full rounded-sm border border-gray-warm px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="font-ui text-sm font-semibold text-charcoal">Slug</span>
                <input
                  type="text"
                  value={batchForm.slug}
                  onChange={(event) =>
                    setBatchForm((current) =>
                      current ? { ...current, slug: slugify(event.target.value) } : current,
                    )
                  }
                  className="mt-1 w-full rounded-sm border border-gray-warm px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="font-ui text-sm font-semibold text-charcoal">Service</span>
                <select
                  value={batchForm.serviceSlug}
                  onChange={(event) =>
                    setBatchForm((current) =>
                      current ? { ...current, serviceSlug: event.target.value } : current,
                    )
                  }
                  className="mt-1 w-full rounded-sm border border-gray-warm px-3 py-2 text-sm"
                >
                  <option value="">Select service</option>
                  {SERVICE_TAGS.map((service) => (
                    <option key={service.slug} value={service.slug}>
                      {service.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="font-ui text-sm font-semibold text-charcoal">Area</span>
                <select
                  value={batchForm.areaSlug}
                  onChange={(event) =>
                    setBatchForm((current) =>
                      current ? { ...current, areaSlug: event.target.value } : current,
                    )
                  }
                  className="mt-1 w-full rounded-sm border border-gray-warm px-3 py-2 text-sm"
                >
                  <option value="">Optional area</option>
                  {AREA_LIST.map((area) => (
                    <option key={area.slug} value={area.slug}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="font-ui text-sm font-semibold text-charcoal">Location</span>
                <input
                  type="text"
                  value={batchForm.location}
                  onChange={(event) =>
                    setBatchForm((current) =>
                      current ? { ...current, location: event.target.value } : current,
                    )
                  }
                  className="mt-1 w-full rounded-sm border border-gray-warm px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="font-ui text-sm font-semibold text-charcoal">Status</span>
                <select
                  value={batchForm.status}
                  onChange={(event) =>
                    setBatchForm((current) =>
                      current ? { ...current, status: event.target.value as BatchActionState["status"] } : current,
                    )
                  }
                  className="mt-1 w-full rounded-sm border border-gray-warm px-3 py-2 text-sm"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="READY">Ready</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="font-ui text-sm font-semibold text-charcoal">Description</span>
                <textarea
                  value={batchForm.description}
                  onChange={(event) =>
                    setBatchForm((current) =>
                      current ? { ...current, description: event.target.value } : current,
                    )
                  }
                  className="mt-1 min-h-[96px] w-full rounded-sm border border-gray-warm px-3 py-2 text-sm"
                />
              </label>
              <label className="font-ui flex items-center gap-2 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={batchForm.featured}
                  onChange={(event) =>
                    setBatchForm((current) =>
                      current ? { ...current, featured: event.target.checked } : current,
                    )
                  }
                />
                Homepage featured
              </label>
              <label className="font-ui flex items-center gap-2 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={batchForm.homepageSpotlight}
                  onChange={(event) =>
                    setBatchForm((current) =>
                      current ? { ...current, homepageSpotlight: event.target.checked } : current,
                    )
                  }
                />
                Homepage spotlight
              </label>
              <label className="font-ui flex items-center gap-2 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={batchForm.heroEligible}
                  onChange={(event) =>
                    setBatchForm((current) =>
                      current ? { ...current, heroEligible: event.target.checked } : current,
                    )
                  }
                />
                Hero eligible
              </label>
              <label className="block">
                <span className="font-ui text-sm font-semibold text-charcoal">Spotlight Order</span>
                <input
                  type="number"
                  min={1}
                  value={batchForm.spotlightRank}
                  onChange={(event) =>
                    setBatchForm((current) =>
                      current ? { ...current, spotlightRank: event.target.value } : current,
                    )
                  }
                  className="mt-1 w-full rounded-sm border border-gray-warm px-3 py-2 text-sm"
                />
              </label>
            </div>

            {data?.uploadBatches
              .find((batch) => batch.uploadBatchId === batchForm.uploadBatchId)
              ?.thumbnails.length ? (
              <div className="mt-6">
                <p className="font-ui text-sm font-semibold text-charcoal">Choose cover image</p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {data.uploadBatches
                    .find((batch) => batch.uploadBatchId === batchForm.uploadBatchId)!
                    .assetIds.map((assetId, index) => {
                      const thumbnail =
                        data.uploadBatches.find((batch) => batch.uploadBatchId === batchForm.uploadBatchId)!
                          .thumbnails[index] ?? "";
                      return (
                        <label key={assetId} className="block">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thumbnail}
                            alt={`Cover option ${index + 1}`}
                            className={`h-24 w-full rounded-lg border object-cover ${
                              batchForm.coverAssetId === assetId ? "border-red" : "border-gray-200"
                            }`}
                          />
                          <span className="mt-2 flex items-center gap-2 font-ui text-xs text-charcoal">
                            <input
                              type="radio"
                              checked={batchForm.coverAssetId === assetId}
                              onChange={() =>
                                setBatchForm((current) =>
                                  current ? { ...current, coverAssetId: assetId } : current,
                                )
                              }
                            />
                            Cover
                          </span>
                        </label>
                      );
                    })}
                </div>
              </div>
            ) : null}

            <div className="mt-6 rounded-xl border border-gray-200 bg-cream p-4">
              <p className="font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">
                Where this will appear
              </p>
              <ul className="mt-3 space-y-2 text-sm text-charcoal">
                <li>{batchForm.status === "PUBLISHED" ? "Yes" : "No"}: `/projects`</li>
                <li>{batchForm.status === "PUBLISHED" ? "Yes" : "No"}: `/projects/[slug]`</li>
                <li>{batchForm.status === "PUBLISHED" ? "Yes" : "No"}: `/gallery`</li>
                <li>{batchForm.status === "PUBLISHED" && batchForm.serviceSlug ? "Yes" : "No"}: `/services/[service]` project section</li>
                <li>{batchForm.status === "PUBLISHED" && batchForm.areaSlug ? "Yes" : "No"}: `/areas/[area]` project section</li>
                <li>{batchForm.status === "PUBLISHED" && batchForm.featured ? "Yes" : "No"}: homepage featured</li>
                <li>{batchForm.status === "PUBLISHED" && batchForm.featured && batchForm.homepageSpotlight ? "Yes" : "No"}: homepage spotlight</li>
              </ul>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setBatchForm(null)}
                className="rounded-sm border border-gray-warm px-4 py-2 font-ui text-sm text-charcoal"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void submitBatchProject()}
                disabled={isSubmitting || !batchForm.title.trim()}
                className="rounded-sm bg-red px-4 py-2 font-ui text-sm font-semibold text-white disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">
              Recent Unlinked Uploads
            </p>
            <h3 className="mt-2 text-xl text-charcoal">Needs project linkage</h3>
          </div>
          <span className="font-ui text-xs uppercase tracking-[0.16em] text-gray-mid">
            {recentUnlinkedAssets.length} photo{recentUnlinkedAssets.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="mt-4 grid gap-3">
          {recentUnlinkedAssets.slice(0, 8).map((asset) => (
            <div key={asset.id} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-cream p-3">
              {getPreviewImage(asset.imageUrl, asset.thumbnailUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getPreviewImage(asset.imageUrl, asset.thumbnailUrl)}
                  alt={asset.title || "Unlinked photo"}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white font-ui text-[10px] uppercase tracking-[0.16em] text-gray-mid">
                  No photo
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-ui text-sm font-semibold text-charcoal">
                  {asset.title || "Untitled photo"}
                </p>
                <p className="mt-1 text-xs text-gray-mid">
                  {asset.location || "No location"} • {new Date(asset.createdAt).toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-red">{asset.diagnosis}</p>
              </div>
              <Link
                href={`/admin?focusAsset=${asset.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm border border-gray-warm px-3 py-2 font-ui text-xs text-charcoal"
              >
                Manage in Photos ↗
              </Link>
            </div>
          ))}
          {!recentUnlinkedAssets.length ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="font-ui text-sm text-emerald-800">
                No recent unlinked uploads match the current filters.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-10">
        <p className="font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">
          Recent Publishing QA
        </p>
        <div className="mt-4 grid gap-3">
          {(data?.recentPublishingActions ?? []).map((action) => (
            <div key={action.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                {action.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={action.coverImageUrl}
                    alt={action.title}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-cream font-ui text-[10px] uppercase tracking-[0.16em] text-gray-mid">
                    No cover
                  </div>
                )}
                <div>
                  <p className="font-ui text-sm font-semibold text-charcoal">{action.title}</p>
                  <p className="mt-1 text-xs text-gray-mid">
                    {action.status.toLowerCase()} • {action.assetCount} photo{action.assetCount === 1 ? "" : "s"} • updated {new Date(action.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/projects/${action.slug}`} className="rounded-sm border border-gray-warm px-3 py-2 font-ui text-xs text-charcoal">
                  Public page
                </Link>
                <Link href="/projects" className="rounded-sm border border-gray-warm px-3 py-2 font-ui text-xs text-charcoal">
                  Projects index
                </Link>
                {action.serviceSlug ? (
                  <Link href={`/services/${action.serviceSlug}`} className="rounded-sm border border-gray-warm px-3 py-2 font-ui text-xs text-charcoal">
                    Service page
                  </Link>
                ) : null}
                {action.areaSlug ? (
                  <Link href={`/areas/${action.areaSlug}`} className="rounded-sm border border-gray-warm px-3 py-2 font-ui text-xs text-charcoal">
                    Area page
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Change 4 — Lightbox */}
      {lightboxUrl ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute right-4 top-4 rounded-full border border-white/40 bg-black/40 px-3 py-1.5 font-ui text-sm text-white hover:bg-black/60"
          >
            ✕ Close
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxUrl}
            alt="Photo preview"
            className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </section>
  );
}
