import { PrismaClient } from "@prisma/client";
import { CONTEXT_TAGS, SERVICE_TAGS } from "../src/lib/serviceTags";

const prisma = new PrismaClient();

async function main() {
  for (const serviceType of [...SERVICE_TAGS, ...CONTEXT_TAGS]) {
    await prisma.serviceType.upsert({
      where: {
        slug_tagType: {
          slug: serviceType.slug,
          tagType: serviceType.tagType,
        },
      },
      update: { title: serviceType.title },
      create: {
        slug: serviceType.slug,
        title: serviceType.title,
        tagType: serviceType.tagType,
      },
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
