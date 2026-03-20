"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ImageIcon, Video } from "lucide-react";

type AdminAsset = {
  id: string;
  kind: "IMAGE" | "VIDEO";
  secureUrl: string;
  title: string | null;
  location: string | null;
  primaryServiceSlug: string | null;
  primaryServiceLabel: string | null;
  published: boolean;
  createdAt: string;
  tags: Array<{ slug: string; title: string }>;
};

type AssetsResponse = {
  assets: AdminAsset[];
};

type Filter = "all" | "published" | "unpublished";

export default function AssetTable() {
  const [assets, setAssets] = useState<AdminAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const loadAssets = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/assets", { cache: "no-store" });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Failed to load assets.");
      }
      const data = (await response.json()) as AssetsResponse;
      setAssets(data.assets);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unknown error.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAssets();
  }, [loadAssets]);

  useEffect(() => {
    function onRefresh() {
      void loadAssets();
    }
    window.addEventListener("admin-assets-refresh", onRefresh);
    return () => window.removeEventListener("admin-assets-refresh", onRefresh);
  }, [loadAssets]);

  const filteredAssets = useMemo(() => {
    if (filter === "published") return assets.filter((asset) => asset.published);
    if (filter === "unpublished") return assets.filter((asset) => !asset.published);
    return assets;
  }, [assets, filter]);

  async function togglePublished(id: string, nextPublished: boolean) {
    const response = await fetch(`/api/admin/assets/${id}/publish`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: nextPublished }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error || "Failed to update published status.");
    }

    setAssets((current) =>
      current.map((asset) =>
        asset.id === id ? { ...asset, published: nextPublished } : asset,
      ),
    );
  }

  return (
    <section className="rounded-lg border border-gray-warm bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl text-charcoal">Assets</h2>
        <div className="flex flex-wrap gap-2">
          {(["all", "published", "unpublished"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`font-ui rounded-sm border px-3 py-1 text-sm transition-colors ${
                filter === value
                  ? "border-red bg-red text-white"
                  : "border-gray-warm text-charcoal hover:border-red hover:text-red"
              }`}
            >
              {value === "all"
                ? "All"
                : value === "published"
                  ? "Published"
                  : "Unpublished"}
            </button>
          ))}
          <button
            type="button"
            onClick={() => void loadAssets()}
            className="font-ui rounded-sm border border-gray-warm px-3 py-1 text-sm text-charcoal transition-colors hover:border-navy hover:text-navy"
          >
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? <p className="font-ui mt-4 text-sm text-gray-mid">Loading...</p> : null}
      {error ? <p className="font-ui mt-4 text-sm text-red">{error}</p> : null}

      {!isLoading && !error ? (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-warm text-left">
                <th className="font-ui py-2 pr-3 text-xs uppercase tracking-wide text-gray-mid">
                  Preview
                </th>
                <th className="font-ui py-2 pr-3 text-xs uppercase tracking-wide text-gray-mid">
                  Asset
                </th>
                <th className="font-ui py-2 pr-3 text-xs uppercase tracking-wide text-gray-mid">
                  Service
                </th>
                <th className="font-ui py-2 pr-3 text-xs uppercase tracking-wide text-gray-mid">
                  Published
                </th>
                <th className="font-ui py-2 text-xs uppercase tracking-wide text-gray-mid">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="border-b border-gray-warm/60">
                  <td className="py-2 pr-3">
                    {asset.kind === "IMAGE" ? (
                      <img
                        src={asset.secureUrl}
                        alt={asset.tags[0]?.title || "Asset preview"}
                        className="h-12 w-12 rounded-sm object-cover"
                      />
                    ) : (
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-gray-warm text-charcoal">
                        <Video className="h-5 w-5" />
                      </span>
                    )}
                  </td>
                  <td className="font-ui py-2 pr-3 text-sm text-charcoal">
                    <div className="inline-flex items-center gap-1">
                      {asset.kind === "IMAGE" ? (
                        <ImageIcon className="h-4 w-4 text-gray-mid" />
                      ) : (
                        <Video className="h-4 w-4 text-gray-mid" />
                      )}
                      <span>{asset.title || "Untitled asset"}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-mid">
                      {asset.location || asset.kind}
                    </p>
                  </td>
                  <td className="font-ui py-2 pr-3 text-sm text-charcoal">
                    {asset.primaryServiceLabel || asset.tags.map((tag) => tag.title).join(", ")}
                  </td>
                  <td className="py-2 pr-3">
                    <label className="font-ui inline-flex items-center gap-2 text-sm text-charcoal">
                      <input
                        type="checkbox"
                        checked={asset.published}
                        onChange={async (event) => {
                          try {
                            await togglePublished(asset.id, event.target.checked);
                          } catch (toggleError) {
                            setError(
                              toggleError instanceof Error
                                ? toggleError.message
                                : "Failed to update publish state.",
                            );
                          }
                        }}
                      />
                      {asset.published ? "Yes" : "No"}
                    </label>
                  </td>
                  <td className="font-ui py-2 text-sm text-gray-mid">
                    {new Date(asset.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAssets.length === 0 ? (
            <p className="font-ui py-4 text-sm text-gray-mid">No assets found.</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
