"use client";

import { useMemo, useState } from "react";
import { toProjectSlug } from "@/lib/projectSlug";
import { SERVICE_TAGS } from "@/lib/serviceTags";

type ListedAsset = {
  public_id: string;
  secure_url: string;
  created_at?: string;
  width?: number;
  height?: number;
  format?: string;
  context?: {
    project_slug?: string;
    alt?: string;
  };
  tags?: string[];
};

type PatchResponse = {
  ok: boolean;
  updated: number;
  failed: { public_id: string; error: string }[];
};

type MetadataForm = {
  projectName: string;
  projectSlug: string;
  service: string;
  city: string;
  state: string;
  material: string;
  finish: string;
  room: string;
  style: string;
  year: string;
  featured: boolean;
  caption: string;
  alt: string;
};

const FOLDER_OPTIONS = ["Sublime/Gallery", "Sublime/Projects"];
const MATERIAL_OPTIONS = ["Maple", "Oak", "Walnut", "Plywood", "MDF", "Mixed"];
const FINISH_OPTIONS = ["Natural", "Stained", "Painted", "Matte", "Satin", "Gloss"];
const ROOM_OPTIONS = ["Kitchen", "Pantry", "Living Room", "Bedroom", "Office", "Garage", "Other"];
const STYLE_OPTIONS = ["Modern", "Transitional", "Traditional", "Farmhouse", "Contemporary", "Custom"];

function toTagSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function AdminBackfillPage() {
  const [folderPrefix, setFolderPrefix] = useState(FOLDER_OPTIONS[0]);
  const [search, setSearch] = useState("");
  const [assets, setAssets] = useState<ListedAsset[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PatchResponse | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [form, setForm] = useState<MetadataForm>({
    projectName: "",
    projectSlug: "",
    service: SERVICE_TAGS[0]?.slug ?? "",
    city: "",
    state: "NV",
    material: MATERIAL_OPTIONS[0],
    finish: FINISH_OPTIONS[0],
    room: ROOM_OPTIONS[0],
    style: STYLE_OPTIONS[0],
    year: String(new Date().getFullYear()),
    featured: false,
    caption: "",
    alt: "",
  });

  const filteredAssets = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return assets;
    return assets.filter((asset) => asset.public_id.toLowerCase().includes(query));
  }, [assets, search]);

  const selectedPublicIds = useMemo(() => Array.from(selected), [selected]);

  const derivedSlug = useMemo(() => toProjectSlug(form.projectName), [form.projectName]);

  const effectiveSlug = useMemo(
    () => (form.projectSlug.trim() ? toProjectSlug(form.projectSlug) : derivedSlug),
    [derivedSlug, form.projectSlug],
  );

  const altSuggestion = useMemo(() => {
    const selectedService = SERVICE_TAGS.find((service) => service.slug === form.service);
    return [form.projectName.trim(), selectedService?.label, form.city.trim(), form.state]
      .filter(Boolean)
      .join(" - ");
  }, [form.city, form.projectName, form.service, form.state]);

  const autoTags = useMemo(() => {
    const tags = [
      effectiveSlug,
      form.service ? `service:${toTagSlug(form.service)}` : "",
      form.city ? `city:${toTagSlug(form.city)}` : "",
      form.material ? `material:${toTagSlug(form.material)}` : "",
      form.finish ? `finish:${toTagSlug(form.finish)}` : "",
      form.room ? `room:${toTagSlug(form.room)}` : "",
      form.style ? `style:${toTagSlug(form.style)}` : "",
      form.featured ? "featured:true" : "",
    ].filter(Boolean);

    return Array.from(new Set(tags));
  }, [effectiveSlug, form.city, form.featured, form.finish, form.material, form.room, form.service, form.style]);

  const tagsToApply = useMemo(
    () => Array.from(new Set([...autoTags, ...customTags])),
    [autoTags, customTags],
  );

  async function fetchAssets() {
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/cloudinary/list-assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ folderPrefix, maxResults: 300 }),
      });

      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        assets?: ListedAsset[];
      };

      if (!response.ok || !body.ok) {
        throw new Error(body.error || `Failed to fetch assets (${response.status}).`);
      }

      setAssets(body.assets ?? []);
      setSelected(new Set());
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to fetch assets.");
    } finally {
      setIsLoading(false);
    }
  }

  function toggleSelected(publicId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(publicId)) {
        next.delete(publicId);
      } else {
        next.add(publicId);
      }
      return next;
    });
  }

  function setField<K extends keyof MetadataForm>(key: K, value: MetadataForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function addCustomTag(rawTag: string) {
    const normalized = toTagSlug(rawTag);
    if (!normalized) return;

    setCustomTags((current) => (current.includes(normalized) ? current : [...current, normalized]));
    setTagInput("");
  }

  async function applyMetadata() {
    setError(null);
    setResult(null);

    if (!selectedPublicIds.length) {
      setError("Select at least one asset.");
      return;
    }

    if (!effectiveSlug) {
      setError("Project slug is required.");
      return;
    }

    const context: Record<string, string> = {
      project_name: form.projectName.trim(),
      project_slug: effectiveSlug,
      service: form.service,
      city: form.city.trim(),
      state: form.state.trim() || "NV",
      material: form.material,
      finish: form.finish,
      room: form.room,
      style: form.style,
      year: form.year.trim(),
      featured: form.featured ? "true" : "false",
      caption: form.caption.trim(),
      alt: (form.alt.trim() || altSuggestion || form.projectName).trim(),
    };

    setIsApplying(true);

    try {
      const response = await fetch("/api/admin/cloudinary/patch-metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicIds: selectedPublicIds,
          context,
          addTags: tagsToApply,
        }),
      });

      const body = (await response.json().catch(() => ({}))) as PatchResponse & {
        error?: string;
      };

      if (!response.ok || !body.ok) {
        throw new Error(body.error || `Failed to patch metadata (${response.status}).`);
      }

      setResult(body);
      await fetchAssets();
    } catch (applyError) {
      setError(applyError instanceof Error ? applyError.message : "Failed to patch metadata.");
    } finally {
      setIsApplying(false);
    }
  }

  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ marginTop: 0 }}>Admin Backfill Metadata</h1>

      <section style={{ marginBottom: 18, display: "grid", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "end" }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Folder Prefix</span>
            <select
              value={folderPrefix}
              onChange={(event) => setFolderPrefix(event.target.value)}
              style={{ border: "1px solid #ccc", borderRadius: 8, padding: 10 }}
            >
              {FOLDER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={fetchAssets}
            disabled={isLoading}
            style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #222" }}
          >
            {isLoading ? "Fetching..." : "Fetch Assets"}
          </button>

          <label style={{ display: "grid", gap: 6, minWidth: 280, flex: 1 }}>
            <span>Search public_id contains</span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="floating-shelves"
              style={{ border: "1px solid #ccc", borderRadius: 8, padding: 10 }}
            />
          </label>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gap: 18,
          gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)",
          alignItems: "start",
        }}
      >
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
          <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
            <strong>Assets ({filteredAssets.length})</strong>
            <span>{selectedPublicIds.length} selected</span>
          </div>

          <div style={{ display: "grid", gap: 8, maxHeight: "70vh", overflow: "auto" }}>
            {filteredAssets.map((asset) => (
              <label
                key={asset.public_id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "22px 72px 1fr",
                  gap: 10,
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: 8,
                }}
              >
                <input
                  type="checkbox"
                  checked={selected.has(asset.public_id)}
                  onChange={() => toggleSelected(asset.public_id)}
                />
                <img
                  src={asset.secure_url}
                  alt={asset.public_id}
                  style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 6 }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, wordBreak: "break-all" }}>{asset.public_id}</div>
                  <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
                    project_slug: {asset.context?.project_slug || "(none)"}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, display: "grid", gap: 10 }}>
          <strong>Apply Metadata</strong>

          <label style={{ display: "grid", gap: 6 }}>
            <span>project_name</span>
            <input
              value={form.projectName}
              onChange={(event) => setField("projectName", event.target.value)}
              style={{ border: "1px solid #ccc", borderRadius: 8, padding: 9 }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>project_slug</span>
            <input
              value={form.projectSlug}
              onChange={(event) => setField("projectSlug", event.target.value)}
              placeholder={derivedSlug || "auto from project_name"}
              style={{ border: "1px solid #ccc", borderRadius: 8, padding: 9 }}
            />
            <small style={{ color: "#555" }}>Effective slug: {effectiveSlug || "(none)"}</small>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>service</span>
            <select
              value={form.service}
              onChange={(event) => setField("service", event.target.value)}
              style={{ border: "1px solid #ccc", borderRadius: 8, padding: 9 }}
            >
              {SERVICE_TAGS.map((service) => (
                <option key={service.slug} value={service.slug}>
                  {service.label}
                </option>
              ))}
            </select>
          </label>

          <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
            <input
              value={form.city}
              onChange={(event) => setField("city", event.target.value)}
              placeholder="city"
              style={{ border: "1px solid #ccc", borderRadius: 8, padding: 9 }}
            />
            <input
              value={form.state}
              onChange={(event) => setField("state", event.target.value.toUpperCase())}
              placeholder="state"
              style={{ border: "1px solid #ccc", borderRadius: 8, padding: 9 }}
            />
          </div>

          <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
            <select value={form.material} onChange={(e) => setField("material", e.target.value)} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 9 }}>
              {MATERIAL_OPTIONS.map((option) => <option key={option}>{option}</option>)}
            </select>
            <select value={form.finish} onChange={(e) => setField("finish", e.target.value)} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 9 }}>
              {FINISH_OPTIONS.map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>

          <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
            <select value={form.room} onChange={(e) => setField("room", e.target.value)} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 9 }}>
              {ROOM_OPTIONS.map((option) => <option key={option}>{option}</option>)}
            </select>
            <select value={form.style} onChange={(e) => setField("style", e.target.value)} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 9 }}>
              {STYLE_OPTIONS.map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>

          <input
            value={form.year}
            onChange={(event) => setField("year", event.target.value)}
            placeholder="year"
            style={{ border: "1px solid #ccc", borderRadius: 8, padding: 9 }}
          />

          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) => setField("featured", event.target.checked)}
            />
            featured
          </label>

          <textarea
            rows={2}
            value={form.caption}
            onChange={(event) => setField("caption", event.target.value)}
            placeholder="caption"
            style={{ border: "1px solid #ccc", borderRadius: 8, padding: 9 }}
          />

          <input
            value={form.alt}
            onChange={(event) => setField("alt", event.target.value)}
            placeholder={altSuggestion || "alt text"}
            style={{ border: "1px solid #ccc", borderRadius: 8, padding: 9 }}
          />

          <div style={{ display: "grid", gap: 6 }}>
            <span>Tags</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {tagsToApply.map((tag) => (
                <span key={tag} style={{ fontSize: 12, border: "1px solid #ddd", borderRadius: 999, padding: "2px 8px" }}>
                  {tag}
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addCustomTag(tagInput);
                  }
                }}
                placeholder="add custom tag"
                style={{ border: "1px solid #ccc", borderRadius: 8, padding: 9, flex: 1 }}
              />
              <button type="button" onClick={() => addCustomTag(tagInput)} style={{ border: "1px solid #333", borderRadius: 8, padding: "8px 10px" }}>
                Add
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={applyMetadata}
            disabled={isApplying || selectedPublicIds.length === 0}
            style={{ padding: "10px 12px", borderRadius: 8, border: "none", background: "#0f172a", color: "#fff" }}
          >
            {isApplying ? "Applying..." : `Apply to ${selectedPublicIds.length} selected`}
          </button>
        </div>
      </section>

      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}

      {result ? (
        <section style={{ marginTop: 18 }}>
          <p>
            Updated: <strong>{result.updated}</strong>
          </p>
          {result.failed.length > 0 ? (
            <div>
              <strong>Failed ({result.failed.length})</strong>
              <ul>
                {result.failed.map((item) => (
                  <li key={item.public_id}>
                    <code>{item.public_id}</code>: {item.error}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
