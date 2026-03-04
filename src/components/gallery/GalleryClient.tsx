"use client";

import { useMemo, useState } from "react";
import { Play } from "lucide-react";
import { SERVICES } from "@/lib/constants";
import type { PublishedAsset } from "@/lib/portfolio.types";

type Props = {
  assets: PublishedAsset[];
};

const ALL_FILTER = "all";

function serviceLabel(asset: PublishedAsset) {
  const first = asset.tags[0];
  if (!first) return "Featured";
  if (asset.tags.length === 1) return first.title;
  return `${first.title} +${asset.tags.length - 1}`;
}

function PlaceholderCard() {
  return <div className="aspect-square rounded-lg bg-gray-warm" aria-hidden />;
}

export default function GalleryClient({ assets }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>(ALL_FILTER);
  const [failedIds, setFailedIds] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    if (activeFilter === ALL_FILTER) return assets;
    return assets.filter((asset) =>
      asset.tags.some((tag) => tag.slug === activeFilter),
    );
  }, [activeFilter, assets]);

  return (
    <>
      <p className="font-ui text-sm text-gray-mid">{filtered.length} Projects</p>

      <div className="mt-8 flex flex-wrap gap-2">
        <button
          type="button"
          className={`font-ui rounded-sm border px-3 py-2 text-sm transition-colors ${
            activeFilter === ALL_FILTER
              ? "border-red bg-red text-white"
              : "border-gray-mid/30 bg-white text-charcoal hover:border-red hover:text-red"
          }`}
          onClick={() => setActiveFilter(ALL_FILTER)}
        >
          All Work
        </button>
        {SERVICES.map((service) => (
          <button
            key={service.slug}
            type="button"
            className={`font-ui rounded-sm border px-3 py-2 text-sm transition-colors ${
              activeFilter === service.slug
                ? "border-red bg-red text-white"
                : "border-gray-mid/30 bg-white text-charcoal hover:border-red hover:text-red"
            }`}
            onClick={() => setActiveFilter(service.slug)}
          >
            {service.shortTitle}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10">
          <p className="font-ui text-sm text-gray-mid">Portfolio coming soon.</p>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <PlaceholderCard key={index} />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((asset) => (
            <div
              key={asset.id}
              className="group relative aspect-square overflow-hidden rounded-lg bg-white shadow-sm"
            >
              {asset.kind === "IMAGE" ? (
                failedIds[asset.id] ? (
                  <PlaceholderCard />
                ) : (
                  <img
                    src={asset.secureUrl}
                    alt={asset.alt || serviceLabel(asset)}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={() =>
                      setFailedIds((current) => ({ ...current, [asset.id]: true }))
                    }
                  />
                )
              ) : (
                <a
                  href={asset.secureUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-full w-full items-center justify-center bg-charcoal"
                >
                  <Play className="h-12 w-12 text-white/80" />
                </a>
              )}

              <div className="pointer-events-none absolute inset-0 flex items-end bg-black/0 p-3 transition-colors duration-300 group-hover:bg-black/30">
                <span className="font-ui rounded-sm bg-white/90 px-2 py-1 text-xs font-semibold text-charcoal opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {serviceLabel(asset)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
