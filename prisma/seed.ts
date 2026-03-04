import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SERVICE_TYPES = [
  { slug: "barn-doors", title: "Barn Doors" },
  { slug: "cabinets", title: "Cabinets" },
  { slug: "closets", title: "Closets" },
  { slug: "faux-beams", title: "Faux Beams" },
  { slug: "floating-shelves", title: "Floating Shelves" },
  { slug: "mantels", title: "Mantels" },
  { slug: "trim-work", title: "Trim Work" },
] as const;

async function main() {
  for (const serviceType of SERVICE_TYPES) {
    await prisma.serviceType.upsert({
      where: { slug: serviceType.slug },
      update: { title: serviceType.title },
      create: { slug: serviceType.slug, title: serviceType.title },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
