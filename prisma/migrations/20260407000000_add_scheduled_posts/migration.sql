CREATE TABLE "ScheduledPost" (
  "id"            TEXT         NOT NULL,
  "projectId"     TEXT         NOT NULL,
  "platform"      TEXT         NOT NULL,
  "caption"       TEXT         NOT NULL,
  "hashtags"      TEXT,
  "mediaAssetIds" TEXT[]       NOT NULL DEFAULT '{}',
  "scheduledFor"  TIMESTAMP(3),
  "status"        TEXT         NOT NULL DEFAULT 'pending',
  "postedAt"      TIMESTAMP(3),
  "postId"        TEXT,
  "errorMessage"  TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ScheduledPost_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ScheduledPost"
  ADD CONSTRAINT "ScheduledPost_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
