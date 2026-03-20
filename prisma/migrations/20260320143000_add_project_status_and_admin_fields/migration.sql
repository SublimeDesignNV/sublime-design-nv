CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'READY', 'PUBLISHED');

ALTER TABLE "Project"
ADD COLUMN "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN "homepageSpotlight" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "heroEligible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "primaryCtaLabel" TEXT,
ADD COLUMN "primaryCtaHref" TEXT,
ADD COLUMN "testimonialPresent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "completionYear" INTEGER,
ADD COLUMN "internalNotes" TEXT,
ADD COLUMN "featuredReason" TEXT;

UPDATE "Project"
SET "status" = CASE
  WHEN "published" = true THEN 'PUBLISHED'::"ProjectStatus"
  ELSE 'DRAFT'::"ProjectStatus"
END;
