"use client";

import type { IntakeLeadAsset, IntakeAssetType } from "@prisma/client";

const TYPE_LABELS: Record<IntakeAssetType, string> = {
  SPACE_PHOTO: "Space Photos",
  INSPIRATION_PHOTO: "Inspiration Photos",
  VIDEO: "Videos",
  PRODUCT_LINK: "Product Links",
  INSPIRATION_LINK: "Inspiration Links",
  VISION_RENDER: "AI Render",
};

type Props = {
  assets: IntakeLeadAsset[];
};

function PhotoGrid({ assets, label }: { assets: IntakeLeadAsset[]; label: string }) {
  if (assets.length === 0) return null;
  return (
    <div>
      <h3 className="text-sm font-ui font-semibold text-gray-mid uppercase tracking-wide mb-4">{label}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {assets.map((asset) => (
          <div key={asset.id} className="group relative aspect-square overflow-hidden rounded-xl border border-gray-warm">
            <a href={asset.url} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.url}
                alt={asset.caption ?? label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </a>
            {asset.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-charcoal/70 text-white text-xs px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {asset.caption}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function LinkList({ assets, label }: { assets: IntakeLeadAsset[]; label: string }) {
  if (assets.length === 0) return null;
  return (
    <div>
      <h3 className="text-sm font-ui font-semibold text-gray-mid uppercase tracking-wide mb-3">{label}</h3>
      <ul className="space-y-2">
        {assets.map((asset) => (
          <li key={asset.id} className="flex items-start gap-3 bg-white border border-gray-warm rounded-lg p-3">
            <span className="text-xl flex-shrink-0">{label.includes("Product") ? "🛒" : "🔗"}</span>
            <div>
              <a
                href={asset.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red hover:underline text-sm break-all"
              >
                {asset.url}
              </a>
              {asset.caption && (
                <p className="text-charcoal text-sm mt-1">{asset.caption}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MediaTab({ assets }: Props) {
  const byType = (type: IntakeAssetType) => assets.filter((a) => a.type === type);

  const spacePhotos = byType("SPACE_PHOTO");
  const inspoPhotos = byType("INSPIRATION_PHOTO");
  const renders = byType("VISION_RENDER");
  const videos = byType("VIDEO");
  const productLinks = byType("PRODUCT_LINK");
  const inspoLinks = byType("INSPIRATION_LINK");

  const total = assets.length;

  if (total === 0) {
    return (
      <div className="text-center py-12 text-gray-mid">
        <p>No media uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <PhotoGrid assets={renders} label="AI Render" />
      <PhotoGrid assets={spacePhotos} label={`${TYPE_LABELS.SPACE_PHOTO} (${spacePhotos.length})`} />
      <PhotoGrid assets={inspoPhotos} label={`${TYPE_LABELS.INSPIRATION_PHOTO} (${inspoPhotos.length})`} />
      <PhotoGrid assets={videos} label={TYPE_LABELS.VIDEO} />
      <LinkList assets={productLinks} label={`${TYPE_LABELS.PRODUCT_LINK} (${productLinks.length})`} />
      <LinkList assets={inspoLinks} label={`${TYPE_LABELS.INSPIRATION_LINK} (${inspoLinks.length})`} />
    </div>
  );
}
