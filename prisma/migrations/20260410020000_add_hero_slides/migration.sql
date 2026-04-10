-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "alt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

-- Seed initial hero video slide
INSERT INTO "HeroSlide" ("id", "url", "publicId", "mediaType", "order", "active", "createdAt", "updatedAt")
VALUES (
    'seed-hero-1',
    'https://res.cloudinary.com/dueaqxh8s/video/upload/f_mp4,q_auto,vc_h264/D57CF9BD-00BC-4DDD-B5FD-E89FE30C4ABF_nhonyp.mp4',
    'D57CF9BD-00BC-4DDD-B5FD-E89FE30C4ABF_nhonyp',
    'video',
    0,
    true,
    NOW(),
    NOW()
)
ON CONFLICT ("id") DO NOTHING;
