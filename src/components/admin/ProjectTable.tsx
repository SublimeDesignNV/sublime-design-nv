"use client";
import { ArrowDown, ArrowUp, Pencil, Trash2, Unlink, Wrench, X } from "lucide-react";
import ProjectFinishesEditor from "@/components/admin/ProjectFinishesEditor";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AREA_LIST } from "@/content/areas";
import { SERVICE_TAGS } from "@/lib/serviceTags";

type ProjectAsset = {
  id: string;
  position: number;
  title: string | null;
  location: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  secureUrl: string | null;
  resourceType: "image" | "video";
  published: boolean;
  renderable: boolean;
};

type ProjectReadinessChecklist = {
  hasTitle: boolean;
  hasSlug: boolean;
  hasService: boolean;
  hasCoverImage: boolean;
  hasLinkedAssets: boolean;
  hasDescription: boolean;
  hasAreaOrLocation: boolean;
  readyForHomepageFeature: boolean;
};

type ProjectPlacements = {
  projectsIndex: boolean;
  projectPage: boolean;
  galleryPage: boolean;
  servicePage: boolean;
  areaPage: boolean;
  homepageFeatured: boolean;
  homepageSpotlight: boolean;
  homepageHeroEligible: boolean;
};

type ProjectRecord = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "READY" | "PUBLISHED";
  published: boolean;
  featured: boolean;
  homepageSpotlight: boolean;
  heroEligible: boolean;
  spotlightRank: number | null;
  serviceSlug: string | null;
  serviceLabel: string | null;
  areaSlug: string | null;
  areaLabel: string | null;
  location: string | null;
  description: string | null;
  primaryCtaLabel: string | null;
  primaryCtaHref: string | null;
  testimonialPresent: boolean;
  completionYear: number | null;
  completionMonth: number | null;
  internalNotes: string | null;
  featuredReason: string | null;
  coverAssetId: string | null;
  coverImageUrl: string | null;
  coverThumbnailUrl: string | null;
  assetCount: number;
  publishedAssetCount: number;
  assets: ProjectAsset[];
  diagnosis: string;
  readiness: ProjectReadinessChecklist;
  placements: ProjectPlacements;
  updatedAt: string;
};

type OrphanAsset = {
  id: string;
  title: string | null;
  location: string | null;
  imageUrl?: string | null;
  thumbnailUrl: string | null;
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
  recentPublishingActions: RecentPublishingAction[];
};

type ProjectEditForm = {
  id: string;
  title: string;
  slug: string;
  description: string;
  serviceSlug: string;
  areaSlug: string;
  location: string;
  status: "DRAFT" | "READY" | "PUBLISHED";
  featured: boolean;
  homepageSpotlight: boolean;
  heroEligible: boolean;
  spotlightRank: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  testimonialPresent: boolean;
  completionYear: string;
  completionMonth: string;
  internalNotes: string;
  featuredReason: string;
  coverAssetId: string;
  assetIds: string[];
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toEditForm(project: ProjectRecord): ProjectEditForm {
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    description: project.description || "",
    serviceSlug: project.serviceSlug || "",
    areaSlug: project.areaSlug || "",
    location: project.location || "",
    status: project.status,
    featured: project.featured,
    homepageSpotlight: project.homepageSpotlight,
    heroEligible: project.heroEligible,
    spotlightRank: project.spotlightRank?.toString() || "",
    primaryCtaLabel: project.primaryCtaLabel || "",
    primaryCtaHref: project.primaryCtaHref || "",
    testimonialPresent: project.testimonialPresent,
    completionYear: project.completionYear?.toString() || "",
    completionMonth: project.completionMonth?.toString() || "",
    internalNotes: project.internalNotes || "",
    featuredReason: project.featuredReason || "",
    coverAssetId: project.coverAssetId || project.assets[0]?.id || "",
    assetIds: project.assets.map((asset) => asset.id),
  };
}

function moveItem(ids: string[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= ids.length) return ids;
  const copy = [...ids];
  const [item] = copy.splice(index, 1);
  copy.splice(nextIndex, 0, item);
  return copy;
}

function readinessLabel(value: boolean) {
  return value ? "Ready" : "Missing";
}

function getAdminProjectPreviewSrc(source: {
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  coverImageUrl?: string | null;
  coverThumbnailUrl?: string | null;
}) {
  return source.imageUrl || source.coverImageUrl || source.thumbnailUrl || source.coverThumbnailUrl || "";
}

export default function ProjectTable() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [orphans, setOrphans] = useState<OrphanAsset[]>([]);
  const [recentPublishingActions, setRecentPublishingActions] = useState<RecentPublishingAction[]>([]);
  const [editForm, setEditForm] = useState<ProjectEditForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isBackfilling, setIsBackfilling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/projects", { cache: "no-store" });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Failed to load projects.");
      }
      const data = (await response.json()) as ProjectsResponse;
      setProjects(data.projects ?? []);
      setOrphans(data.orphanAssets ?? []);
      setRecentPublishingActions(data.recentPublishingActions ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unknown error.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    function onRefresh() {
      void loadProjects();
    }
    window.addEventListener("admin-projects-refresh", onRefresh);
    return () => window.removeEventListener("admin-projects-refresh", onRefresh);
  }, [loadProjects]);

  const editProject = useMemo(
    () => projects.find((project) => project.id === editForm?.id) ?? null,
    [projects, editForm],
  );

  const spotlightProjects = useMemo(
    () =>
      projects
        .filter((project) => project.featured)
        .sort((a, b) => (a.spotlightRank ?? 999) - (b.spotlightRank ?? 999)),
    [projects],
  );

  async function saveProject() {
    if (!editForm) return;
    setIsSaving(true);
    setError(null);
    const response = await fetch(`/api/admin/projects/${editForm.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editForm.title.trim(),
        slug: editForm.slug.trim() || undefined,
        description: editForm.description.trim() || undefined,
        serviceSlug: editForm.serviceSlug || undefined,
        areaSlug: editForm.areaSlug || undefined,
        location: editForm.location.trim() || undefined,
        status: editForm.status,
        featured: editForm.featured,
        homepageSpotlight: editForm.homepageSpotlight,
        heroEligible: editForm.heroEligible,
        spotlightRank: editForm.spotlightRank ? Number(editForm.spotlightRank) : null,
        primaryCtaLabel: editForm.primaryCtaLabel.trim() || undefined,
        primaryCtaHref: editForm.primaryCtaHref.trim() || undefined,
        testimonialPresent: editForm.testimonialPresent,
        completionYear: editForm.completionYear ? Number(editForm.completionYear) : null,
        completionMonth: editForm.completionMonth ? Number(editForm.completionMonth) : null,
        internalNotes: editForm.internalNotes.trim() || undefined,
        featuredReason: editForm.featuredReason.trim() || undefined,
        coverAssetId: editForm.coverAssetId || undefined,
        assetIds: editForm.assetIds,
      }),
    });
    setIsSaving(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error || "Failed to update project.");
      return;
    }

    setEditForm(null);
    await loadProjects();
  }

  async function deleteProject(project: ProjectRecord) {
    const confirmed = window.confirm(
      `Delete project "${project.title}"? Linked photos will remain in the photo library.`,
    );
    if (!confirmed) return;

    const response = await fetch(`/api/admin/projects/${project.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error || "Failed to delete project.");
      return;
    }

    await loadProjects();
    window.dispatchEvent(new Event("admin-assets-refresh"));
  }

  async function runBackfill() {
    setIsBackfilling(true);
    setError(null);
    const response = await fetch("/api/admin/projects/backfill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ autoCreateDrafts: false }),
    });
    setIsBackfilling(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error || "Failed to backfill project records.");
      return;
    }

    await loadProjects();
  }

  return (
    <section className="rounded-lg border border-gray-warm bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl text-charcoal">Projects</h2>
          <p className="font-ui mt-1 text-xs uppercase tracking-[0.16em] text-gray-mid">
            Explicit status, readiness, homepage spotlight control, and visibility preview for every project.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void runBackfill()}
          disabled={isBackfilling}
          className="inline-flex items-center gap-1 rounded-sm border border-gray-warm px-3 py-1.5 font-ui text-xs text-charcoal transition hover:border-navy hover:text-navy disabled:opacity-60"
        >
          <Wrench className="h-3.5 w-3.5" />
          {isBackfilling ? "Repairing..." : "Repair Covers / Audit Orphans"}
        </button>
      </div>

      <details className="mt-5 rounded-xl border border-gray-warm/70 bg-cream/40 p-4">
        <summary className="cursor-pointer list-none font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">
          Secondary project tools
        </summary>
        <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_1fr]">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">
              Homepage spotlight
            </p>
            <div className="mt-3 space-y-3">
              {spotlightProjects.slice(0, 5).map((project) => (
                <div key={project.id} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-cream/40 p-3">
                  {getAdminProjectPreviewSrc(project) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getAdminProjectPreviewSrc(project)}
                      alt={project.title}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cream font-ui text-[10px] uppercase tracking-[0.16em] text-gray-mid">
                      No cover
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-ui text-sm font-semibold text-charcoal">{project.title}</p>
                    <p className="mt-1 text-xs text-gray-mid">
                      {project.status.toLowerCase()} • spotlight {project.spotlightRank ?? "n/a"}
                    </p>
                  </div>
                </div>
              ))}
              {!spotlightProjects.length ? (
                <p className="font-ui text-sm text-gray-mid">No featured projects yet.</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">
              Recent project checks
            </p>
            <div className="mt-3 space-y-3">
              {recentPublishingActions.map((action) => (
                <div key={action.id} className="rounded-lg border border-gray-200 bg-cream/40 p-3">
                  <div className="flex items-center gap-3">
                    {action.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={action.coverImageUrl}
                        alt={action.title}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-ui text-sm font-semibold text-charcoal">{action.title}</p>
                      <p className="mt-1 text-xs text-gray-mid">
                        {action.status.toLowerCase()} • updated {new Date(action.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {!recentPublishingActions.length ? (
                <p className="font-ui text-sm text-gray-mid">No recent updates yet.</p>
              ) : null}
            </div>
          </div>
        </div>
      </details>

      {error ? <p className="mt-4 font-ui text-sm text-red">{error}</p> : null}
      {isLoading ? <p className="mt-4 font-ui text-sm text-gray-mid">Loading...</p> : null}

      {!isLoading ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const thumbAssets = project.assets.slice(0, 2);
            const statusColors: Record<ProjectRecord["status"], string> = {
              DRAFT: "border-amber-200 bg-amber-50 text-amber-700",
              READY: "border-blue-200 bg-blue-50 text-blue-700",
              PUBLISHED: "border-green-200 bg-green-50 text-green-700",
            };
            return (
              <article key={project.id} className="flex flex-col rounded-xl border border-gray-warm/70 bg-white overflow-hidden">
                {/* Thumbnail strip */}
                <div className="flex h-32 bg-gray-100">
                  {thumbAssets.length > 0 ? thumbAssets.map((asset) => (
                    <div key={asset.id} className="relative flex-1 overflow-hidden">
                      {asset.resourceType === "video" ? (
                        <>
                          <video
                            src={asset.secureUrl ?? undefined}
                            className="h-full w-full object-cover"
                            preload="none"
                            muted
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white drop-shadow"><polygon points="5,3 19,12 5,21" /></svg>
                          </div>
                        </>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={asset.thumbnailUrl ?? asset.imageUrl ?? undefined}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                  )) : (
                    <div className="flex flex-1 items-center justify-center text-gray-300">
                      <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" fill="white" /><polyline points="21,15 16,10 5,21" stroke="white" strokeWidth="1.5" fill="none" /></svg>
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="flex flex-1 flex-col gap-3 p-4">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className={`rounded-full border px-2 py-0.5 font-ui text-[10px] uppercase tracking-[0.14em] ${statusColors[project.status]}`}>
                      {project.status.toLowerCase()}
                    </span>
                    {project.serviceLabel ? (
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 font-ui text-[10px] uppercase tracking-[0.14em] text-gray-mid">
                        {project.serviceLabel}
                      </span>
                    ) : null}
                    {project.featured ? (
                      <span className="rounded-full border border-red/20 bg-red/5 px-2 py-0.5 font-ui text-[10px] uppercase tracking-[0.14em] text-red">
                        Featured
                      </span>
                    ) : null}
                    {project.homepageSpotlight ? (
                      <span className="rounded-full border border-red/20 bg-red/5 px-2 py-0.5 font-ui text-[10px] uppercase tracking-[0.14em] text-red">
                        Spotlight
                      </span>
                    ) : null}
                  </div>

                  {/* Title */}
                  <h3 className="line-clamp-2 text-base font-semibold leading-snug text-charcoal">{project.title}</h3>

                  {/* Meta */}
                  <p className="text-xs text-gray-mid">
                    {project.assetCount} photo{project.assetCount === 1 ? "" : "s"}
                    {project.location ? ` · ${project.location}` : ""}
                    {project.areaLabel ? ` · ${project.areaLabel}` : ""}
                  </p>

                  {/* Actions */}
                  <div className="mt-auto flex flex-wrap gap-2 pt-1">
                    <a href={`/projects/${project.slug}`} className="inline-flex items-center rounded-sm border border-gray-warm px-2.5 py-1 font-ui text-xs text-charcoal transition hover:border-navy hover:text-navy">
                      View
                    </a>
                    <button type="button" onClick={() => setEditForm(toEditForm(project))} className="inline-flex items-center gap-1 rounded-sm border border-gray-warm px-2.5 py-1 font-ui text-xs text-charcoal transition hover:border-navy hover:text-navy">
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                    {project.serviceSlug ? (
                      <a href={`/services/${project.serviceSlug}`} className="inline-flex items-center rounded-sm border border-gray-warm px-2.5 py-1 font-ui text-xs text-charcoal transition hover:border-navy hover:text-navy">
                        Service
                      </a>
                    ) : null}
                    <button type="button" onClick={() => void deleteProject(project)} className="ml-auto inline-flex items-center gap-1 rounded-sm border border-red/30 px-2.5 py-1 font-ui text-xs text-red transition hover:border-red">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
          {!projects.length ? (
            <p className="font-ui text-sm text-gray-mid">No projects yet. Create one from selected photos or a recent batch.</p>
          ) : null}
          {orphans.length ? (
            <details className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <summary className="cursor-pointer list-none font-ui text-xs uppercase tracking-[0.16em] text-amber-700">
                Unlinked photo reminder
              </summary>
              <p className="mt-2 text-sm text-amber-800">
                {orphans.length} published, renderable photo{orphans.length === 1 ? "" : "s"} still need project linkage.
                Use Upload Batches or the unlinked photos page to turn them into public projects.
              </p>
            </details>
          ) : null}
        </div>
      ) : null}

      {editForm && editProject ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-charcoal/55 p-4 md:p-8">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl text-charcoal">Edit Project</h3>
                <p className="mt-1 font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">
                  Status, readiness, homepage controls, cover image, ordering, and visibility preview
                </p>
              </div>
              <button type="button" onClick={() => setEditForm(null)} className="rounded-full border border-gray-200 p-2 text-gray-mid transition hover:border-red hover:text-red">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_1fr]">
              <div className="space-y-4">
                <label className="block">
                  <span className="font-ui text-sm font-semibold text-charcoal">Title</span>
                  <input type="text" value={editForm.title} onChange={(event) => setEditForm((current) => current ? { ...current, title: event.target.value } : current)} className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy" />
                </label>
                <label className="block">
                  <span className="font-ui text-sm font-semibold text-charcoal">Description</span>
                  <textarea value={editForm.description} onChange={(event) => setEditForm((current) => current ? { ...current, description: event.target.value } : current)} className="mt-1 min-h-[96px] w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy" />
                </label>
                <div className="block">
                  <span className="font-ui text-sm font-semibold text-charcoal">URL Slug</span>
                  <p className="mt-0.5 font-ui text-xs text-gray-mid">sublimedesignnv.com/projects/{editForm.slug || "…"}</p>
                  <div className="mt-1 flex gap-2">
                    <input type="text" value={editForm.slug} onChange={(event) => setEditForm((current) => current ? { ...current, slug: slugify(event.target.value) } : current)} className="flex-1 rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy" />
                    <button type="button" onClick={() => setEditForm((current) => current ? { ...current, slug: slugify(current.title) } : current)} className="flex-shrink-0 rounded-sm border border-gray-warm px-3 py-2 font-ui text-xs text-gray-mid transition hover:border-navy hover:text-navy" title="Regenerate slug from title">
                      ↺ Sync
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="font-ui text-sm font-semibold text-charcoal">Service</span>
                    <select value={editForm.serviceSlug} onChange={(event) => setEditForm((current) => current ? { ...current, serviceSlug: event.target.value } : current)} className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy">
                      <option value="">Select service</option>
                      {SERVICE_TAGS.map((service) => (
                        <option key={service.slug} value={service.slug}>{service.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="font-ui text-sm font-semibold text-charcoal">Area</span>
                    <select value={editForm.areaSlug} onChange={(event) => setEditForm((current) => current ? { ...current, areaSlug: event.target.value } : current)} className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy">
                      <option value="">Optional area</option>
                      {AREA_LIST.map((area) => (
                        <option key={area.slug} value={area.slug}>{area.name}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="font-ui text-sm font-semibold text-charcoal">Location</span>
                    <input type="text" value={editForm.location} onChange={(event) => setEditForm((current) => current ? { ...current, location: event.target.value } : current)} className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy" />
                  </label>
                  <label className="block">
                    <span className="font-ui text-sm font-semibold text-charcoal">Status</span>
                    <select value={editForm.status} onChange={(event) => setEditForm((current) => current ? { ...current, status: event.target.value as ProjectEditForm["status"] } : current)} className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy">
                      <option value="DRAFT">Draft</option>
                      <option value="READY">Ready</option>
                      <option value="PUBLISHED">Published</option>
                    </select>
                  </label>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="font-ui text-sm font-semibold text-charcoal">Primary CTA Label</span>
                    <input type="text" value={editForm.primaryCtaLabel} onChange={(event) => setEditForm((current) => current ? { ...current, primaryCtaLabel: event.target.value } : current)} className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy" />
                  </label>
                  <label className="block">
                    <span className="font-ui text-sm font-semibold text-charcoal">Primary CTA Route</span>
                    <input type="text" value={editForm.primaryCtaHref} onChange={(event) => setEditForm((current) => current ? { ...current, primaryCtaHref: event.target.value } : current)} className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy" />
                  </label>
                </div>
                <p className="text-xs leading-6 text-gray-mid">
                  Valid internal CTA metadata can show up as an optional secondary public button. The standard site quote CTA still appears as the main fallback when these fields are blank or invalid.
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="block">
                    <span className="font-ui text-sm font-semibold text-charcoal">Completion Date</span>
                    <div className="mt-1 flex gap-2">
                      <select value={editForm.completionMonth} onChange={(event) => setEditForm((current) => current ? { ...current, completionMonth: event.target.value } : current)} className="flex-1 rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy">
                        <option value="">Month</option>
                        {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
                          <option key={i} value={String(i + 1)}>{m}</option>
                        ))}
                      </select>
                      <select value={editForm.completionYear} onChange={(event) => setEditForm((current) => current ? { ...current, completionYear: event.target.value } : current)} className="flex-1 rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy">
                        <option value="">Year</option>
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                          <option key={y} value={String(y)}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <label className="block">
                    <span className="font-ui text-sm font-semibold text-charcoal">Spotlight Rank</span>
                    <input type="number" min="1" value={editForm.spotlightRank} onChange={(event) => setEditForm((current) => current ? { ...current, spotlightRank: event.target.value } : current)} className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy" />
                  </label>
                </div>
                <label className="block">
                  <span className="font-ui text-sm font-semibold text-charcoal">Featured Reason / Spotlight Note</span>
                  <textarea value={editForm.featuredReason} onChange={(event) => setEditForm((current) => current ? { ...current, featuredReason: event.target.value } : current)} className="mt-1 min-h-[72px] w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy" />
                </label>
                <label className="block">
                  <span className="font-ui text-sm font-semibold text-charcoal">Internal Notes</span>
                  <textarea value={editForm.internalNotes} onChange={(event) => setEditForm((current) => current ? { ...current, internalNotes: event.target.value } : current)} className="mt-1 min-h-[72px] w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy" />
                </label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="font-ui flex items-center gap-2 text-sm text-charcoal">
                    <input type="checkbox" checked={editForm.featured} onChange={(event) => setEditForm((current) => current ? { ...current, featured: event.target.checked } : current)} />
                    Homepage featured
                  </label>
                  <label className="font-ui flex items-center gap-2 text-sm text-charcoal">
                    <input type="checkbox" checked={editForm.homepageSpotlight} onChange={(event) => setEditForm((current) => current ? { ...current, homepageSpotlight: event.target.checked } : current)} />
                    Homepage spotlight
                  </label>
                  <label className="font-ui flex items-center gap-2 text-sm text-charcoal">
                    <input type="checkbox" checked={editForm.heroEligible} onChange={(event) => setEditForm((current) => current ? { ...current, heroEligible: event.target.checked } : current)} />
                    Hero eligible
                  </label>
                  <label className="font-ui flex items-center gap-2 text-sm text-charcoal">
                    <input type="checkbox" checked={editForm.testimonialPresent} onChange={(event) => setEditForm((current) => current ? { ...current, testimonialPresent: event.target.checked } : current)} />
                    Testimonial / quote present
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 bg-cream p-4">
                  <p className="font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">Readiness Checklist</p>
                  <div className="mt-3 space-y-2 text-sm text-charcoal">
                    <div>Title: {readinessLabel(editProject.readiness.hasTitle)}</div>
                    <div>Slug: {readinessLabel(editProject.readiness.hasSlug)}</div>
                    <div>Service: {readinessLabel(editProject.readiness.hasService)}</div>
                    <div>Cover image: {readinessLabel(editProject.readiness.hasCoverImage)}</div>
                    <div>Linked photos: {readinessLabel(editProject.readiness.hasLinkedAssets)}</div>
                    <div>Description: {readinessLabel(editProject.readiness.hasDescription)}</div>
                    <div>Area/location: {readinessLabel(editProject.readiness.hasAreaOrLocation)}</div>
                    <div>Homepage feature: {readinessLabel(editProject.readiness.readyForHomepageFeature)}</div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-cream p-4">
                  <p className="font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">Where This Will Appear</p>
                  <div className="mt-3 space-y-2 text-sm text-charcoal">
                    {Object.entries(editProject.placements).map(([key, value]) => (
                      <div key={key}>{value ? "Yes" : "No"}: {key}</div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-ui text-sm font-semibold text-charcoal">Ordered Photos</p>
                  <div className="mt-3 space-y-2">
                    {editForm.assetIds.map((assetId, index) => {
                      const asset = editProject.assets.find((item) => item.id === assetId);
                      if (!asset) return null;
                      return (
                        <div key={asset.id} className="rounded-lg border border-gray-warm bg-cream/40 p-3">
                          <div className="flex items-start gap-3">
                            {asset.resourceType === "video" ? (
                              <span className="relative inline-flex h-16 w-16 flex-shrink-0 overflow-hidden rounded-sm bg-charcoal">
                                {asset.secureUrl ? (
                                  <video src={asset.secureUrl} preload="metadata" muted className="h-full w-full object-cover" />
                                ) : null}
                                <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                </span>
                              </span>
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={asset.imageUrl || asset.thumbnailUrl || ""} alt={asset.title || "Photo"} className="h-16 w-16 rounded-sm bg-white object-cover" />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate font-ui text-sm font-semibold text-charcoal">
                                  #{index + 1} {asset.title || "Untitled photo"}
                                </p>
                                <label className="font-ui inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.16em] text-red">
                                  <input type="radio" name="projectCoverAssetId" checked={editForm.coverAssetId === asset.id} onChange={() => setEditForm((current) => current ? { ...current, coverAssetId: asset.id } : current)} />
                                  Cover
                                </label>
                              </div>
                              <p className="mt-1 text-xs text-gray-mid">{asset.location || "No location"} • {asset.renderable ? "renderable" : "not renderable"}</p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <button type="button" onClick={() => setEditForm((current) => current ? { ...current, assetIds: moveItem(current.assetIds, index, -1) } : current)} className="rounded-sm border border-gray-warm p-1 text-gray-mid hover:border-navy hover:text-navy">
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button type="button" onClick={() => setEditForm((current) => current ? { ...current, assetIds: moveItem(current.assetIds, index, 1) } : current)} className="rounded-sm border border-gray-warm p-1 text-gray-mid hover:border-navy hover:text-navy">
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                              <button type="button" onClick={() => setEditForm((current) => current ? { ...current, assetIds: current.assetIds.filter((id) => id !== asset.id), coverAssetId: current.coverAssetId === asset.id ? current.assetIds.find((id) => id !== asset.id) || "" : current.coverAssetId } : current)} className="rounded-sm border border-red/30 p-1 text-red hover:border-red">
                                <Unlink className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <ProjectFinishesEditor projectId={editForm.id} />

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => setEditForm(null)} className="rounded-sm border border-gray-warm px-4 py-2 font-ui text-sm text-charcoal transition hover:border-gray-mid">
                Cancel
              </button>
              <button type="button" onClick={() => void saveProject()} disabled={isSaving || !editForm.title.trim() || !editForm.assetIds.length} className="rounded-sm bg-red px-4 py-2 font-ui text-sm font-semibold text-white transition hover:bg-red-dark disabled:cursor-not-allowed disabled:opacity-70">
                {isSaving ? "Saving..." : "Save Project"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
