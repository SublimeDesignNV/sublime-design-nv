"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { type PaintColor } from "@/components/admin/PaintColorPicker";

type ColorTag = PaintColor & { tagId: string; number?: string | null };

function isLight(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

interface Props {
  assetId: string;
  assetTitle: string | null;
  onClose: () => void;
}

export default function ColorTagModal({ assetId, assetTitle, onClose }: Props) {
  const [tags, setTags] = useState<ColorTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PaintColor[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Load existing tags
  useEffect(() => {
    fetch(`/api/admin/assets/${assetId}/colors`)
      .then((r) => r.json())
      .then((data: ColorTag[]) => setTags(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [assetId]);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/paint-colors?q=${encodeURIComponent(query)}&limit=10`);
        const data = (await res.json()) as PaintColor[];
        setResults(data.filter((c) => !tags.some((t) => t.id === c.id)));
        setOpen(true);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, tags]);

  async function addColor(color: PaintColor) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/assets/${assetId}/colors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paintColorId: color.id }),
      });
      const tag = (await res.json()) as ColorTag;
      setTags((prev) => [...prev, tag]);
    } finally {
      setSaving(false);
    }
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  async function removeColor(tagId: string) {
    await fetch(`/api/admin/assets/${assetId}/colors/${tagId}`, { method: "DELETE" });
    setTags((prev) => prev.filter((t) => t.tagId !== tagId));
  }

  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-charcoal/55 p-4"
      onClick={handleBackdrop}
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl text-charcoal">Tag Paint Colors</h3>
            {assetTitle && (
              <p className="mt-0.5 font-ui text-xs text-gray-mid">{assetTitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm p-1 text-gray-mid hover:text-charcoal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current tags */}
        <div className="mt-4 min-h-[40px]">
          {loading ? (
            <p className="font-ui text-xs text-gray-mid">Loading…</p>
          ) : tags.length === 0 ? (
            <p className="font-ui text-xs text-gray-mid">No colors tagged yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag.tagId}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 py-1 pl-2 pr-1 font-ui text-xs text-charcoal"
                >
                  <span
                    className="h-3 w-3 flex-shrink-0 rounded-full border border-gray-200"
                    style={{ backgroundColor: tag.hex }}
                  />
                  <span className="font-semibold">{tag.number ?? tag.code}</span>
                  <span className="text-gray-mid">{tag.name}</span>
                  <button
                    type="button"
                    onClick={() => void removeColor(tag.tagId)}
                    className="ml-0.5 rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-red"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Search colors… e.g. Extra White or SW 7006"
            className="w-full rounded-sm border border-gray-warm bg-white px-3 py-2 pr-8 font-ui text-sm text-charcoal outline-none transition focus:border-navy"
            disabled={saving}
          />
          {(searching || saving) && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <div
                className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300"
                style={{ borderTopColor: "#CC2027" }}
              />
            </div>
          )}

          {/* Dropdown */}
          {open && results.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
              {results.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    void addColor(color);
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                >
                  <div
                    className="h-7 w-7 flex-shrink-0 rounded-md border border-gray-200"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-ui text-sm font-bold text-charcoal">
                      {(color as PaintColor & { number?: string }).number ?? color.code}
                    </p>
                    <p className="truncate font-ui text-xs text-gray-mid">
                      {color.name} · {color.brand}
                    </p>
                  </div>
                  <span
                    className="rounded px-1.5 py-0.5 font-mono text-xs"
                    style={{
                      backgroundColor: color.hex,
                      color: isLight(color.hex) ? "#374151" : "#ffffff",
                      border: "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    {color.hex}
                  </span>
                </button>
              ))}
            </div>
          )}
          {open && query.length >= 2 && results.length === 0 && !searching && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
              <p className="text-center font-ui text-sm text-gray-mid">
                No colors found for &ldquo;{query}&rdquo;
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm bg-charcoal px-4 py-2 font-ui text-sm font-semibold text-white transition hover:opacity-80"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
