"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SERVICES } from "@/lib/constants";
import { toProjectSlug } from "@/lib/projectSlug";

type SignedUploadConfig = {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
  tags: string;
  context: string;
};

type UploadedAsset = {
  public_id: string;
  secure_url: string;
};

type UploadFormState = {
  projectName: string;
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
  gpsLat: string;
  gpsLng: string;
  alt: string;
};

const ADMIN_TOKEN_STORAGE_KEY = "sublime_admin_upload_token";
const MAX_FILES = 20;
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MATERIAL_OPTIONS = ["Maple", "Oak", "Walnut", "Plywood", "MDF", "Mixed"];
const FINISH_OPTIONS = ["Natural", "Stained", "Painted", "Matte", "Satin", "Gloss"];
const ROOM_OPTIONS = ["Kitchen", "Pantry", "Living Room", "Bedroom", "Office", "Garage", "Other"];
const STYLE_OPTIONS = ["Modern", "Transitional", "Traditional", "Farmhouse", "Contemporary", "Custom"];

function slugToTitle(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function fetchSignedUpload(
  adminToken: string,
  fileCount: number,
  folder: string,
  tags: string[],
  context: Record<string, string>,
): Promise<SignedUploadConfig> {
  const response = await fetch("/api/cloudinary/sign-upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": adminToken,
    },
    body: JSON.stringify({
      folder,
      fileCount,
      tags,
      context,
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Failed to sign upload (${response.status}).`);
  }

  return (await response.json()) as SignedUploadConfig;
}

async function uploadImage(file: File, config: SignedUploadConfig): Promise<UploadedAsset> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", config.apiKey);
  formData.append("timestamp", String(config.timestamp));
  formData.append("signature", config.signature);
  formData.append("folder", config.folder);

  if (config.tags) {
    formData.append("tags", config.tags);
  }

  if (config.context) {
    formData.append("context", config.context);
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudinary upload failed (${response.status}): ${text}`);
  }

  const body = (await response.json()) as UploadedAsset;
  return {
    public_id: body.public_id,
    secure_url: body.secure_url,
  };
}

export default function AdminUploadPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [adminToken, setAdminToken] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<UploadedAsset[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [form, setForm] = useState<UploadFormState>({
    projectName: "",
    service: SERVICES[0]?.slug ?? "",
    city: "",
    state: "NV",
    material: MATERIAL_OPTIONS[0],
    finish: FINISH_OPTIONS[0],
    room: ROOM_OPTIONS[0],
    style: STYLE_OPTIONS[0],
    year: String(new Date().getFullYear()),
    featured: false,
    caption: "",
    gpsLat: "",
    gpsLng: "",
    alt: "",
  });

  useEffect(() => {
    const stored = window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
    if (stored) {
      setAdminToken(stored);
      return;
    }

    const prompted = window.prompt("Admin token")?.trim() || "";
    if (prompted) {
      window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, prompted);
      setAdminToken(prompted);
    }
  }, []);

  const projectSlug = useMemo(() => toProjectSlug(form.projectName), [form.projectName]);
  const folder = useMemo(
    () => (projectSlug ? `Sublime/Projects/${projectSlug}` : ""),
    [projectSlug],
  );

  const selectedService = useMemo(
    () => SERVICES.find((service) => service.slug === form.service),
    [form.service],
  );

  const altSuggestion = useMemo(() => {
    const parts = [
      form.projectName.trim(),
      selectedService?.shortTitle,
      form.room,
      form.city.trim(),
      form.state.trim(),
    ].filter(Boolean);

    return parts.join(" - ");
  }, [form.city, form.projectName, form.room, form.state, selectedService?.shortTitle]);

  const canUpload = useMemo(() => {
    return (
      !isUploading &&
      adminToken.trim().length > 0 &&
      form.projectName.trim().length > 0 &&
      projectSlug.length > 0 &&
      files.length > 0
    );
  }, [adminToken, files.length, form.projectName, isUploading, projectSlug.length]);

  function updateToken(nextToken: string) {
    setAdminToken(nextToken);

    if (nextToken.trim()) {
      window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, nextToken.trim());
    } else {
      window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    }
  }

  function updateField<K extends keyof UploadFormState>(field: K, value: UploadFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function addTag(rawTag: string) {
    const normalized = rawTag
      .toLowerCase()
      .replace(/[^a-z0-9-\s]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    if (!normalized) return;

    setTags((current) => (current.includes(normalized) ? current : [...current, normalized]));
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((current) => current.filter((item) => item !== tag));
  }

  async function handleUpload() {
    setError(null);

    if (!canUpload) return;

    if (!folder) {
      setError("Project name must produce a valid project slug.");
      return;
    }

    if (files.length > MAX_FILES) {
      setError(`Select up to ${MAX_FILES} files per upload.`);
      return;
    }

    for (const file of files) {
      if (!ACCEPTED_MIME_TYPES.has(file.type)) {
        setError(`Unsupported type for ${file.name}. Use JPG, PNG, or WebP.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(
          `${file.name} exceeds ${Math.floor(MAX_FILE_SIZE_BYTES / (1024 * 1024))} MB.`,
        );
        return;
      }
    }

    const context = {
      project_name: form.projectName.trim(),
      project_slug: projectSlug,
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
      gps_lat: form.gpsLat.trim(),
      gps_lng: form.gpsLng.trim(),
    };

    const uploadTags = Array.from(
      new Set([projectSlug, form.service, form.city.trim().toLowerCase(), ...tags].filter(Boolean)),
    );

    setIsUploading(true);

    try {
      const signed = await fetchSignedUpload(
        adminToken.trim(),
        files.length,
        folder,
        uploadTags,
        context,
      );

      const uploadedResults: UploadedAsset[] = [];
      for (const file of files) {
        const result = await uploadImage(file, signed);
        uploadedResults.push(result);
      }

      setUploaded((current) => [...uploadedResults, ...current]);
      setFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <main style={{ padding: 40, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 8px" }}>Admin Upload</h1>
      <p style={{ margin: "0 0 24px", color: "#555" }}>
        Secure signed uploads into project folders for automatic gallery/project pages.
      </p>

      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          display: "grid",
          gap: 14,
        }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <span>Admin Token</span>
          <input
            type="password"
            value={adminToken}
            onChange={(event) => updateToken(event.target.value)}
            placeholder="Enter ADMIN_UPLOAD_TOKEN"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
        </label>

        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Project Name</span>
            <input
              type="text"
              required
              value={form.projectName}
              onChange={(event) => updateField("projectName", event.target.value)}
              placeholder="Summerlin Kitchen Floating Shelves"
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Service</span>
            <select
              value={form.service}
              onChange={(event) => updateField("service", event.target.value)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            >
              {SERVICES.map((service) => (
                <option key={service.slug} value={service.slug}>
                  {service.shortTitle}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>City</span>
            <input
              type="text"
              value={form.city}
              onChange={(event) => updateField("city", event.target.value)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>State</span>
            <input
              type="text"
              value={form.state}
              onChange={(event) => updateField("state", event.target.value.toUpperCase())}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Material</span>
            <select
              value={form.material}
              onChange={(event) => updateField("material", event.target.value)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            >
              {MATERIAL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Finish</span>
            <select
              value={form.finish}
              onChange={(event) => updateField("finish", event.target.value)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            >
              {FINISH_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Room</span>
            <select
              value={form.room}
              onChange={(event) => updateField("room", event.target.value)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            >
              {ROOM_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Style</span>
            <select
              value={form.style}
              onChange={(event) => updateField("style", event.target.value)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            >
              {STYLE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Year</span>
            <input
              type="number"
              min={1990}
              max={2100}
              value={form.year}
              onChange={(event) => updateField("year", event.target.value)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>GPS Latitude (optional)</span>
            <input
              type="text"
              value={form.gpsLat}
              onChange={(event) => updateField("gpsLat", event.target.value)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>GPS Longitude (optional)</span>
            <input
              type="text"
              value={form.gpsLng}
              onChange={(event) => updateField("gpsLng", event.target.value)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            />
          </label>
        </div>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Caption</span>
          <textarea
            value={form.caption}
            onChange={(event) => updateField("caption", event.target.value)}
            rows={3}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Alt Text</span>
          <input
            type="text"
            value={form.alt}
            onChange={(event) => updateField("alt", event.target.value)}
            placeholder={altSuggestion || "Auto-generated from project details"}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
          <small style={{ color: "#555" }}>Suggested: {altSuggestion || "N/A"}</small>
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) => updateField("featured", event.target.checked)}
          />
          Featured project
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Tags</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => removeTag(tag)}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 999,
                  padding: "4px 10px",
                  background: "#f8fafc",
                  cursor: "pointer",
                }}
                aria-label={`Remove tag ${tag}`}
              >
                {tag} ×
              </button>
            ))}
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === ",") {
                event.preventDefault();
                addTag(tagInput);
              }
            }}
            placeholder="Type tag and press Enter"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
          <button
            type="button"
            onClick={() => addTag(tagInput)}
            style={{ width: "fit-content", padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc" }}
          >
            Add Tag
          </button>
        </label>

        <div style={{ display: "grid", gap: 4, background: "#f8fafc", borderRadius: 8, padding: 10 }}>
          <strong>Auto Fields</strong>
          <span>project_slug: {projectSlug || "(enter project name)"}</span>
          <span>folder: {folder || "(enter project name)"}</span>
          <span>service label: {selectedService ? selectedService.shortTitle : slugToTitle(form.service)}</span>
        </div>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Files (JPG, PNG, WebP, max {MAX_FILES})</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
        </label>

        <button
          type="button"
          onClick={handleUpload}
          disabled={!canUpload}
          style={{
            width: "fit-content",
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            background: canUpload ? "#0f172a" : "#9ca3af",
            color: "#fff",
            cursor: canUpload ? "pointer" : "not-allowed",
          }}
        >
          {isUploading ? "Uploading..." : "Upload Images"}
        </button>

        {error ? <p style={{ color: "#b91c1c", margin: 0 }}>{error}</p> : null}
      </section>

      <section>
        <h2 style={{ marginBottom: 12 }}>Uploaded Results</h2>
        {uploaded.length === 0 ? (
          <p style={{ color: "#555" }}>No uploads yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {uploaded.map((asset) => (
              <article
                key={asset.public_id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 12,
                  padding: 12,
                  display: "grid",
                  gap: 10,
                }}
              >
                <img
                  src={asset.secure_url}
                  alt={asset.public_id}
                  style={{ width: 220, maxWidth: "100%", borderRadius: 8 }}
                />
                <code style={{ fontSize: 12 }}>{asset.public_id}</code>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
