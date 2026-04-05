"use client";

import { useRef, useState } from "react";

type PhotoEntry = { id: string; url: string; caption: string };
type LinkEntry = { url: string; label: string };

type Props = {
  leadId: string;
  spacePhotos: PhotoEntry[];
  onSpacePhotosChange: (photos: PhotoEntry[]) => void;
  inspirationPhotos: PhotoEntry[];
  onInspirationPhotosChange: (photos: PhotoEntry[]) => void;
  detailPhotos: PhotoEntry[];
  onDetailPhotosChange: (photos: PhotoEntry[]) => void;
  photosSkipped: boolean;
  onPhotosSkipped: (skipped: boolean) => void;
  productLinks: LinkEntry[];
  onProductLinksChange: (links: LinkEntry[]) => void;
  inspirationLinks: LinkEntry[];
  onInspirationLinksChange: (links: LinkEntry[]) => void;
  onNext: () => void;
  onBack: () => void;
};

type BucketId = "space" | "inspiration" | "detail";

const BUCKETS: { id: BucketId; emoji: string; label: string; description: string; assetType: string }[] = [
  {
    id: "space",
    emoji: "📷",
    label: "The Room",
    description: "Show us the actual space — walls, floor, ceiling, existing features. Multiple angles help.",
    assetType: "SPACE_PHOTO",
  },
  {
    id: "inspiration",
    emoji: "✨",
    label: "What You Love",
    description: "Screenshots from Pinterest, Instagram, Houzz — anything that shows the vibe you're going for.",
    assetType: "INSPIRATION_PHOTO",
  },
  {
    id: "detail",
    emoji: "🔍",
    label: "Specific Details",
    description: "A handle you love, a wood tone, a finish, a product screenshot — anything specific.",
    assetType: "INSPIRATION_PHOTO",
  },
];

function UploadBucket({
  leadId,
  bucket,
  photos,
  onPhotosChange,
}: {
  leadId: string;
  bucket: (typeof BUCKETS)[number];
  photos: PhotoEntry[];
  onPhotosChange: (photos: PhotoEntry[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList) {
    setError(null);
    setUploading(true);
    const newPhotos: PhotoEntry[] = [];
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        try {
          const form = new FormData();
          form.append("file", file);
          form.append("type", bucket.assetType);
          const res = await fetch(`/api/leads/${leadId}/upload`, { method: "POST", body: form });
          if (!res.ok) {
            const data = (await res.json().catch(() => ({}))) as { error?: string };
            throw new Error(data.error ?? `Upload failed (${res.status})`);
          }
          const data = (await res.json()) as { ok: boolean; asset: { id: string; url: string } };
          const caption = bucket.id === "detail" ? "detail reference" : "";
          newPhotos.push({ id: data.asset.id, url: data.asset.url, caption });
        } catch (err) {
          console.error(`[SpacePhotosStep] ${bucket.id} upload error:`, err);
          setError("One or more photos failed to upload. Please try again.");
        }
      }
      onPhotosChange([...photos, ...newPhotos]);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="font-ui font-bold text-charcoal text-base">
          {bucket.emoji} {bucket.label}
        </p>
        <p className="text-gray-mid text-sm mt-0.5">{bucket.description}</p>
      </div>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length) void handleFiles(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-gray-warm rounded-xl p-6 text-center cursor-pointer hover:border-red transition-colors"
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
        ) : photos.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-1 justify-center">
            {photos.slice(0, 4).map((p) => (
              <img key={p.id} src={p.url} alt="" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
            ))}
            {photos.length > 4 && (
              <div className="w-16 h-16 rounded-lg flex-shrink-0 bg-gray-warm flex items-center justify-center text-xs font-ui font-semibold text-gray-mid">
                +{photos.length - 4}
              </div>
            )}
            <div className="w-16 h-16 rounded-lg flex-shrink-0 border-2 border-dashed border-gray-warm flex items-center justify-center text-gray-mid text-lg hover:border-red transition-colors">
              +
            </div>
          </div>
        ) : (
          <p className="text-sm font-ui font-semibold text-gray-mid">Tap to add photos</p>
        )}
      </div>
      {error && <p className="text-red text-xs">{error}</p>}
    </div>
  );
}

export default function SpacePhotosStep({
  leadId,
  spacePhotos,
  onSpacePhotosChange,
  inspirationPhotos,
  onInspirationPhotosChange,
  detailPhotos,
  onDetailPhotosChange,
  photosSkipped,
  onPhotosSkipped,
  productLinks,
  onProductLinksChange,
  inspirationLinks,
  onInspirationLinksChange,
  onNext,
  onBack,
}: Props) {
  const totalPhotos = spacePhotos.length + inspirationPhotos.length + detailPhotos.length;
  const canContinue = totalPhotos > 0 || photosSkipped;

  function addProductLink() {
    if (productLinks.length < 5) onProductLinksChange([...productLinks, { url: "", label: "" }]);
  }

  function updateProductLink(idx: number, key: "url" | "label", value: string) {
    const next = [...productLinks];
    next[idx] = { ...next[idx], [key]: value };
    onProductLinksChange(next);
  }

  function addInspirationLink() {
    if (inspirationLinks.length < 3) onInspirationLinksChange([...inspirationLinks, { url: "", label: "" }]);
  }

  function updateInspirationLink(idx: number, value: string) {
    const next = [...inspirationLinks];
    next[idx] = { ...next[idx], url: value };
    onInspirationLinksChange(next);
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display text-2xl text-charcoal mb-2">Photos &amp; Inspiration</h2>
        <p className="text-gray-mid">
          Even one photo makes a huge difference in your concept. Add as many as you&apos;d like.
        </p>
      </div>

      {/* 3 Upload Buckets */}
      <div className="space-y-6">
        {[
          { bucket: BUCKETS[0], photos: spacePhotos, onChange: onSpacePhotosChange },
          { bucket: BUCKETS[1], photos: inspirationPhotos, onChange: onInspirationPhotosChange },
          { bucket: BUCKETS[2], photos: detailPhotos, onChange: onDetailPhotosChange },
        ].map(({ bucket, photos, onChange }) => (
          <UploadBucket
            key={bucket.id}
            leadId={leadId}
            bucket={bucket}
            photos={photos}
            onPhotosChange={onChange}
          />
        ))}
      </div>

      {totalPhotos === 0 && !photosSkipped && (
        <p className="text-center">
          <button
            onClick={() => onPhotosSkipped(true)}
            className="text-gray-mid text-sm underline hover:text-charcoal"
          >
            Skip for now — I&apos;ll send photos later
          </button>
        </p>
      )}

      {photosSkipped && (
        <div className="bg-navy/5 border border-navy/20 rounded-xl p-4 text-center">
          <p className="text-navy text-sm font-ui font-semibold">
            Got it! We&apos;ll follow up to collect photos before your consultation.
          </p>
          <button
            onClick={() => onPhotosSkipped(false)}
            className="text-gray-mid text-xs underline mt-1 hover:text-charcoal"
          >
            Actually, I&apos;ll add photos now
          </button>
        </div>
      )}

      {/* Links section */}
      <div className="border-t border-gray-warm pt-6 space-y-5">
        <p className="font-ui font-bold text-charcoal">🔗 Links (optional)</p>

        {/* Product links */}
        <div className="space-y-3">
          <p className="text-sm font-ui font-semibold text-charcoal">Product links</p>
          <p className="text-gray-mid text-xs">Found a specific product, hardware, or finish you want to use?</p>
          {productLinks.map((link, idx) => (
            <div key={idx} className="space-y-1.5 border border-gray-warm rounded-lg p-3">
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
                  placeholder='What is this? (optional)'
                  value={link.label}
                  onChange={(e) => updateProductLink(idx, "label", e.target.value)}
                  className="flex-1 border border-gray-warm rounded-lg px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-red"
                />
                <button
                  onClick={() => onProductLinksChange(productLinks.filter((_, i) => i !== idx))}
                  className="text-gray-mid hover:text-red text-sm px-2"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          {productLinks.length === 0 ? (
            <button
              onClick={addProductLink}
              className="w-full border border-dashed border-gray-warm rounded-lg py-3 text-gray-mid text-sm font-ui font-semibold hover:border-red hover:text-red transition-colors"
            >
              + Add a product link
            </button>
          ) : productLinks.length < 5 ? (
            <button onClick={addProductLink} className="text-red text-sm font-ui font-semibold hover:underline">
              + Add another
            </button>
          ) : null}
        </div>

        {/* Inspiration links */}
        <div className="space-y-3">
          <p className="text-sm font-ui font-semibold text-charcoal">Videos &amp; websites</p>
          <p className="text-gray-mid text-xs">YouTube video, website, or anything else that shows the vibe?</p>
          {inspirationLinks.map((link, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="url"
                placeholder="https://youtube.com/..."
                value={link.url}
                onChange={(e) => updateInspirationLink(idx, e.target.value)}
                className="flex-1 border border-gray-warm rounded-lg px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-red"
              />
              <button
                onClick={() => onInspirationLinksChange(inspirationLinks.filter((_, i) => i !== idx))}
                className="text-gray-mid hover:text-red text-sm px-2"
              >
                ✕
              </button>
            </div>
          ))}
          {inspirationLinks.length === 0 ? (
            <button
              onClick={addInspirationLink}
              className="w-full border border-dashed border-gray-warm rounded-lg py-3 text-gray-mid text-sm font-ui font-semibold hover:border-red hover:text-red transition-colors"
            >
              + Add a link
            </button>
          ) : inspirationLinks.length < 3 ? (
            <button onClick={addInspirationLink} className="text-red text-sm font-ui font-semibold hover:underline">
              + Add another
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-warm text-charcoal font-ui font-semibold py-4 rounded-lg hover:border-charcoal transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="flex-[2] bg-red text-white font-ui font-bold py-4 rounded-lg hover:bg-red-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
