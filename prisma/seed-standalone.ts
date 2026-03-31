/**
 * Standalone seed — no @/ path aliases, safe to run with ts-node directly.
 * Upserts all ServiceType records (SERVICE + CONTEXT tag types).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SERVICE_TAGS = [
  { slug: "floating-shelves", title: "Floating Shelves" },
  { slug: "built-ins", title: "Built-Ins" },
  { slug: "pantry-pullouts", title: "Pantry Pull-Outs" },
  { slug: "closet-systems", title: "Closet Systems" },
  { slug: "custom-cabinetry", title: "Custom Cabinetry" },
  { slug: "mantels", title: "Mantels" },
  { slug: "mudrooms", title: "Mudrooms" },
  { slug: "garage-storage", title: "Garage Storage" },
];

const CONTEXT_TAGS = [
  { slug: "living-room", title: "Living Room" },
  { slug: "kitchen", title: "Kitchen" },
  { slug: "bathroom", title: "Bathroom" },
  { slug: "laundry-room", title: "Laundry Room" },
  { slug: "bedroom", title: "Bedroom" },
  { slug: "office", title: "Office" },
  { slug: "tv-wall", title: "TV Wall" },
  { slug: "fireplace-wall", title: "Fireplace Wall" },
  { slug: "pantry", title: "Pantry" },
  { slug: "closet", title: "Closet" },
  { slug: "garage", title: "Garage" },
  { slug: "entryway", title: "Entryway" },
];

async function main() {
  for (const tag of SERVICE_TAGS) {
    await prisma.serviceType.upsert({
      where: { slug_tagType: { slug: tag.slug, tagType: "SERVICE" } },
      update: { title: tag.title },
      create: { slug: tag.slug, title: tag.title, tagType: "SERVICE" },
    });
    console.log(`SERVICE: ${tag.slug}`);
  }
  for (const tag of CONTEXT_TAGS) {
    await prisma.serviceType.upsert({
      where: { slug_tagType: { slug: tag.slug, tagType: "CONTEXT" } },
      update: { title: tag.title },
      create: { slug: tag.slug, title: tag.title, tagType: "CONTEXT" },
    });
    console.log(`CONTEXT: ${tag.slug}`);
  }
  console.log("Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
