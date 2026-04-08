-- Create PinterestBoard table
CREATE TABLE IF NOT EXISTS "PinterestBoard" (
  "id"          TEXT NOT NULL,
  "boardId"     TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "url"         TEXT,
  "imageUrl"    TEXT,
  "pinCount"    INTEGER NOT NULL DEFAULT 0,
  "serviceType" TEXT,
  "area"        TEXT,
  "isDefault"   BOOLEAN NOT NULL DEFAULT false,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PinterestBoard_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PinterestBoard_boardId_key" ON "PinterestBoard"("boardId");

-- Add new ScheduledPost fields
ALTER TABLE "ScheduledPost"
  ADD COLUMN IF NOT EXISTS "pinterestBoardId" TEXT,
  ADD COLUMN IF NOT EXISTS "altText"          TEXT;
