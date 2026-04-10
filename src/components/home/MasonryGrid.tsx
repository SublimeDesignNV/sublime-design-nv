"use client";

import { useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import Link from "next/link";

interface GridAsset {
  id: string;
  url: string;
  kind: "IMAGE" | "VIDEO";
  alt: string | null;
  width: number | null;
  height: number | null;
  project: {
    title: string;
    slug: string;
    location: string | null;
    serviceSlug: string | null;
    areaSlug: string | null;
  } | null;
}

const breakpointCols = {
  default: 3,
  1024: 3,
  768: 2,
  640: 2,
  480: 1,
};

function slugToLabel(slug: string | null | undefined): string {
  if (!slug) return "";
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function MasonryGrid() {
  const [assets, setAssets] = useState<GridAsset[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portfolio-grid?limit=15")
      .then((r) => r.json())
      .then((data) => {
        setAssets(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl bg-gray-100"
            style={{ height: `${180 + (i % 3) * 60}px` }}
          />
        ))}
      </div>
    );
  }

  if (assets.length === 0) return null;

  return (
    <Masonry
      breakpointCols={breakpointCols}
      className="flex w-full gap-3"
      columnClassName="flex flex-col gap-3"
    >
      {assets.map((asset) => {
        const isExpanded = expanded === asset.id;
        const isVideo = asset.kind === "VIDEO";
        const serviceLabel = slugToLabel(asset.project?.serviceSlug);
        const locationLabel = asset.project?.location ?? slugToLabel(asset.project?.areaSlug);

        return (
          <div
            key={asset.id}
            className="group cursor-pointer overflow-hidden rounded-xl bg-gray-100"
            onClick={() => setExpanded((prev) => (prev === asset.id ? null : asset.id))}
          >
            {/* Media */}
            <div className="relative w-full overflow-hidden">
              {isVideo ? (
                <video
                  src={asset.url}
                  className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  muted
                  playsInline
                  loop
                  autoPlay
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={asset.url}
                  alt={asset.alt ?? asset.project?.title ?? "Sublime Design NV"}
                  className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-end bg-black/0 transition-colors duration-300 group-hover:bg-black/20">
                {serviceLabel && (
                  <span className="m-2 rounded-full bg-black/50 px-2 py-1 font-ui text-xs font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {serviceLabel}
                  </span>
                )}
              </div>
            </div>

            {/* Expand panel */}
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: isExpanded ? "300px" : "0px" }}
            >
              <div className="border-t border-gray-100 bg-white p-4">
                {asset.project?.title && (
                  <h3 className="mb-1 font-ui text-sm font-semibold text-gray-900">
                    {asset.project.title}
                  </h3>
                )}
                <div className="mb-3 flex flex-wrap gap-2">
                  {serviceLabel && (
                    <span className="rounded-full bg-red px-2 py-1 font-ui text-xs font-medium text-white">
                      {serviceLabel}
                    </span>
                  )}
                  {locationLabel && (
                    <span className="rounded-full bg-gray-100 px-2 py-1 font-ui text-xs text-gray-600">
                      {locationLabel}
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  {asset.project?.slug && (
                    <Link
                      href={`/projects/${asset.project.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-ui text-sm font-medium text-red hover:underline"
                    >
                      View Project →
                    </Link>
                  )}
                  <Link
                    href="/quote"
                    onClick={(e) => e.stopPropagation()}
                    className="font-ui text-sm font-medium text-navy hover:underline"
                  >
                    Get a Free Quote →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </Masonry>
  );
}
