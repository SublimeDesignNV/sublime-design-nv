import { ACTIVE_SERVICES } from "@/content/services";
import { getProjectsByService } from "@/content/projects";
import { listAssetsByServiceTag } from "@/lib/cloudinary.server";
import { getPublishedAssetsByServiceSlug } from "@/lib/portfolio.server";

export type ServiceProofInventoryRow = {
  slug: string;
  title: string;
  publishedAdminAssetCount: number;
  directCloudinaryAssetCount: number;
  fallbackProjectCount: number;
  hasDirectProof: boolean;
  hasFallbackProof: boolean;
  hasHeroCandidate: boolean;
};

export async function getServiceProofInventory(): Promise<ServiceProofInventoryRow[]> {
  const rows = await Promise.all(
    ACTIVE_SERVICES.map(async (service) => {
      const [publishedAssets, directCloudinaryAssets] = await Promise.all([
        getPublishedAssetsByServiceSlug(service.slug),
        listAssetsByServiceTag(service.slug, 20).catch(() => []),
      ]);
      const fallbackProjects = getProjectsByService(service.slug);

      return {
        slug: service.slug,
        title: service.shortTitle,
        publishedAdminAssetCount: publishedAssets.length,
        directCloudinaryAssetCount: directCloudinaryAssets.length,
        fallbackProjectCount: fallbackProjects.length,
        hasDirectProof: publishedAssets.length > 0 || directCloudinaryAssets.length > 0,
        hasFallbackProof: fallbackProjects.length > 0,
        hasHeroCandidate: publishedAssets.length > 0 || directCloudinaryAssets.length > 0,
      } satisfies ServiceProofInventoryRow;
    }),
  );

  return rows;
}
