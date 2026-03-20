ALTER TABLE "Asset"
ADD COLUMN "uploadBatchId" TEXT;

CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "serviceSlug" TEXT,
    "areaSlug" TEXT,
    "location" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "spotlightRank" INTEGER,
    "coverAssetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectAsset" (
    "projectId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectAsset_pkey" PRIMARY KEY ("projectId","assetId")
);

CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
CREATE UNIQUE INDEX "Project_projectId_position_key" ON "ProjectAsset"("projectId", "position");
CREATE INDEX "ProjectAsset_assetId_idx" ON "ProjectAsset"("assetId");

ALTER TABLE "Project"
ADD CONSTRAINT "Project_coverAssetId_fkey"
FOREIGN KEY ("coverAssetId") REFERENCES "Asset"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProjectAsset"
ADD CONSTRAINT "ProjectAsset_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectAsset"
ADD CONSTRAINT "ProjectAsset_assetId_fkey"
FOREIGN KEY ("assetId") REFERENCES "Asset"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
