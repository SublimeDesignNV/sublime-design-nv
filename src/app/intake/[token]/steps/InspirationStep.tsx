"use client";

import { useRef, useState } from "react";

type InspirationPhoto = { id: string; url: string; caption: string };
type LinkEntry = { url: string; label: string };

type Props = {
  leadId: string;
  inspirationPhotos: InspirationPhoto[];
  productLinks: LinkEntry[];
  inspirationLinks: LinkEntry[];
  onInspirationPhotosChange: (photos: InspirationPhoto[]) => void;
  onProductLinksChange: (links: LinkEntry[]) => void;
  onInspirationLinksChange: (links: LinkEntry[]) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function InspirationStep({
  leadId,
  inspirationPhotos,
  productLinks,
  inspirationLinks,
  onInspirationPhotosChange,
  onProductLinksChange,
  onInspirationLinksChange,
  onNext,
  onBack,
}: Props) {
  const [activeTab, setActiveTab] = useState<"photos" | "products" | "links">("photos");
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFiles(files: FileList) {
    setUploadError(null);
    setUploading(true);
    const newPhotos: InspirationPhoto[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        try {
          const form = new FormData();
          form.append("file", file);
          form.append("type", "INSPIRATION_PHOTO");

          const res = await fetch(`/api/leads/${leadId}/upload`, {
            method: "POST",
            body: form,
          });

          if (!res.ok) {
            const data = (await res.json().catch(() => ({}))) as { error?: string };
            throw new Error(data.error ?? `Upload failed (${res.status})`);
          }
          const data = (await res.json()) as { ok: boolean; asset: { id: string; url: string } };
          newPhotos.push({ id: data.asset.id, url: data.asset.url, caption: "" });
        } catch (err) {
          console.error("[InspirationStep] upload error:", err);
          setUploadError("One or more photos failed to upload.");
        }
      }

      onInspirationPhotosChange([...inspirationPhotos, ...newPhotos]);
    } finally {
      setUploading(false);
    }
  }

  function updatePhotoCaption(id: string, caption: string) {
    onInspirationPhotosChange(inspirationPhotos.map((p) => (p.id === id ? { ...p, caption } : p)));
  }

  function updateProductLink(idx: number, key: "url" | "label", value: string) {
    const next = [...productLinks];
    next[idx] = { ...next[idx], [key]: value };
    onProductLinksChange(next);
  }

  function addProductLink() {
    if (productLinks.length < 5) onProductLinksChange([...productLinks, { url: "", label: "" }]);
  }

  function removeProductLink(idx: number) {
    onProductLinksChange(productLinks.filter((_, i) => i !== idx));
  }

  function updateInspirationLink(idx: number, value: string) {
    const next = [...inspirationLinks];
    next[idx] = { ...next[idx], url: value };
    onInspirationLinksChange(next);
  }

  function addInspirationLink() {
    if (inspirationLinks.length < 3) onInspirationLinksChange([...inspirationLinks, { url: "", label: "" }]);
  }

  function removeInspirationLink(idx: number) {
    onInspirationLinksChange(inspirationLinks.filter((_, i) => i !== idx));
  }

  const tabs = [
    { id: "photos" as const, label: "Photos" },
    { id: "products" as const, label: "Product Links" },
    { id: "links" as const, label: "Videos & Sites" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl text-charcoal mb-2">What have you seen that you love?</h2>
        <p className="text-gray-mid">Screenshots, product links, YouTube videos — anything goes.</p>
      </div>

      <div className="flex border-b border-gray-warm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-ui font-semibold transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-red text-red"
                : "text-gray-mid hover:text-charcoal"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "photos" && (
        <div className="space-y-4">
          <p className="text-gray-mid text-sm">Screenshot from Pinterest, Instagram, Houzz — anything goes.</p>
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files.length) void handleFiles(e.dataTransfer.files);
            }}
            className="border-2 border-dashed border-gray-warm rounded-xl p-8 text-center cursor-pointer hover:border-red transition-colors"
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && void handleFiles(e.target.files)}
            />
            {uploading ? (
              <div className="w-6 h-6 border-2 border-red border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              <>
                <p className="font-ui font-semibold text-charcoal">Upload inspiration photos</p>
                <p className="text-gray-mid text-sm mt-1">tap or drag & drop</p>
              </>
            )}
          </div>
          {uploadError && <p className="text-red text-sm">{uploadError}</p>}
          {inspirationPhotos.map((p) => (
            <div key={p.id} className="flex gap-3 items-start bg-white rounded-lg p-3 border border-gray-warm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
              <input
                type="text"
                placeholder="What do you love about this? (optional)"
                value={p.caption}
                onChange={(e) => updatePhotoCaption(p.id, e.target.value)}
                className="flex-1 border-none outline-none text-sm text-charcoal placeholder-gray-mid"
              />
            </div>
          ))}
        </div>
      )}

      {activeTab === "products" && (
        <div className="space-y-4">
          <p className="text-gray-mid text-sm">Found a specific product, hardware, or finish you want to use?</p>
          {productLinks.map((link, idx) => (
            <div key={idx} className="space-y-2 border border-gray-warm rounded-lg p-4">
              <input
                type="url"
                placeholder="https://..."
                value={link.url}
                onChange={(e) => updateProductLink(idx, "url", e.target.value)}
                className="w-full border border-gray-warm rounded-lg px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-red"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder='What is this? (e.g. "Door handle from Amazon")'
                  value={link.label}
                  onChange={(e) => updateProductLink(idx, "label", e.target.value)}
                  className="flex-1 border border-gray-warm rounded-lg px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-red"
                />
                <button onClick={() => removeProductLink(idx)} className="text-gray-mid hover:text-red text-sm px-2">✕</button>
              </div>
            </div>
          ))}
          {productLinks.length === 0 ? (
            <button
              onClick={addProductLink}
              className="w-full border border-dashed border-gray-warm rounded-lg py-4 text-gray-mid text-sm font-ui font-semibold hover:border-red hover:text-red transition-colors"
            >
              + Add a link
            </button>
          ) : productLinks.length < 5 ? (
            <button onClick={addProductLink} className="text-red text-sm font-ui font-semibold hover:underline">
              + Add another
            </button>
          ) : null}
        </div>
      )}

      {activeTab === "links" && (
        <div className="space-y-4">
          <p className="text-gray-mid text-sm">YouTube video, website, or anything else that shows the vibe?</p>
          {inspirationLinks.map((link, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="url"
                placeholder="https://youtube.com/..."
                value={link.url}
                onChange={(e) => updateInspirationLink(idx, e.target.value)}
                className="flex-1 border border-gray-warm rounded-lg px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-red"
              />
              <button onClick={() => removeInspirationLink(idx)} className="text-gray-mid hover:text-red text-sm px-2">✕</button>
            </div>
          ))}
          {inspirationLinks.length === 0 ? (
            <button
              onClick={addInspirationLink}
              className="w-full border border-dashed border-gray-warm rounded-lg py-4 text-gray-mid text-sm font-ui font-semibold hover:border-red hover:text-red transition-colors"
            >
              + Add a link
            </button>
          ) : inspirationLinks.length < 3 ? (
            <button onClick={addInspirationLink} className="text-red text-sm font-ui font-semibold hover:underline">
              + Add another
            </button>
          ) : null}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="flex-1 border border-gray-warm text-charcoal font-ui font-semibold py-4 rounded-lg hover:border-charcoal transition-colors">
          ← Back
        </button>
        <button onClick={onNext} className="flex-[2] bg-red text-white font-ui font-bold py-4 rounded-lg hover:bg-red-dark transition-colors">
          Continue →
        </button>
      </div>
    </div>
  );
}
