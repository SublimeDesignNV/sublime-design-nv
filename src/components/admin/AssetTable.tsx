"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ImageIcon, Link2, Pencil, Plus, Trash2, Video, X } from "lucide-react";
import { ACTIVE_AREAS } from "@/content/areas";
import ServiceMetadataFields from "@/components/admin/ServiceMetadataFields";
import { CONTEXT_TAGS, SERVICE_TAGS } from "@/lib/serviceTags";
import { sanitizeServiceAssetMetadata } from "@/lib/serviceAssetMetadata";

type AdminAsset = {
  id: string;
  slug: string | null;
  kind: "IMAGE" | "VIDEO";
  publicId: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  secureUrl: string | null;
  resourceType: "image" | "video";
  format: string | null;
  title: string | null;
  description: string | null;
  location: string | null;
  primaryServiceSlug: string | null;
  primaryServiceLabel: string | null;
  serviceMetadata: Record<string, unknown> | null;
  published: boolean;
  createdAt: string;
  uploadBatchId?: string | null;
  projectId: string | null;
  projectSlug: string | null;
  renderable: boolean;
  diagnosis: string;
  tags: Array<{ slug: string; title: string; tagType: "SERVICE" | "CONTEXT" }>;
  serviceTags: Array<{ slug: string; title: string; tagType: "SERVICE" | "CONTEXT" }>;
  contextTags: Array<{ slug: string; title: string; tagType: "SERVICE" | "CONTEXT" }>;
  contextSlugs: string[];
};

type AdminProject = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  featured: boolean;
  spotlightRank: number | null;
  serviceSlug: string | null;
  areaSlug: string | null;
  location: string | null;
  description: string | null;
  coverAssetId: string | null;
  assets: Array<{ id: string; position: number }>;
};

type AssetsResponse = {
  assets: AdminAsset[];
};

type ProjectsResponse = {
  ok: boolean;
  projects: AdminProject[];
  projectOptions: Array<{
    id: string;
    slug: string;
    title: string;
    published: boolean;
    assetCount: number;
  }>;
};

type Filter = "all" | "published" | "unpublished" | "orphans";

type EditFormState = {
  id: string;
  title: string;
  description: string;
  location: string;
  primaryServiceSlug: string;
  secondaryServiceSlugs: string[];
  contextSlugs: string[];
  serviceMetadata: Record<string, unknown>;
  published: boolean;
};

type ProjectFormState = {
  title: string;
  slug: string;
  serviceSlug: string;
  areaSlug: string;
  location: string;
  description: string;
  published: boolean;
  featured: boolean;
  spotlightRank: string;
  coverAssetId: string;
  assetIds: string[];
};

type AssetTableProps = {
  title?: string;
  description?: string;
  defaultFilter?: Filter;
  availableFilters?: Filter[];
};

const EMPTY_PROJECT_FORM: ProjectFormState = {
  title: "",
  slug: "",
  serviceSlug: "",
  areaSlug: "",
  location: "",
  description: "",
  published: false,
  featured: false,
  spotlightRank: "",
  coverAssetId: "",
  assetIds: [],
};

function getAdminPhotoPreviewSrc(asset: Pick<AdminAsset, "imageUrl" | "thumbnailUrl" | "secureUrl">) {
  return asset.imageUrl || asset.thumbnailUrl || asset.secureUrl || "";
}

function toEditForm(asset: AdminAsset): EditFormState {
  const primaryServiceSlug = asset.primaryServiceSlug ?? asset.serviceTags[0]?.slug ?? "";

  return {
    id: asset.id,
    title: asset.title ?? "",
    description: asset.description ?? "",
    location: asset.location ?? "",
    primaryServiceSlug,
    secondaryServiceSlugs: asset.serviceTags
      .map((tag) => tag.slug)
      .filter((slug) => slug !== primaryServiceSlug),
    contextSlugs: asset.contextSlugs,
    serviceMetadata: asset.serviceMetadata ?? {},
    published: asset.published,
  };
}

function toProjectForm(assets: AdminAsset[]): ProjectFormState {
  const lead = assets[0];
  const title = lead?.title ?? "";
  return {
    ...EMPTY_PROJECT_FORM,
    title,
    slug: title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
    serviceSlug: lead?.primaryServiceSlug ?? "",
    location: lead?.location ?? "",
    coverAssetId: lead?.id ?? "",
    assetIds: assets.map((asset) => asset.id),
  };
}

export default function AssetTable({
  title = "Photos",
  description = "Service pages use published photos directly. Projects, gallery views, and homepage spotlight require explicit project linkage.",
  defaultFilter = "all",
  availableFilters = ["all", "published", "unpublished", "orphans"],
}: AssetTableProps) {
  const [assets, setAssets] = useState<AdminAsset[]>([]);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>(defaultFilter);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [createProjectForm, setCreateProjectForm] = useState<ProjectFormState | null>(null);
  const [linkProjectId, setLinkProjectId] = useState("");
  const [isProjectSaving, setIsProjectSaving] = useState(false);

  const loadAssets = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const [assetsResponse, projectsResponse] = await Promise.all([
        fetch("/api/admin/assets", { cache: "no-store" }),
        fetch("/api/admin/projects", { cache: "no-store" }),
      ]);

      const assetsBody = (await assetsResponse.json()) as AssetsResponse & { error?: string };
      if (!assetsResponse.ok) {
        throw new Error(assetsBody.error || "Failed to load photos.");
      }

      const projectsBody = (await projectsResponse.json().catch(() => ({}))) as ProjectsResponse & {
        error?: string;
      };
      if (!projectsResponse.ok || !projectsBody.ok) {
        throw new Error(projectsBody.error || "Failed to load project options.");
      }

      setAssets(assetsBody.assets);
      setProjects(projectsBody.projects);
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

    function onCreated(event: Event) {
      const detail = (event as CustomEvent<{ assetIds?: string[] }>).detail;
      const assetIds = detail?.assetIds ?? [];
      if (assetIds.length) {
        setSelectedAssetIds(assetIds);
        setFilter("orphans");
      }
      void loadAssets();
    }

    window.addEventListener("admin-assets-refresh", onRefresh);
    window.addEventListener("admin-projects-refresh", onRefresh);
    window.addEventListener("admin-assets-created", onCreated as EventListener);
    return () => {
      window.removeEventListener("admin-assets-refresh", onRefresh);
      window.removeEventListener("admin-projects-refresh", onRefresh);
      window.removeEventListener("admin-assets-created", onCreated as EventListener);
    };
  }, [loadAssets]);

  const filteredAssets = useMemo(() => {
    if (filter === "published") return assets.filter((asset) => asset.published);
    if (filter === "unpublished") return assets.filter((asset) => !asset.published);
    if (filter === "orphans") return assets.filter((asset) => !asset.projectId);
    return assets;
  }, [assets, filter]);

  const selectedAssets = useMemo(
    () => filteredAssets.filter((asset) => selectedAssetIds.includes(asset.id)),
    [filteredAssets, selectedAssetIds],
  );

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

  function toggleContext(slug: string) {
    setEditForm((current) => {
      if (!current) return current;

      return {
        ...current,
        contextSlugs: current.contextSlugs.includes(slug)
          ? current.contextSlugs.filter((item) => item !== slug)
          : [...current.contextSlugs, slug],
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
        contextSlugs: editForm.contextSlugs,
        serviceMetadata: editForm.serviceMetadata,
        published: editForm.published,
      }),
    });

    setIsSaving(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error || "Failed to save photo changes.");
      return;
    }

    await loadAssets();
    closeEditor();
  }

  async function deleteAsset(asset: AdminAsset) {
    const confirmed = window.confirm(
      `Delete "${asset.title || "Untitled photo"}" from the portfolio database? This phase only removes the DB record and leaves the Cloudinary file in place.`,
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
      setError(body.error || "Failed to delete photo.");
      return;
    }

    setAssets((current) => current.filter((item) => item.id !== asset.id));
    setSelectedAssetIds((current) => current.filter((id) => id !== asset.id));
    if (editingAssetId === asset.id) {
      closeEditor();
    }
  }

  function toggleAssetSelection(id: string) {
    setSelectedAssetIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function toggleSelectVisible() {
    const visibleIds = filteredAssets.map((asset) => asset.id);
    const allSelected = visibleIds.every((id) => selectedAssetIds.includes(id));
    setSelectedAssetIds((current) =>
      allSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds])),
    );
  }

  function moveProjectAsset(assetId: string, direction: -1 | 1) {
    setCreateProjectForm((current) => {
      if (!current) return current;
      const currentIndex = current.assetIds.indexOf(assetId);
      const nextIndex = currentIndex + direction;
      if (currentIndex === -1 || nextIndex < 0 || nextIndex >= current.assetIds.length) {
        return current;
      }
      const assetIds = [...current.assetIds];
      const [item] = assetIds.splice(currentIndex, 1);
      assetIds.splice(nextIndex, 0, item);
      return { ...current, assetIds };
    });
  }

  async function createProjectFromSelection() {
    if (selectedAssets.length === 0) {
      setError("Select at least one photo to create a project.");
      return;
    }

    setCreateProjectForm(toProjectForm(selectedAssets));
    setError(null);
  }

  async function submitCreateProject() {
    if (!createProjectForm) return;
    if (!createProjectForm.title.trim() || createProjectForm.assetIds.length === 0) {
      setError("Project title and at least one photo are required.");
      return;
    }

    setIsProjectSaving(true);
    setError(null);

    const response = await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: createProjectForm.title.trim(),
        slug: createProjectForm.slug.trim() || undefined,
        serviceSlug: createProjectForm.serviceSlug || undefined,
        areaSlug: createProjectForm.areaSlug || undefined,
        location: createProjectForm.location.trim() || undefined,
        description: createProjectForm.description.trim() || undefined,
        published: createProjectForm.published,
        featured: createProjectForm.featured,
        spotlightRank: createProjectForm.spotlightRank
          ? Number(createProjectForm.spotlightRank)
          : null,
        coverAssetId:
          createProjectForm.coverAssetId || createProjectForm.assetIds[0] || undefined,
        assetIds: createProjectForm.assetIds,
      }),
    });

    setIsProjectSaving(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error || "Failed to create project.");
      return;
    }

    setCreateProjectForm(null);
    setSelectedAssetIds([]);
    await loadAssets();
    window.dispatchEvent(new Event("admin-projects-refresh"));
  }

  async function linkSelectionToProject() {
    if (!linkProjectId) {
      setError("Choose a project to link the selected photos.");
      return;
    }

    const project = projects.find((item) => item.id === linkProjectId);
    if (!project) {
      setError("Project not found.");
      return;
    }

    const mergedAssetIds = Array.from(
      new Set([...project.assets.map((asset) => asset.id), ...selectedAssetIds]),
    );

    setIsProjectSaving(true);
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
        published: project.published,
        featured: project.featured,
        spotlightRank: project.spotlightRank,
        coverAssetId: project.coverAssetId || mergedAssetIds[0],
        assetIds: mergedAssetIds,
      }),
    });

    setIsProjectSaving(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error || "Failed to link photos to project.");
      return;
    }

    setLinkProjectId("");
    setSelectedAssetIds([]);
    await loadAssets();
    window.dispatchEvent(new Event("admin-projects-refresh"));
  }

  const allVisibleSelected =
    filteredAssets.length > 0 &&
    filteredAssets.every((asset) => selectedAssetIds.includes(asset.id));

  return (
    <section className="rounded-lg border border-gray-warm bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl text-charcoal">{title}</h2>
          <p className="mt-2 font-ui text-sm text-gray-mid">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableFilters.map((value) => (
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
                  : value === "unpublished"
                    ? "Unpublished"
                    : "Unlinked"}
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

      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-gray-200 bg-cream p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">
            Bulk Project Actions
          </p>
          <p className="mt-1 text-sm text-charcoal">
            {selectedAssetIds.length} selected. Use this to create one album/project or repair unlinked photos in bulk.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void createProjectFromSelection()}
            disabled={selectedAssetIds.length === 0}
            className="inline-flex items-center gap-1 rounded-sm bg-red px-3 py-2 font-ui text-xs font-semibold text-white disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Project
          </button>
          <select
            value={linkProjectId}
            onChange={(event) => setLinkProjectId(event.target.value)}
            className="rounded-sm border border-gray-warm bg-white px-3 py-2 font-ui text-xs text-charcoal"
          >
            <option value="">Link to existing project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void linkSelectionToProject()}
            disabled={selectedAssetIds.length === 0 || !linkProjectId}
            className="inline-flex items-center gap-1 rounded-sm border border-gray-warm px-3 py-2 font-ui text-xs text-charcoal disabled:opacity-50"
          >
            <Link2 className="h-3.5 w-3.5" />
            Link Photos
          </button>
          <button
            type="button"
            onClick={() => setSelectedAssetIds([])}
            disabled={selectedAssetIds.length === 0}
            className="rounded-sm border border-gray-warm px-3 py-2 font-ui text-xs text-charcoal disabled:opacity-50"
          >
            Clear
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
                <th className="py-2 pr-3">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectVisible}
                    aria-label="Select visible photos"
                  />
                </th>
                <th className="font-ui py-2 pr-3 text-xs uppercase tracking-wide text-gray-mid">
                  Preview
                </th>
                <th className="font-ui py-2 pr-3 text-xs uppercase tracking-wide text-gray-mid">
                  Photo
                </th>
                <th className="font-ui py-2 pr-3 text-xs uppercase tracking-wide text-gray-mid">
                  Services / Context
                </th>
                <th className="font-ui py-2 pr-3 text-xs uppercase tracking-wide text-gray-mid">
                  Project
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
                    <input
                      type="checkbox"
                      checked={selectedAssetIds.includes(asset.id)}
                      onChange={() => toggleAssetSelection(asset.id)}
                      aria-label={`Select ${asset.title || "photo"}`}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    {asset.kind === "IMAGE" ? (
                      <img
                        src={getAdminPhotoPreviewSrc(asset)}
                        alt={asset.serviceTags[0]?.title || asset.contextTags[0]?.title || "Photo preview"}
                        className="h-16 w-16 rounded-sm bg-cream object-cover"
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
                      <span>{asset.title || "Untitled photo"}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-mid">
                      {asset.location || asset.kind}
                    </p>
                    {asset.description ? (
                      <p className="mt-1 max-w-md text-xs text-gray-mid">{asset.description}</p>
                    ) : null}
                    <p className="mt-1 text-[11px] text-gray-mid">diagnosis: {asset.diagnosis}</p>
                  </td>
                  <td className="font-ui py-2 pr-3 text-sm text-charcoal">
                    <p>{asset.primaryServiceLabel || "Unassigned"}</p>
                    {asset.serviceTags.length > 0 ? (
                      <div className="mt-2 flex max-w-xs flex-wrap gap-1.5">
                        {asset.serviceTags.map((tag) => (
                          <span
                            key={`${tag.tagType}-${tag.slug}`}
                            className="rounded-full border border-red/20 bg-red/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-red"
                          >
                            {tag.title}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {asset.contextTags.length > 0 ? (
                      <div className="mt-2 flex max-w-xs flex-wrap gap-1.5">
                        {asset.contextTags.map((tag) => (
                          <span
                            key={`${tag.tagType}-${tag.slug}`}
                            className="rounded-full border border-gray-200 bg-cream px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-charcoal"
                          >
                            {tag.title}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </td>
                  <td className="font-ui py-2 pr-3 text-sm text-charcoal">
                    {asset.projectSlug ? (
                      <>
                        <p>{asset.projectSlug}</p>
                        <p className="mt-1 text-xs text-gray-mid">Linked project</p>
                      </>
                    ) : (
                      <>
                        <p className="text-red">Unlinked photo</p>
                        <p className="mt-1 text-xs text-gray-mid">Visible on service pages only</p>
                      </>
                    )}
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
                      <a
                        href={`/api/admin/assets/${asset.id}/debug`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-sm border border-gray-warm px-3 py-1.5 font-ui text-xs text-charcoal transition hover:border-navy hover:text-navy"
                      >
                        Debug
                      </a>
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
            <p className="font-ui py-4 text-sm text-gray-mid">No photos found.</p>
          ) : null}
        </div>
      ) : null}

      {editForm ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-charcoal/55 p-4 md:p-8">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl text-charcoal">Edit Photo</h3>
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

              <fieldset>
                <legend className="font-ui text-sm font-semibold text-charcoal">
                  Project Context
                </legend>
                <div className="mt-3 space-y-4">
                  {(["room", "feature"] as const).map((group) => (
                    <div key={group}>
                      <p className="font-ui text-xs uppercase tracking-[0.16em] text-gray-mid">
                        {group === "room" ? "Rooms" : "Features"}
                      </p>
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {CONTEXT_TAGS.filter((context) => context.group === group).map((context) => (
                          <label
                            key={context.slug}
                            className="font-ui flex items-center gap-2 rounded-sm border border-gray-warm bg-cream/40 px-3 py-2 text-sm text-charcoal"
                          >
                            <input
                              type="checkbox"
                              checked={editForm.contextSlugs.includes(context.slug)}
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

      {createProjectForm ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-charcoal/55 p-4 md:p-8">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl text-charcoal">Create Project from Selected Photos</h3>
                <p className="mt-1 font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">
                  Set the public project record, cover image, and ordered gallery
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateProjectForm(null)}
                className="rounded-full border border-gray-200 p-2 text-gray-mid transition hover:border-red hover:text-red"
                aria-label="Close create project modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="font-ui text-sm font-semibold text-charcoal">Title</span>
                <input
                  type="text"
                  value={createProjectForm.title}
                  onChange={(event) =>
                    setCreateProjectForm((current) =>
                      current ? { ...current, title: event.target.value } : current,
                    )
                  }
                  className="mt-1 w-full rounded-sm border border-gray-warm px-3 py-2 text-sm text-charcoal outline-none focus:border-navy"
                />
              </label>
              <label className="block">
                <span className="font-ui text-sm font-semibold text-charcoal">Slug</span>
                <input
                  type="text"
                  value={createProjectForm.slug}
                  onChange={(event) =>
                    setCreateProjectForm((current) =>
                      current ? { ...current, slug: event.target.value } : current,
                    )
                  }
                  className="mt-1 w-full rounded-sm border border-gray-warm px-3 py-2 text-sm text-charcoal outline-none focus:border-navy"
                />
              </label>
              <label className="block">
                <span className="font-ui text-sm font-semibold text-charcoal">Service</span>
                <select
                  value={createProjectForm.serviceSlug}
                  onChange={(event) =>
                    setCreateProjectForm((current) =>
                      current ? { ...current, serviceSlug: event.target.value } : current,
                    )
                  }
                  className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-navy"
                >
                  <option value="">Select a service</option>
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
                  value={createProjectForm.areaSlug}
                  onChange={(event) =>
                    setCreateProjectForm((current) =>
                      current ? { ...current, areaSlug: event.target.value } : current,
                    )
                  }
                  className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-navy"
                >
                  <option value="">Select an area</option>
                  {ACTIVE_AREAS.map((area) => (
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
                  value={createProjectForm.location}
                  onChange={(event) =>
                    setCreateProjectForm((current) =>
                      current ? { ...current, location: event.target.value } : current,
                    )
                  }
                  className="mt-1 w-full rounded-sm border border-gray-warm px-3 py-2 text-sm text-charcoal outline-none focus:border-navy"
                />
              </label>
              <label className="block">
                <span className="font-ui text-sm font-semibold text-charcoal">Spotlight Rank</span>
                <input
                  type="number"
                  min={1}
                  value={createProjectForm.spotlightRank}
                  onChange={(event) =>
                    setCreateProjectForm((current) =>
                      current ? { ...current, spotlightRank: event.target.value } : current,
                    )
                  }
                  className="mt-1 w-full rounded-sm border border-gray-warm px-3 py-2 text-sm text-charcoal outline-none focus:border-navy"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="font-ui text-sm font-semibold text-charcoal">Description</span>
                <textarea
                  value={createProjectForm.description}
                  onChange={(event) =>
                    setCreateProjectForm((current) =>
                      current ? { ...current, description: event.target.value } : current,
                    )
                  }
                  className="mt-1 min-h-[96px] w-full rounded-sm border border-gray-warm px-3 py-2 text-sm text-charcoal outline-none focus:border-navy"
                />
              </label>
              <label className="font-ui flex items-center gap-2 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={createProjectForm.published}
                  onChange={(event) =>
                    setCreateProjectForm((current) =>
                      current ? { ...current, published: event.target.checked } : current,
                    )
                  }
                />
                Publish project immediately
              </label>
              <label className="font-ui flex items-center gap-2 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={createProjectForm.featured}
                  onChange={(event) =>
                    setCreateProjectForm((current) =>
                      current ? { ...current, featured: event.target.checked } : current,
                    )
                  }
                />
                Feature on homepage
              </label>
            </div>

            <div className="mt-6 space-y-3">
              <p className="font-ui text-sm font-semibold text-charcoal">Photo Order</p>
              {createProjectForm.assetIds.map((assetId, index) => {
                const asset = assets.find((item) => item.id === assetId);
                if (!asset) return null;
                return (
                  <div
                    key={asset.id}
                    className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-cream p-3 md:flex-row md:items-center"
                  >
                    <img
                      src={getAdminPhotoPreviewSrc(asset)}
                      alt={asset.title || "Selected photo"}
                      className="h-20 w-20 rounded-lg bg-white object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-ui text-sm font-semibold text-charcoal">
                        {asset.title || "Untitled photo"}
                      </p>
                      <p className="mt-1 text-xs text-gray-mid">
                        {asset.location || "No location"} • position {index + 1}
                      </p>
                      <label className="mt-2 inline-flex items-center gap-2 font-ui text-xs text-charcoal">
                        <input
                          type="radio"
                          checked={createProjectForm.coverAssetId === asset.id}
                          onChange={() =>
                            setCreateProjectForm((current) =>
                              current ? { ...current, coverAssetId: asset.id } : current,
                            )
                          }
                        />
                        Use as cover
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => moveProjectAsset(asset.id, -1)}
                        disabled={index === 0}
                        className="rounded-sm border border-gray-warm px-3 py-2 font-ui text-xs text-charcoal disabled:opacity-40"
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveProjectAsset(asset.id, 1)}
                        disabled={index === createProjectForm.assetIds.length - 1}
                        className="rounded-sm border border-gray-warm px-3 py-2 font-ui text-xs text-charcoal disabled:opacity-40"
                      >
                        Down
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setCreateProjectForm(null)}
                className="rounded-sm border border-gray-warm px-4 py-2 font-ui text-sm text-charcoal"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void submitCreateProject()}
                disabled={isProjectSaving || !createProjectForm.title.trim()}
                className="rounded-sm bg-red px-4 py-2 font-ui text-sm font-semibold text-white disabled:opacity-60"
              >
                {isProjectSaving ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
