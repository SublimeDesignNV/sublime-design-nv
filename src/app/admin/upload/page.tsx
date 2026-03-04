"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GALLERY_SECTIONS } from "@/lib/gallery.config";

type SignedUploadConfig = {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
};

type UploadedAsset = {
  public_id: string;
  secure_url: string;
};

const ADMIN_TOKEN_STORAGE_KEY = "sublime_admin_upload_token";
const MAX_FILES = 20;
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

async function fetchSignedUpload(
  folder: string,
  adminToken: string,
  fileCount: number,
): Promise<SignedUploadConfig> {
  const response = await fetch("/api/cloudinary/sign-upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": adminToken,
    },
    body: JSON.stringify({ folder, fileCount }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Failed to sign upload (${response.status}).`);
  }

  return (await response.json()) as SignedUploadConfig;
}

async function uploadImage(
  file: File,
  config: SignedUploadConfig,
): Promise<UploadedAsset> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", config.apiKey);
  formData.append("timestamp", String(config.timestamp));
  formData.append("signature", config.signature);
  formData.append("folder", config.folder);

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
  const [selectedFolder, setSelectedFolder] = useState(GALLERY_SECTIONS[0]?.folder ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<UploadedAsset[]>([]);

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

  const canUpload = useMemo(() => {
    return !isUploading && adminToken.length > 0 && selectedFolder.length > 0 && files.length > 0;
  }, [adminToken.length, files.length, isUploading, selectedFolder.length]);

  function updateToken(nextToken: string) {
    setAdminToken(nextToken);
    if (nextToken.trim()) {
      window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, nextToken.trim());
    } else {
      window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    }
  }

  async function handleUpload() {
    setError(null);

    if (!canUpload) return;

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

    setIsUploading(true);

    try {
      const signed = await fetchSignedUpload(selectedFolder, adminToken.trim(), files.length);
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
        Signed image uploads to Cloudinary folders used by the live gallery.
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

        <label style={{ display: "grid", gap: 6 }}>
          <span>Destination Folder</span>
          <select
            value={selectedFolder}
            onChange={(event) => setSelectedFolder(event.target.value)}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          >
            {GALLERY_SECTIONS.map((section) => (
              <option key={section.slug} value={section.folder}>
                {section.title} ({section.folder})
              </option>
            ))}
          </select>
        </label>

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
