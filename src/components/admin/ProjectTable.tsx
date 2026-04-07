"use client";
import { ArrowDown, ArrowUp, Pencil, Share2, Trash2, Unlink, X } from "lucide-react";
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
  instagramCaption: string | null;
  facebookCaption: string | null;
  hashtagSet: string | null;
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

type SocialResult = {
  instagramCaption: string;
  facebookCaption: string;
  hashtagSet: string;
} | null;

type ScheduledPostRecord = {
  id: string;
  platform: string;
  caption: string;
  status: string;
  scheduledFor: string | null;
  postedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
};

export default function ProjectTable() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [orphans, setOrphans] = useState<OrphanAsset[]>([]);
  const [editForm, setEditForm] = useState<ProjectEditForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter / sort / search
  const [filterService, setFilterService] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");
  const [searchQuery, setSearchQuery] = useState("");

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkActing, setIsBulkActing] = useState(false);

  // Social modal
  const [socialProject, setSocialProject] = useState<ProjectRecord | null>(null);
  const [socialResult, setSocialResult] = useState<SocialResult>(null);
  const [isGeneratingSocial, setIsGeneratingSocial] = useState(false);
  const [socialTab, setSocialTab] = useState<"compose" | "history">("compose");
  const [socialPlatform, setSocialPlatform] = useState<"both" | "instagram" | "facebook">("both");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [scheduleMode, setScheduleMode] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPostRecord[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

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

  async function bulkPublish() {
    if (!selectedIds.length) return;
    setIsBulkActing(true);
    for (const id of selectedIds) {
      await fetch(`/api/admin/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED", published: true }),
      });
    }
    setSelectedIds([]);
    setIsBulkActing(false);
    await loadProjects();
  }

  async function bulkFeature() {
    if (!selectedIds.length) return;
    setIsBulkActing(true);
    for (const id of selectedIds) {
      await fetch(`/api/admin/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: true }),
      });
    }
    setSelectedIds([]);
    setIsBulkActing(false);
    await loadProjects();
  }

  async function bulkDelete() {
    if (!selectedIds.length) return;
    const confirmed = window.confirm(`Delete ${selectedIds.length} project${selectedIds.length === 1 ? "" : "s"}? This cannot be undone.`);
    if (!confirmed) return;
    setIsBulkActing(true);
    for (const id of selectedIds) {
      await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    }
    setSelectedIds([]);
    setIsBulkActing(false);
    await loadProjects();
  }

  async function loadScheduledPosts(projectId: string) {
    setIsLoadingPosts(true);
    const response = await fetch(`/api/admin/social/schedule?projectId=${projectId}`);
    setIsLoadingPosts(false);
    if (!response.ok) return;
    const data = (await response.json()) as { posts: ScheduledPostRecord[] };
    setScheduledPosts(data.posts ?? []);
  }

  async function openSocialModal(project: ProjectRecord) {
    setSocialProject(project);
    setSocialTab("compose");
    setSocialPlatform("both");
    setSelectedAssets(project.assets.slice(0, 1).map((a) => a.id));
    setScheduleMode(false);
    setScheduledFor("");
    // Pre-fill with stored captions if present
    if (project.instagramCaption || project.facebookCaption) {
      setSocialResult({
        instagramCaption: project.instagramCaption ?? "",
        facebookCaption: project.facebookCaption ?? "",
        hashtagSet: project.hashtagSet ?? "",
      });
    } else {
      setSocialResult(null);
    }
    await loadScheduledPosts(project.id);
  }

  async function runSocialGenerate() {
    if (!socialProject) return;
    setIsGeneratingSocial(true);
    const response = await fetch(`/api/admin/projects/${socialProject.id}/social`, { method: "POST" });
    setIsGeneratingSocial(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error || "Failed to generate social copy.");
      return;
    }
    const data = (await response.json()) as { instagramCaption: string; facebookCaption: string; hashtagSet: string };
    setSocialResult(data);
    await loadProjects();
  }

  async function handleSocialPost() {
    if (!socialProject || !socialResult) return;
    setIsScheduling(true);
    const caption =
      socialPlatform === "facebook"
        ? socialResult.facebookCaption
        : socialResult.instagramCaption;
    const response = await fetch("/api/admin/social/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: socialProject.id,
        platform: socialPlatform,
        caption,
        hashtags: socialResult.hashtagSet || undefined,
        mediaAssetIds: selectedAssets,
        scheduledFor: scheduleMode && scheduledFor ? scheduledFor : null,
      }),
    });
    setIsScheduling(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error || "Failed to schedule post.");
      return;
    }
    // If post now: immediately trigger publish
    if (!scheduleMode) {
      const schedData = (await response.json()) as { post: { id: string } };
      await fetch("/api/admin/social/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: schedData.post.id }),
      });
    }
    await loadScheduledPosts(socialProject.id);
    setSocialTab("history");
  }

  async function cancelScheduledPost(postId: string) {
    await fetch(`/api/admin/social/${postId}/cancel`, { method: "PATCH" });
    if (socialProject) await loadScheduledPosts(socialProject.id);
  }

  // Derived filtered + sorted projects
  const filteredProjects = useMemo(() => {
    let result = projects;
    if (filterService) result = result.filter((p) => p.serviceSlug === filterService);
    if (filterStatus) result = result.filter((p) => p.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q) || p.slug.includes(q));
    }
    if (sortBy === "oldest") result = [...result].sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
    else if (sortBy === "title") result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    // "newest" is default sort from API (updatedAt desc)
    return result;
  }, [projects, filterService, filterStatus, searchQuery, sortBy]);

  const uniqueServices = useMemo(
    () => Array.from(new Set(projects.map((p) => p.serviceSlug).filter(Boolean))).map((slug) => ({
      slug: slug!,
      label: projects.find((p) => p.serviceSlug === slug)?.serviceLabel ?? slug!,
    })),
    [projects],
  );

  const stats = useMemo(() => ({
    total: projects.length,
    published: projects.filter((p) => p.status === "PUBLISHED").length,
    ready: projects.filter((p) => p.status === "READY").length,
    draft: projects.filter((p) => p.status === "DRAFT").length,
    featured: projects.filter((p) => p.featured).length,
  }), [projects]);

  return (
    <section className="rounded-lg border border-gray-warm bg-white p-6 shadow-sm">
      <h2 className="text-2xl text-charcoal">Projects</h2>

      {/* Stats bar */}
      {!isLoading && projects.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-4">
          {[
            { label: "Total", value: stats.total, color: "text-charcoal" },
            { label: "Published", value: stats.published, color: "text-green-700" },
            { label: "Ready", value: stats.ready, color: "text-blue-700" },
            { label: "Draft", value: stats.draft, color: "text-amber-700" },
            { label: "Featured", value: stats.featured, color: "text-red" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-baseline gap-1.5">
              <span className={`font-ui text-lg font-semibold ${color}`}>{value}</span>
              <span className="font-ui text-xs uppercase tracking-[0.14em] text-gray-mid">{label}</span>
            </div>
          ))}
        </div>
      ) : null}

      {/* Filter / sort / search */}
      <div className="mt-4 flex flex-wrap gap-2">
        <select value={filterService} onChange={(e) => setFilterService(e.target.value)} className="rounded-sm border border-gray-warm bg-white px-3 py-1.5 font-ui text-xs text-charcoal outline-none focus:border-navy">
          <option value="">All Services</option>
          {uniqueServices.map((s) => (
            <option key={s.slug} value={s.slug}>{s.label}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-sm border border-gray-warm bg-white px-3 py-1.5 font-ui text-xs text-charcoal outline-none focus:border-navy">
          <option value="">All Statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="READY">Ready</option>
          <option value="DRAFT">Draft</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="rounded-sm border border-gray-warm bg-white px-3 py-1.5 font-ui text-xs text-charcoal outline-none focus:border-navy">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="title">A–Z</option>
        </select>
        <input
          type="search"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="min-w-[140px] flex-1 rounded-sm border border-gray-warm bg-white px-3 py-1.5 font-ui text-xs text-charcoal outline-none focus:border-navy"
        />
      </div>

      {error ? <p className="mt-4 font-ui text-sm text-red">{error}</p> : null}
      {isLoading ? <p className="mt-4 font-ui text-sm text-gray-mid">Loading...</p> : null}

      {/* Bulk action bar */}
      {selectedIds.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5">
          <span className="font-ui text-xs text-blue-700">{selectedIds.length} selected</span>
          <button type="button" onClick={() => void bulkPublish()} disabled={isBulkActing} className="rounded-sm border border-green-300 bg-green-50 px-3 py-1 font-ui text-xs text-green-700 transition hover:bg-green-100 disabled:opacity-50">Publish</button>
          <button type="button" onClick={() => void bulkFeature()} disabled={isBulkActing} className="rounded-sm border border-red/20 bg-red/5 px-3 py-1 font-ui text-xs text-red transition hover:bg-red/10 disabled:opacity-50">Feature</button>
          <button type="button" onClick={() => void bulkDelete()} disabled={isBulkActing} className="rounded-sm border border-red/30 px-3 py-1 font-ui text-xs text-red transition hover:border-red disabled:opacity-50">Delete</button>
          <button type="button" onClick={() => setSelectedIds([])} className="ml-auto font-ui text-xs text-gray-mid hover:text-charcoal">Clear</button>
        </div>
      ) : null}

      {!isLoading ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => {
            const thumbAssets = project.assets
              .filter((a) => a.renderable)
              .slice(0, 2);
            const coverFallback = project.coverThumbnailUrl ?? project.coverImageUrl;
            const statusColors: Record<ProjectRecord["status"], string> = {
              DRAFT: "border-amber-200 bg-amber-50 text-amber-700",
              READY: "border-blue-200 bg-blue-50 text-blue-700",
              PUBLISHED: "border-green-200 bg-green-50 text-green-700",
            };
            const needsAttention =
              !project.coverImageUrl ||
              !project.description ||
              project.status === "DRAFT" ||
              project.assetCount === 0;
            const isSelected = selectedIds.includes(project.id);
            const completionLabel =
              project.completionMonth && project.completionYear
                ? new Date(project.completionYear, project.completionMonth - 1).toLocaleString("en-US", { month: "short", year: "numeric" })
                : null;
            return (
              <article key={project.id} className={`relative flex flex-col rounded-xl border bg-white overflow-hidden transition ${isSelected ? "border-blue-400 ring-1 ring-blue-300" : "border-gray-warm/70"}`}>
                {/* Select checkbox */}
                <label className="absolute left-2 top-2 z-10 flex h-5 w-5 cursor-pointer items-center justify-center rounded bg-white/80 shadow-sm">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => setSelectedIds((prev) => e.target.checked ? [...prev, project.id] : prev.filter((id) => id !== project.id))}
                    className="h-3.5 w-3.5"
                  />
                </label>

                {/* Needs attention indicator */}
                {needsAttention ? (
                  <span className="absolute right-2 top-2 z-10 h-2 w-2 rounded-full bg-red shadow-sm" title="Needs attention" />
                ) : null}

                {/* Thumbnail strip */}
                <div className="flex h-32 bg-gray-100">
                  {thumbAssets.length > 0 ? thumbAssets.map((asset) => {
                    const isVideo = asset.resourceType === "video";
                    const src = isVideo
                      ? (asset.secureUrl ?? undefined)
                      : (asset.thumbnailUrl ?? asset.imageUrl ?? coverFallback ?? undefined);
                    return (
                      <div key={asset.id} className="relative flex-1 overflow-hidden">
                        {isVideo ? (
                          <>
                            <video
                              src={src}
                              className="h-full w-full object-cover"
                              preload="none"
                              muted
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white drop-shadow"><polygon points="5,3 19,12 5,21" /></svg>
                            </div>
                          </>
                        ) : src ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={src}
                            alt=""
                            className="h-full w-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <span className="font-ui text-xs text-gray-400">No photo</span>
                          </div>
                        )}
                      </div>
                    );
                  }) : coverFallback ? (
                    <div className="relative flex-1 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coverFallback} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  ) : (
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
                    {completionLabel ? ` · ${completionLabel}` : ""}
                  </p>

                  {/* Actions */}
                  <div className="mt-auto flex flex-wrap gap-2 pt-1">
                    {project.status === "PUBLISHED" ? (
                      <a href={`/projects/${project.slug}`} target="_blank" className="inline-flex items-center rounded-sm border border-gray-warm px-2.5 py-1 font-ui text-xs text-charcoal transition hover:border-navy hover:text-navy">
                        View →
                      </a>
                    ) : (
                      <span
                        className="inline-flex cursor-not-allowed items-center rounded-sm border border-gray-200 px-2.5 py-1 font-ui text-xs text-gray-300"
                        title={`Project is ${project.status.toLowerCase()} — publish to view`}
                      >
                        View
                      </span>
                    )}
                    <button type="button" onClick={() => setEditForm(toEditForm(project))} className="inline-flex items-center gap-1 rounded-sm border border-gray-warm px-2.5 py-1 font-ui text-xs text-charcoal transition hover:border-navy hover:text-navy">
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                    <button type="button" onClick={() => void openSocialModal(project)} className="inline-flex items-center gap-1 rounded-sm border border-gray-warm px-2.5 py-1 font-ui text-xs text-charcoal transition hover:border-navy hover:text-navy">
                      <Share2 className="h-3 w-3" />
                      Social
                    </button>
                    <button type="button" onClick={() => void deleteProject(project)} className="ml-auto inline-flex items-center gap-1 rounded-sm border border-red/30 px-2.5 py-1 font-ui text-xs text-red transition hover:border-red">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
          {!filteredProjects.length && projects.length > 0 ? (
            <p className="col-span-full font-ui text-sm text-gray-mid">No projects match the current filters.</p>
          ) : null}
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

      {/* Social modal */}
      {socialProject ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-charcoal/55 p-4 md:p-8">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl text-charcoal">Share to Social</h3>
                <p className="mt-1 font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">{socialProject.title}</p>
              </div>
              <button type="button" onClick={() => { setSocialProject(null); setSocialResult(null); }} className="rounded-full border border-gray-200 p-2 text-gray-mid transition hover:border-red hover:text-red">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-4 flex gap-1 border-b border-gray-warm">
              {(["compose", "history"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSocialTab(tab)}
                  className={`px-4 py-2 font-ui text-xs uppercase tracking-[0.14em] transition ${socialTab === tab ? "border-b-2 border-navy text-navy" : "text-gray-mid hover:text-charcoal"}`}
                >
                  {tab === "compose" ? "Compose" : `History ${scheduledPosts.length > 0 ? `(${scheduledPosts.length})` : ""}`}
                </button>
              ))}
            </div>

            {socialTab === "compose" ? (
              <div className="mt-5 space-y-5">
                {/* Platform selector */}
                <div>
                  <p className="font-ui text-xs uppercase tracking-[0.16em] text-gray-mid">Platform</p>
                  <div className="mt-2 flex gap-2">
                    {(["both", "instagram", "facebook"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setSocialPlatform(p)}
                        className={`rounded-sm border px-3 py-1.5 font-ui text-xs transition ${socialPlatform === p ? "border-navy bg-navy text-white" : "border-gray-warm text-charcoal hover:border-navy"}`}
                      >
                        {p === "both" ? "Both" : p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate button */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void runSocialGenerate()}
                    disabled={isGeneratingSocial}
                    className="rounded-sm bg-navy px-4 py-2 font-ui text-sm font-semibold text-white transition hover:bg-navy/90 disabled:opacity-60"
                  >
                    {isGeneratingSocial ? "Generating..." : socialResult ? "Regenerate" : "Generate AI Copy"}
                  </button>
                  {!socialResult && !isGeneratingSocial ? (
                    <p className="font-ui text-xs text-gray-mid">Generate AI-written captions and hashtags</p>
                  ) : null}
                </div>

                {/* Captions */}
                {socialResult ? (
                  <div className="space-y-4">
                    {[
                      { label: "Instagram Caption", value: socialResult.instagramCaption, key: "instagram" },
                      { label: "Facebook Post", value: socialResult.facebookCaption, key: "facebook" },
                      { label: "Hashtags", value: socialResult.hashtagSet, key: "hashtags" },
                    ].map(({ label, value, key }) => (
                      <div key={key}>
                        <div className="flex items-center justify-between">
                          <p className="font-ui text-xs uppercase tracking-[0.16em] text-gray-mid">{label}</p>
                          <button type="button" onClick={() => void navigator.clipboard.writeText(value)} className="font-ui text-xs text-navy transition hover:text-red">Copy</button>
                        </div>
                        <textarea
                          readOnly
                          value={value}
                          rows={key === "hashtags" ? 3 : 5}
                          className="mt-1 w-full rounded-sm border border-gray-warm bg-cream/40 px-3 py-2 font-ui text-sm text-charcoal outline-none"
                        />
                        <p className="mt-0.5 font-ui text-[10px] text-gray-mid">{value.length} chars</p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {/* Photo selector */}
                {socialProject.assets.length > 0 ? (
                  <div>
                    <p className="font-ui text-xs uppercase tracking-[0.16em] text-gray-mid">Photos to include</p>
                    <div className="mt-2 grid grid-cols-5 gap-1.5">
                      {socialProject.assets.map((asset) => {
                        const isSelected = selectedAssets.includes(asset.id);
                        const order = selectedAssets.indexOf(asset.id) + 1;
                        return (
                          <div
                            key={asset.id}
                            onClick={() => setSelectedAssets((prev) =>
                              prev.includes(asset.id)
                                ? prev.filter((id) => id !== asset.id)
                                : [...prev, asset.id]
                            )}
                            className={`relative cursor-pointer overflow-hidden rounded border-2 ${isSelected ? "border-navy" : "border-transparent"}`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={asset.thumbnailUrl ?? asset.imageUrl ?? undefined} alt="" className="aspect-square w-full object-cover" />
                            {isSelected ? (
                              <div className="absolute inset-0 flex items-center justify-center bg-navy/30">
                                <span className="font-ui text-sm font-bold text-white">{order}</span>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-1 font-ui text-[10px] text-gray-mid">{selectedAssets.length} photo{selectedAssets.length === 1 ? "" : "s"} selected (up to 10 for carousel)</p>
                  </div>
                ) : null}

                {/* Schedule toggle */}
                {socialResult ? (
                  <div className="space-y-3 border-t border-gray-warm pt-4">
                    <label className="flex items-center gap-2 font-ui text-sm text-charcoal">
                      <input type="checkbox" checked={scheduleMode} onChange={(e) => setScheduleMode(e.target.checked)} className="h-4 w-4" />
                      Schedule for later
                    </label>
                    {scheduleMode ? (
                      <input
                        type="datetime-local"
                        value={scheduledFor}
                        onChange={(e) => setScheduledFor(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        className="rounded-sm border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none focus:border-navy"
                      />
                    ) : null}
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => void handleSocialPost()}
                        disabled={isScheduling || (scheduleMode && !scheduledFor)}
                        className="rounded-sm bg-red px-4 py-2 font-ui text-sm font-semibold text-white transition hover:bg-red-dark disabled:opacity-60"
                      >
                        {isScheduling ? "Saving..." : scheduleMode ? "Schedule Post" : "Post Now"}
                      </button>
                      <p className="font-ui text-xs text-gray-mid">
                        {!process.env.NEXT_PUBLIC_SOCIAL_ENABLED
                          ? "Credentials not connected yet — post will be queued and sent when accounts are ready."
                          : `Will post to ${socialPlatform === "both" ? "Instagram + Facebook" : socialPlatform}`}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              /* History tab */
              <div className="mt-5">
                {isLoadingPosts ? (
                  <p className="font-ui text-sm text-gray-mid">Loading...</p>
                ) : scheduledPosts.length === 0 ? (
                  <p className="font-ui text-sm text-gray-mid">No posts yet for this project.</p>
                ) : (
                  <div className="space-y-3">
                    {scheduledPosts.map((post) => {
                      const statusIcon = post.status === "posted" ? "✓" : post.status === "failed" ? "✗" : post.status === "cancelled" ? "—" : "⏱";
                      const statusColor = post.status === "posted" ? "text-green-700" : post.status === "failed" ? "text-red" : post.status === "cancelled" ? "text-gray-mid" : "text-blue-700";
                      const when = post.scheduledFor
                        ? new Date(post.scheduledFor).toLocaleString()
                        : new Date(post.createdAt).toLocaleString();
                      return (
                        <div key={post.id} className="flex items-center gap-3 rounded-lg border border-gray-warm bg-cream/30 px-4 py-3">
                          <span className={`font-ui text-sm font-semibold ${statusColor}`}>{statusIcon}</span>
                          <div className="min-w-0 flex-1">
                            <p className="font-ui text-xs text-charcoal">{when} · <span className="capitalize">{post.platform}</span></p>
                            <p className={`font-ui text-[10px] uppercase tracking-[0.14em] ${statusColor}`}>{post.status}</p>
                            {post.errorMessage ? <p className="mt-0.5 font-ui text-xs text-red">{post.errorMessage}</p> : null}
                          </div>
                          {post.status === "pending" ? (
                            <button type="button" onClick={() => void cancelScheduledPost(post.id)} className="font-ui text-xs text-gray-mid transition hover:text-red">Cancel</button>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
