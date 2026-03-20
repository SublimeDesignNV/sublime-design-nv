-- AlterTable
ALTER TABLE "Asset"
ADD COLUMN "title" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "location" TEXT,
ADD COLUMN "primaryServiceSlug" TEXT,
ADD COLUMN "serviceMetadata" JSONB;
