import { PrismaClient } from "@prisma/client";
import { SERVICE_TAGS } from "../src/lib/serviceTags";

const prisma = new PrismaClient();

async function main() {
  for (const serviceType of SERVICE_TAGS) {
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
