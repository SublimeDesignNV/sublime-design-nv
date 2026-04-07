-- Add Pinterest/YouTube fields to ScheduledPost
ALTER TABLE "ScheduledPost"
  ALTER COLUMN "projectId" DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS "pinTitle"     TEXT,
  ADD COLUMN IF NOT EXISTS "pinUrl"       TEXT,
  ADD COLUMN IF NOT EXISTS "boardId"      TEXT,
  ADD COLUMN IF NOT EXISTS "title"        TEXT,
  ADD COLUMN IF NOT EXISTS "description"  TEXT,
  ADD COLUMN IF NOT EXISTS "visibility"   TEXT;

-- Create SocialAccount table
CREATE TABLE IF NOT EXISTS "SocialAccount" (
  "id"           TEXT NOT NULL,
  "platform"     TEXT NOT NULL,
  "accountId"    TEXT,
  "accountName"  TEXT,
  "accessToken"  TEXT,
  "refreshToken" TEXT,
  "tokenExpiry"  TIMESTAMP(3),
  "connected"    BOOLEAN NOT NULL DEFAULT false,
  "connectedAt"  TIMESTAMP(3),
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SocialAccount_platform_key" ON "SocialAccount"("platform");
