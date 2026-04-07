ALTER TABLE "Project"
  ADD COLUMN IF NOT EXISTS "instagramCaption" TEXT,
  ADD COLUMN IF NOT EXISTS "facebookCaption"  TEXT,
  ADD COLUMN IF NOT EXISTS "hashtagSet"        TEXT,
  ADD COLUMN IF NOT EXISTS "socialExportedAt"  TIMESTAMP(3);
