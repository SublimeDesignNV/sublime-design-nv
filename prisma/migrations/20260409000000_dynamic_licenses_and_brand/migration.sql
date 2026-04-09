-- Create ContractorLicense table
CREATE TABLE "ContractorLicense" (
  "id" TEXT NOT NULL,
  "licenseType" TEXT NOT NULL,
  "licenseNumber" TEXT NOT NULL,
  "issuingState" TEXT DEFAULT 'NV',
  "expiresAt" TIMESTAMP(3),
  "showOnSite" BOOLEAN NOT NULL DEFAULT true,
  "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContractorLicense_pkey" PRIMARY KEY ("id")
);

-- Seed existing licenses
INSERT INTO "ContractorLicense" ("id", "licenseType", "licenseNumber", "issuingState", "position", "updatedAt")
VALUES
  ('lic-c3', 'C3 Carpentry', '#82320', 'NV', 0, CURRENT_TIMESTAMP),
  ('lic-b2', 'B2 General Contractor', '#92234', 'NV', 1, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Add new fields to BusinessSettings
ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "primaryTrade" TEXT DEFAULT 'Finish Carpentry';
ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "secondaryTrade" TEXT;
ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "brandPrimary" TEXT NOT NULL DEFAULT '#CC2027';
ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "brandSecondary" TEXT NOT NULL DEFAULT '#1B2A6B';
ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "heroHeadline" TEXT;
ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "heroSubheadline" TEXT;
ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "heroCtaLabel" TEXT DEFAULT 'Start with a Quote';

-- Remove old license columns
ALTER TABLE "BusinessSettings" DROP COLUMN IF EXISTS "licenseC3";
ALTER TABLE "BusinessSettings" DROP COLUMN IF EXISTS "licenseB2";
