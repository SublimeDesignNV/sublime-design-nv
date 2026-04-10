import { db } from "@/lib/db";
import HeroProject from "@/components/home/HeroProject";

export default async function HeroWrapper() {
  const heroMedia = await db.siteMedia
    .findUnique({ where: { key: "hero_video" } })
    .catch(() => null);

  const videoUrl = heroMedia?.url ?? null;
  const posterUrl = heroMedia?.publicId
    ? `https://res.cloudinary.com/dueaqxh8s/video/upload/f_jpg,q_auto,so_0/${heroMedia.publicId}.jpg`
    : null;

  return <HeroProject videoUrl={videoUrl} posterUrl={posterUrl} />;
}
