import type { AssetKind } from "@prisma/client";

export type PortfolioTag = {
  slug: string;
  title: string;
};

export type PortfolioAsset = {
  id: string;
  kind: AssetKind;
  secureUrl: string;
  width: number | null;
  height: number | null;
  duration: number | null;
  title: string | null;
  description: string | null;
  location: string | null;
  primaryServiceSlug: string | null;
  serviceMetadata: Record<string, unknown> | null;
  alt: string | null;
  createdAt: Date;
  tags: PortfolioTag[];
};

export type PortfolioResponse = {
  assets: PortfolioAsset[];
};

export type PublishedAsset = {
  id: string;
  kind: "IMAGE" | "VIDEO";
  secureUrl: string;
  title: string | null;
  description: string | null;
  location: string | null;
  primaryServiceSlug: string | null;
  serviceMetadata: Record<string, unknown> | null;
  alt: string | null;
  createdAt: string;
  tags: PortfolioTag[];
};
