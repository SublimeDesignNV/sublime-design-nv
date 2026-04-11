-- AlterTable
ALTER TABLE "Asset" ADD COLUMN "materials" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
