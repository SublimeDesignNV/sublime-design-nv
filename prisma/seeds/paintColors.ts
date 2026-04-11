import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type ColorRecord = { code: string; name: string; hex: string; r: number; g: number; b: number };

// eslint-disable-next-line @typescript-eslint/no-require-imports
const swColors = require("./sw-colors.json") as ColorRecord[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bmColors = require("./bm-colors.json") as ColorRecord[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const deColors = require("./de-colors.json") as ColorRecord[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ppgColors = require("./ppg-colors.json") as ColorRecord[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const behrColors = require("./behr-colors.json") as ColorRecord[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const valsparColors = require("./valspar-colors.json") as ColorRecord[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const vistaColors = require("./vista-colors.json") as ColorRecord[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const varathaneColors = require("./varathane-colors.json") as ColorRecord[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const gfColors = require("./gf-colors.json") as ColorRecord[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const rubioColors = require("./rubio-colors.json") as ColorRecord[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const minwaxColors = require("./minwax-colors.json") as ColorRecord[];

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const BRAND_SEEDS = [
  { brand: "Sherwin-Williams", colors: swColors },
  { brand: "Benjamin Moore", colors: bmColors },
  { brand: "Dunn-Edwards", colors: deColors },
  { brand: "PPG", colors: ppgColors },
  { brand: "Behr", colors: behrColors },
  { brand: "Valspar", colors: valsparColors },
  { brand: "Vista Paint", colors: vistaColors },
  { brand: "Varathane", colors: varathaneColors },
  { brand: "General Finishes", colors: gfColors },
  { brand: "Rubio Monocoat", colors: rubioColors },
  { brand: "Minwax", colors: minwaxColors },
];

async function seedPaintColors() {
  for (const { brand, colors } of BRAND_SEEDS) {
    console.log(`Seeding ${brand}...`);
    let upserted = 0;
    let skipped = 0;
    for (const color of colors) {
      try {
        await db.paintColor.upsert({
          where: { code: color.code },
          update: { name: color.name, hex: color.hex, r: color.r, g: color.g, b: color.b, brand },
          create: {
            brand,
            code: color.code,
            name: color.name,
            hex: color.hex,
            r: color.r,
            g: color.g,
            b: color.b,
          },
        });
        upserted++;
      } catch {
        skipped++;
      }
    }
    console.log(`  ${brand}: ${upserted} upserted, ${skipped} skipped`);
  }
  await db.$disconnect();
  console.log("Done.");
}

seedPaintColors();
