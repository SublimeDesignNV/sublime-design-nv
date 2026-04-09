-- Cloudinary settings
ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "cloudinaryFolder" TEXT NOT NULL DEFAULT 'Sublime/Portfolio/';
ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "cloudinaryQuality" TEXT NOT NULL DEFAULT 'auto';
ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "cloudinaryMaxSizeMB" INTEGER NOT NULL DEFAULT 15;

-- Resend / email settings
ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "emailFromName" TEXT NOT NULL DEFAULT 'Sublime Design NV';
ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "emailFromAddress" TEXT NOT NULL DEFAULT 'info@sublimedesignnv.com';
ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "emailReplyTo" TEXT NOT NULL DEFAULT 'info@sublimedesignnv.com';
ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "emailNotifyAddresses" TEXT[] NOT NULL DEFAULT ARRAY['info@sublimedesignnv.com'];

-- Notification toggles
ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "notifyNewLead" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "notifyStaleLead" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "notifyIntakeComplete" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "notifyKioskSubmit" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "notifyDailyDigest" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "notifyWeeklyDigest" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "notifySmsIntakeLink" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "notifySmsKiosk" BOOLEAN NOT NULL DEFAULT true;
