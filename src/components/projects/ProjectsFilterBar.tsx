"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Facet = {
  value: string;
  count: number;
};

type Filters = {
  service?: string;
  city?: string;
  material?: string;
  featured?: "true";
  year?: string;
};

type Props = {
  facets: {
    services: Facet[];
    cities: Facet[];
    materials: Facet[];
    years: Facet[];
  };
  filters: Filters;
};

export default function ProjectsFilterBar({ facets, filters }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeChips = useMemo(() => {
    return [
      filters.service ? { key: "service", label: `Service: ${filters.service}` } : null,
      filters.city ? { key: "city", label: `City: ${filters.city}` } : null,
      filters.material ? { key: "material", label: `Material: ${filters.material}` } : null,
      filters.year ? { key: "year", label: `Year: ${filters.year}` } : null,
      filters.featured ? { key: "featured", label: "Featured" } : null,
    ].filter(Boolean) as Array<{ key: keyof Filters; label: string }>;
  }, [filters.city, filters.featured, filters.material, filters.service, filters.year]);

  function applyPatch(patch: Partial<Filters>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(patch) as Array<[keyof Filters, string | undefined]>) {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function clearAll() {
    router.push(pathname);
  }

  return (
    <section style={{ marginBottom: 18, border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
      <div
        style={{
          display: "grid",
          gap: 10,
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          alignItems: "end",
        }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <span>Service</span>
          <select
            value={filters.service ?? ""}
            onChange={(event) => applyPatch({ service: event.target.value || undefined })}
            style={{ border: "1px solid #ccc", borderRadius: 8, padding: 8 }}
          >
            <option value="">All</option>
            {facets.services.map((item) => (
              <option key={item.value} value={item.value}>
                {item.value} ({item.count})
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>City</span>
          <select
            value={filters.city ?? ""}
            onChange={(event) => applyPatch({ city: event.target.value || undefined })}
            style={{ border: "1px solid #ccc", borderRadius: 8, padding: 8 }}
          >
            <option value="">All</option>
            {facets.cities.map((item) => (
              <option key={item.value} value={item.value}>
                {item.value} ({item.count})
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Material</span>
          <select
            value={filters.material ?? ""}
            onChange={(event) => applyPatch({ material: event.target.value || undefined })}
            style={{ border: "1px solid #ccc", borderRadius: 8, padding: 8 }}
          >
            <option value="">All</option>
            {facets.materials.map((item) => (
              <option key={item.value} value={item.value}>
                {item.value} ({item.count})
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Year</span>
          <select
            value={filters.year ?? ""}
            onChange={(event) => applyPatch({ year: event.target.value || undefined })}
            style={{ border: "1px solid #ccc", borderRadius: 8, padding: 8 }}
          >
            <option value="">All</option>
            {facets.years.map((item) => (
              <option key={item.value} value={item.value}>
                {item.value} ({item.count})
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 8 }}>
          <input
            type="checkbox"
            checked={filters.featured === "true"}
            onChange={(event) => applyPatch({ featured: event.target.checked ? "true" : undefined })}
          />
          Featured only
        </label>
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {activeChips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => applyPatch({ [chip.key]: undefined })}
            style={{
              border: "1px solid #ccc",
              borderRadius: 999,
              padding: "4px 10px",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            {chip.label} ×
          </button>
        ))}

        {activeChips.length > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            style={{ border: "1px solid #111", borderRadius: 8, padding: "6px 10px" }}
          >
            Reset filters
          </button>
        ) : null}
      </div>
    </section>
  );
}
