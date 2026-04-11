import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const colors = require("./sw-colors.json") as {
  code: string;
  name: string;
  hex: string;
  r: number;
  g: number;
  b: number;
}[];

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function seedPaintColors() {
  console.log("Seeding SW paint colors...");

  let inserted = 0;
  let skipped = 0;

  for (const color of colors) {
    try {
      await db.paintColor.upsert({
        where: { code: color.code },
        update: { name: color.name, hex: color.hex, r: color.r, g: color.g, b: color.b },
        create: {
          brand: "Sherwin-Williams",
          code: color.code,
          name: color.name,
          hex: color.hex,
          r: color.r,
          g: color.g,
          b: color.b,
        },
      });
      inserted++;
    } catch {
      skipped++;
    }
  }

  console.log(`Done. Upserted: ${inserted}, Skipped: ${skipped}`);
  await db.$disconnect();
}

seedPaintColors();
