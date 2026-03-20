CREATE TYPE "TagType" AS ENUM ('SERVICE', 'CONTEXT');

ALTER TABLE "ServiceType"
ADD COLUMN "tagType" "TagType" NOT NULL DEFAULT 'SERVICE';

DROP INDEX IF EXISTS "ServiceType_slug_key";

CREATE UNIQUE INDEX "ServiceType_slug_tagType_key"
ON "ServiceType"("slug", "tagType");
