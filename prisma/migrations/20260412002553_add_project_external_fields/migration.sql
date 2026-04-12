-- AlterTable
ALTER TABLE "BusinessSettings" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ContractorLicense" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PinterestBoard" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "externalSource" TEXT;

-- AlterTable
ALTER TABLE "ScheduledPost" ALTER COLUMN "mediaAssetIds" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SocialAccount" ALTER COLUMN "updatedAt" DROP DEFAULT;
