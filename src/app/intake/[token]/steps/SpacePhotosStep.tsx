"use client";

import { useRef, useState } from "react";

type UploadedPhoto = {
  id: string;
  url: string;
  caption: string;
};

type Props = {
  leadId: string;
  photos: UploadedPhoto[];
  onPhotosChange: (photos: UploadedPhoto[]) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function SpacePhotosStep({ leadId, photos, onPhotosChange, onNext, onBack }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList) {
    setError(null);
    setUploading(true);
    const newPhotos: UploadedPhoto[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("type", "SPACE_PHOTO");

        const res = await fetch(`/api/leads/${leadId}/upload`, {
          method: "POST",
          body: form,
        });

        if (!res.ok) throw new Error("Upload failed");
        const data = (await res.json()) as { ok: boolean; asset: { id: string; url: string } };
        newPhotos.push({ id: data.asset.id, url: data.asset.url, caption: "" });
      } catch {
        setError("One or more photos failed to upload. Please try again.");
      }
    }

    onPhotosChange([...photos, ...newPhotos]);
    setUploading(false);
  }

  function updateCaption(id: string, caption: string) {
    onPhotosChange(photos.map((p) => (p.id === id ? { ...p, caption } : p)));
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl text-charcoal mb-2">Show us what we&apos;re working with.</h2>
        <p className="text-gray-mid">
          Take photos of the actual space. Don&apos;t worry about clutter — we just need to see the
          dimensions and current state.
        </p>
      </div>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length) void handleFiles(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-gray-warm rounded-xl p-10 text-center cursor-pointer hover:border-red transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => e.target.files && void handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="text-gray-mid">
            <div className="w-8 h-8 border-2 border-red border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Uploading...
          </div>
        ) : (
          <>
            <div className="text-4xl mb-3">📷</div>
            <p className="font-ui font-semibold text-charcoal">Tap to take a photo or upload</p>
            <p className="text-gray-mid text-sm mt-1">or drag and drop files here</p>
          </>
        )}
      </div>

      {error && <p className="text-red text-sm">{error}</p>}

      {photos.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-ui font-semibold text-charcoal">{photos.length} photo{photos.length !== 1 ? "s" : ""} uploaded</p>
          {photos.map((photo) => (
            <div key={photo.id} className="flex gap-3 items-start bg-white rounded-lg p-3 border border-gray-warm">
              <img src={photo.url} alt="" className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
              <input
                type="text"
                placeholder="What should we know about this photo? (optional)"
                value={photo.caption}
                onChange={(e) => updateCaption(photo.id, e.target.value)}
                className="flex-1 border-none outline-none text-sm text-charcoal placeholder-gray-mid"
              />
            </div>
          ))}
        </div>
      )}

      <p className="text-gray-mid text-sm text-center">
        {photos.length === 0 ? "Add at least 1 photo" : photos.length < 3 ? `Great start — adding ${3 - photos.length} more helps a lot` : "Looking great!"}
      </p>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-warm text-charcoal font-ui font-semibold py-4 rounded-lg hover:border-charcoal transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={photos.length === 0}
          className="flex-[2] bg-red text-white font-ui font-bold py-4 rounded-lg hover:bg-red-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
