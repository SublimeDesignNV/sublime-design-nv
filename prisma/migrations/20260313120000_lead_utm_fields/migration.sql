-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "utmSource"   TEXT,
                   ADD COLUMN "utmMedium"   TEXT,
                   ADD COLUMN "utmCampaign" TEXT,
                   ADD COLUMN "referrer"    TEXT;
