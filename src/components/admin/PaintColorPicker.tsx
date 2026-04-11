"use client";

import { useEffect, useRef, useState } from "react";

export interface PaintColor {
  id: string;
  code: string;
  name: string;
  hex: string;
  brand: string;
}

interface PaintColorPickerProps {
  brand?: string;
  selected: PaintColor | null;
  onSelect: (color: PaintColor | null) => void;
  placeholder?: string;
}

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

export default function PaintColorPicker({
  brand = "Sherwin-Williams",
  selected,
  onSelect,
  placeholder = "Search by name or code...",
}: PaintColorPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PaintColor[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/paint-colors?q=${encodeURIComponent(query)}&brand=${encodeURIComponent(brand)}`,
        );
        const data = (await res.json()) as PaintColor[];
        setResults(data);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(debounceRef.current);
  }, [query, brand]);

  const handleSelect = (color: PaintColor) => {
    onSelect(color);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setQuery("");
  };

  return (
    <div ref={ref} className="relative">
      {selected ? (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
          <div
            className="h-10 w-10 flex-shrink-0 rounded-lg border border-gray-200"
            style={{ backgroundColor: selected.hex }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-ui text-sm font-semibold text-gray-900">{selected.name}</p>
            <p className="font-ui text-xs text-gray-500">{selected.code} · {selected.brand}</p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="font-ui text-lg leading-none text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder={placeholder}
            className="w-full rounded-sm border border-gray-warm bg-white px-3 py-2 pr-8 font-ui text-sm text-charcoal outline-none transition focus:border-navy"
          />
          {loading && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <div
                className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300"
                style={{ borderTopColor: "#CC2027" }}
              />
            </div>
          )}
        </div>
      )}

      {open && results.length > 0 && !selected && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          {results.map((color) => (
            <button
              key={color.id}
              type="button"
              onClick={() => handleSelect(color)}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
            >
              <div
                className="h-8 w-8 flex-shrink-0 rounded-lg border border-gray-200"
                style={{ backgroundColor: color.hex }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-ui text-sm font-medium text-gray-900">{color.name}</p>
                <p className="font-ui text-xs text-gray-400">{color.code}</p>
              </div>
              <div
                className="rounded px-2 py-0.5 font-mono text-xs"
                style={{
                  backgroundColor: color.hex,
                  color: isLight(color.hex) ? "#374151" : "#ffffff",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                {color.hex}
              </div>
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
          <p className="text-center font-ui text-sm text-gray-500">
            No colors found for &ldquo;{query}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
