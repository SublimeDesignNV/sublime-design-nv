import type { AssetKind } from "@prisma/client";

export type PortfolioTag = {
  slug: string;
  title: string;
  tagType: "SERVICE" | "CONTEXT";
};

export type PortfolioAsset = {
  id: string;
  slug: string | null;
  kind: AssetKind;
  published: boolean;
  publicId: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  secureUrl: string | null;
  resourceType: "image" | "video";
  format: string | null;
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
  projectId: string | null;
  projectSlug: string | null;
  tags: PortfolioTag[];
  serviceTags: PortfolioTag[];
  contextTags: PortfolioTag[];
  contextSlugs: string[];
};

export type PortfolioResponse = {
  assets: PortfolioAsset[];
};

export type PublishedAsset = {
  id: string;
  slug: string | null;
  kind: "IMAGE" | "VIDEO";
  published: boolean;
  publicId: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  secureUrl: string | null;
  resourceType: "image" | "video";
  format: string | null;
  width: number | null;
  height: number | null;
  title: string | null;
  description: string | null;
  location: string | null;
  primaryServiceSlug: string | null;
  serviceMetadata: Record<string, unknown> | null;
  alt: string | null;
  createdAt: string;
  projectId: string | null;
  projectSlug: string | null;
  tags: PortfolioTag[];
  serviceTags: PortfolioTag[];
  contextTags: PortfolioTag[];
  contextSlugs: string[];
};
