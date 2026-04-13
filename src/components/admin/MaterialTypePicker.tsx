"use client";

import { useEffect, useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

type SupplierRef = { id: string; name: string; slug: string };
type MaterialRef = { id: string; name: string; sku: string | null; sheen: string | null; slug: string };
type ManufacturerEntry = {
  id: string;
  name: string;
  slug: string;
  suppliers: SupplierRef[];
  materials: MaterialRef[];
};
type CategoryEntry = {
  id: string;
  name: string;
  slug: string;
  manufacturers: ManufacturerEntry[];
};

export type MaterialSelection = {
  categoryId: string | null;
  categoryName: string | null;
  manufacturerId: string | null;
  manufacturerName: string | null;
  supplierId: string | null;
  supplierName: string | null;
  materialId: string | null;
  materialName: string | null;
  sheen: string | null;
};

export const EMPTY_MATERIAL_SELECTION: MaterialSelection = {
  categoryId: null,
  categoryName: null,
  manufacturerId: null,
  manufacturerName: null,
  supplierId: null,
  supplierName: null,
  materialId: null,
  materialName: null,
  sheen: null,
};

// Sheen options shown when no DB material is selected (manual override)
const MANUAL_SHEENS = [
  "Super Matte (SM)",
  "Matte",
  "Suede",
  "Textured",
  "EIR",
  "Semi-Gloss",
  "Gloss",
];

interface Props {
  value: MaterialSelection;
  onChange: (val: MaterialSelection) => void;
}

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border px-3 py-1.5 font-ui text-sm font-semibold transition-colors"
      style={{
        backgroundColor: active ? "#1B2A6B" : "white",
        color: active ? "white" : "#374151",
        borderColor: active ? "#1B2A6B" : "#d1d5db",
      }}
    >
      {label}
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 font-ui text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
      {children}
    </p>
  );
}

export default function MaterialTypePicker({ value, onChange }: Props) {
  const [categories, setCategories] = useState<CategoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/materials/categories")
      .then((r) => r.json())
      .then((data: CategoryEntry[]) => setCategories(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selectedCat = categories.find((c) => c.id === value.categoryId) ?? null;
  const selectedMfg = selectedCat?.manufacturers.find((m) => m.id === value.manufacturerId) ?? null;
  const suppliers = selectedMfg?.suppliers ?? [];
  const materials = selectedMfg?.materials ?? [];

  function selectCategory(cat: CategoryEntry) {
    if (cat.id === value.categoryId) {
      onChange(EMPTY_MATERIAL_SELECTION);
    } else {
      onChange({ ...EMPTY_MATERIAL_SELECTION, categoryId: cat.id, categoryName: cat.name });
    }
  }

  function selectManufacturer(mfg: ManufacturerEntry) {
    if (mfg.id === value.manufacturerId) {
      onChange({ ...value, manufacturerId: null, manufacturerName: null, supplierId: null, supplierName: null, materialId: null, materialName: null, sheen: null });
    } else {
      onChange({ ...value, manufacturerId: mfg.id, manufacturerName: mfg.name, supplierId: null, supplierName: null, materialId: null, materialName: null, sheen: null });
    }
  }

  function selectSupplier(sup: SupplierRef) {
    if (sup.id === value.supplierId) {
      onChange({ ...value, supplierId: null, supplierName: null });
    } else {
      onChange({ ...value, supplierId: sup.id, supplierName: sup.name });
    }
  }

  function selectMaterial(mat: MaterialRef) {
    if (mat.id === value.materialId) {
      onChange({ ...value, materialId: null, materialName: null, sheen: value.sheen });
    } else {
      onChange({ ...value, materialId: mat.id, materialName: mat.name, sheen: mat.sheen ?? value.sheen });
    }
  }

  function selectSheen(sheen: string) {
    onChange({ ...value, sheen: value.sheen === sheen ? null : sheen });
  }

  if (loading) {
    return <p className="font-ui text-sm text-gray-400">Loading materials…</p>;
  }

  if (categories.length === 0) {
    return (
      <p className="font-ui text-sm text-gray-400">
        No materials in database yet.{" "}
        <a href="/admin/materials" className="text-red underline">
          Add materials →
        </a>
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {/* Category */}
      <div>
        <Label>Category</Label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Pill
              key={cat.id}
              label={cat.name}
              active={cat.id === value.categoryId}
              onClick={() => selectCategory(cat)}
            />
          ))}
        </div>
      </div>

      {/* Manufacturer — only when category selected */}
      {selectedCat && selectedCat.manufacturers.length > 0 && (
        <div>
          <Label>Manufacturer</Label>
          <div className="flex flex-wrap gap-2">
            {selectedCat.manufacturers.map((mfg) => (
              <Pill
                key={mfg.id}
                label={mfg.name}
                active={mfg.id === value.manufacturerId}
                onClick={() => selectManufacturer(mfg)}
              />
            ))}
          </div>
        </div>
      )}
      {selectedCat && selectedCat.manufacturers.length === 0 && (
        <p className="font-ui text-xs text-gray-400">
          No products in this category yet.{" "}
          <a href="/admin/materials" className="text-red underline">
            Add materials →
          </a>
        </p>
      )}

      {/* Supplier — only when manufacturer selected and suppliers exist */}
      {selectedMfg && suppliers.length > 0 && (
        <div>
          <Label>Supplier (who you bought it from)</Label>
          <div className="flex flex-wrap gap-2">
            {suppliers.map((sup) => (
              <Pill
                key={sup.id}
                label={sup.name}
                active={sup.id === value.supplierId}
                onClick={() => selectSupplier(sup)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Specific Product — only when manufacturer selected */}
      {selectedMfg && materials.length > 0 && (
        <div>
          <Label>Specific Product (optional)</Label>
          <select
            value={value.materialId ?? ""}
            onChange={(e) => {
              const mat = materials.find((m) => m.id === e.target.value);
              if (mat) selectMaterial(mat);
              else onChange({ ...value, materialId: null, materialName: null });
            }}
            className="w-full rounded-sm border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none transition focus:border-navy"
          >
            <option value="">— Select a product —</option>
            {materials.map((mat) => (
              <option key={mat.id} value={mat.id}>
                {mat.name}{mat.sku ? ` (${mat.sku})` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Sheen — always shown when category selected; auto-filled from product */}
      {value.categoryId && (
        <div>
          <Label>Sheen / Finish</Label>
          <div className="flex flex-wrap gap-2">
            {MANUAL_SHEENS.map((s) => (
              <Pill
                key={s}
                label={s}
                active={value.sheen === s}
                onClick={() => selectSheen(s)}
              />
            ))}
          </div>
          {value.sheen && value.materialId && (
            <p className="mt-1 font-ui text-xs text-gray-400">
              Auto-filled from product — tap to override.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
