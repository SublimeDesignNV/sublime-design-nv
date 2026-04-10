-- CreateTable
CREATE TABLE "SiteMedia" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "alt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteMedia_key_key" ON "SiteMedia"("key");

-- Seed initial hero video
INSERT INTO "SiteMedia" ("id", "key", "url", "publicId", "mediaType", "alt", "createdAt", "updatedAt")
VALUES (
    'site-media-hero-video',
    'hero_video',
    'https://res.cloudinary.com/dueaqxh8s/video/upload/f_mp4,q_auto,vc_h264/D57CF9BD-00BC-4DDD-B5FD-E89FE30C4ABF_nhonyp.mp4',
    'D57CF9BD-00BC-4DDD-B5FD-E89FE30C4ABF_nhonyp',
    'video',
    'Sublime Design NV hero video',
    NOW(),
    NOW()
)
ON CONFLICT ("key") DO NOTHING;
