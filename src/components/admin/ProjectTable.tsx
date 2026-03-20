"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Bug, Pencil, Trash2, Unlink, Wrench, X } from "lucide-react";
import { AREA_LIST } from "@/content/areas";
import { SERVICE_TAGS } from "@/lib/serviceTags";

type ProjectAsset = {
  id: string;
  title: string | null;
  location: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  published: boolean;
};

type ProjectRecord = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  featured: boolean;
  spotlightRank: number | null;
  serviceSlug: string | null;
  serviceLabel: string | null;
  areaSlug: string | null;
  areaLabel: string | null;
  location: string | null;
  description: string | null;
  coverAssetId: string | null;
  coverImageUrl: string | null;
  assetCount: number;
  publishedAssetCount: number;
  assets: ProjectAsset[];
  diagnosis: string;
  updatedAt: string;
};

type OrphanAsset = {
  id: string;
  title: string | null;
  location: string | null;
  thumbnailUrl: string | null;
};

type ProjectsResponse = {
  ok: boolean;
  projects: ProjectRecord[];
  orphanAssets: OrphanAsset[];
};

type ProjectEditForm = {
  id: string;
  title: string;
  slug: string;
  description: string;
  serviceSlug: string;
  areaSlug: string;
  location: string;
  published: boolean;
  featured: boolean;
  spotlightRank: string;
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
    published: project.published,
    featured: project.featured,
    spotlightRank: project.spotlightRank?.toString() || "",
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

export default function ProjectTable() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [orphans, setOrphans] = useState<OrphanAsset[]>([]);
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
        ...editForm,
        title: editForm.title.trim(),
        slug: editForm.slug.trim() || undefined,
        description: editForm.description.trim() || undefined,
        serviceSlug: editForm.serviceSlug || undefined,
        areaSlug: editForm.areaSlug || undefined,
        location: editForm.location.trim() || undefined,
        spotlightRank: editForm.spotlightRank ? Number(editForm.spotlightRank) : null,
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
    const confirmed = window.confirm(`Delete project "${project.title}"? Linked assets will remain in the asset library.`);
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
            Public gallery, project pages, and homepage spotlight now read from explicit project records.
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

      {error ? <p className="mt-4 font-ui text-sm text-red">{error}</p> : null}
      {isLoading ? <p className="mt-4 font-ui text-sm text-gray-mid">Loading...</p> : null}

      {!isLoading ? (
        <div className="mt-5 grid gap-4">
          {projects.map((project) => (
            <article key={project.id} className="rounded-xl border border-gray-warm/70 bg-cream/40 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-charcoal">
                      {project.serviceLabel || "No service"}
                    </span>
                    {project.areaLabel ? (
                      <span className="rounded-full border border-gray-200 bg-white px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-gray-mid">
                        {project.areaLabel}
                      </span>
                    ) : null}
                    <span className={`rounded-full border px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] ${project.diagnosis === "renderable_project" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                      {project.diagnosis}
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl text-charcoal">{project.title}</h3>
                  <p className="mt-1 text-sm text-gray-mid">
                    /projects/{project.slug} • {project.assetCount} linked asset{project.assetCount === 1 ? "" : "s"}
                  </p>
                  {project.description ? (
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-mid">{project.description}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setEditForm(toEditForm(project))} className="inline-flex items-center gap-1 rounded-sm border border-gray-warm px-3 py-1.5 font-ui text-xs text-charcoal transition hover:border-navy hover:text-navy">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <a href={`/api/admin/projects/${project.id}/debug`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-sm border border-gray-warm px-3 py-1.5 font-ui text-xs text-charcoal transition hover:border-navy hover:text-navy">
                    <Bug className="h-3.5 w-3.5" />
                    Debug
                  </a>
                  <button type="button" onClick={() => void deleteProject(project)} className="inline-flex items-center gap-1 rounded-sm border border-red/30 px-3 py-1.5 font-ui text-xs text-red transition hover:border-red">
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
          {!projects.length ? (
            <p className="font-ui text-sm text-gray-mid">No projects yet. Create one from selected assets above.</p>
          ) : null}
          {orphans.length ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-ui text-xs uppercase tracking-[0.16em] text-amber-700">Renderable Orphans</p>
              <p className="mt-2 text-sm text-amber-800">
                {orphans.length} published, renderable asset{orphans.length === 1 ? "" : "s"} still need project linkage.
                Use the asset table’s `Orphans` filter to create or link projects from them.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {editForm && editProject ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-charcoal/55 p-4 md:p-8">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl text-charcoal">Edit Project</h3>
                <p className="mt-1 font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">
                  Reorder assets, pick the cover image, and control where the project appears publicly
                </p>
              </div>
              <button type="button" onClick={() => setEditForm(null)} className="rounded-full border border-gray-200 p-2 text-gray-mid transition hover:border-red hover:text-red">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
              <div className="space-y-4">
                <label className="block">
                  <span className="font-ui text-sm font-semibold text-charcoal">Title</span>
                  <input type="text" value={editForm.title} onChange={(event) => setEditForm((current) => current ? { ...current, title: event.target.value, slug: current.slug || slugify(event.target.value) } : current)} className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy" />
                </label>
                <label className="block">
                  <span className="font-ui text-sm font-semibold text-charcoal">Slug</span>
                  <input type="text" value={editForm.slug} onChange={(event) => setEditForm((current) => current ? { ...current, slug: slugify(event.target.value) } : current)} className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy" />
                </label>
                <label className="block">
                  <span className="font-ui text-sm font-semibold text-charcoal">Description</span>
                  <textarea value={editForm.description} onChange={(event) => setEditForm((current) => current ? { ...current, description: event.target.value } : current)} className="mt-1 min-h-[96px] w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy" />
                </label>
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
                <label className="block">
                  <span className="font-ui text-sm font-semibold text-charcoal">Location</span>
                  <input type="text" value={editForm.location} onChange={(event) => setEditForm((current) => current ? { ...current, location: event.target.value } : current)} className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy" />
                </label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <label className="font-ui flex items-center gap-2 text-sm text-charcoal">
                    <input type="checkbox" checked={editForm.published} onChange={(event) => setEditForm((current) => current ? { ...current, published: event.target.checked } : current)} />
                    Published
                  </label>
                  <label className="font-ui flex items-center gap-2 text-sm text-charcoal">
                    <input type="checkbox" checked={editForm.featured} onChange={(event) => setEditForm((current) => current ? { ...current, featured: event.target.checked } : current)} />
                    Homepage featured
                  </label>
                  <label className="block">
                    <span className="font-ui text-sm font-semibold text-charcoal">Spotlight Rank</span>
                    <input type="number" min="1" value={editForm.spotlightRank} onChange={(event) => setEditForm((current) => current ? { ...current, spotlightRank: event.target.value } : current)} className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy" />
                  </label>
                </div>
              </div>

              <div>
                <p className="font-ui text-sm font-semibold text-charcoal">Ordered Assets</p>
                <div className="mt-3 space-y-2">
                  {editForm.assetIds.map((assetId, index) => {
                    const asset = editProject.assets.find((item) => item.id === assetId);
                    if (!asset) return null;
                    return (
                      <div key={asset.id} className="rounded-lg border border-gray-warm bg-cream/40 p-3">
                        <div className="flex items-start gap-3">
                          <img src={asset.thumbnailUrl || asset.imageUrl || ""} alt={asset.title || "Asset"} className="h-16 w-16 rounded-sm bg-white object-contain p-1" />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate font-ui text-sm font-semibold text-charcoal">{asset.title || "Untitled asset"}</p>
                              <label className="font-ui inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.16em] text-red">
                                <input type="radio" name="projectCoverAssetId" checked={editForm.coverAssetId === asset.id} onChange={() => setEditForm((current) => current ? { ...current, coverAssetId: asset.id } : current)} />
                                Cover
                              </label>
                            </div>
                            <p className="mt-1 text-xs text-gray-mid">{asset.location || "No location"}</p>
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
