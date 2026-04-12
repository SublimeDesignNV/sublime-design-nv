import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as fs from "fs";
import * as path from "path";

// ── Build the name→number + hex→number maps from the official SW XLSX data ──
// Source: /tmp/sw_colors.json (parsed from SW-ColorSnap XLSX, 1526 colors)
// Format conversion: "SW7006" → "SW 7006" (insert space after SW prefix)

type SwEntry = { sw_number: string; name: string; hex: string; r: number; g: number; b: number };

const SW_JSON_PATH = "/tmp/sw_colors.json";
if (!fs.existsSync(SW_JSON_PATH)) {
  console.error("ERROR: /tmp/sw_colors.json not found. Re-run the data fetch step.");
  process.exit(1);
}

const swData: SwEntry[] = JSON.parse(fs.readFileSync(SW_JSON_PATH, "utf-8"));

function fmtNumber(raw: string): string {
  // "SW7006" → "SW 7006", "SW0001" → "SW 0001"
  return "SW " + raw.slice(2);
}

const nameToNumber = new Map<string, string>();
const hexToNumber = new Map<string, string>();
for (const row of swData) {
  nameToNumber.set(row.name.toLowerCase().trim(), fmtNumber(row.sw_number));
  hexToNumber.set(row.hex.toUpperCase(), fmtNumber(row.sw_number));
}

// ── Load our sw-colors.json to verify coverage before touching the DB ──────
const seedPath = path.join(__dirname, "sw-colors.json");
const ourSw: { code: string; name: string; hex: string }[] = JSON.parse(
  fs.readFileSync(seedPath, "utf-8")
);
const slugColors = ourSw.filter((c) => c.code.includes("/"));

let preCheckFailed = false;
const preUnmatched: string[] = [];
for (const color of slugColors) {
  const byName = nameToNumber.get(color.name.toLowerCase().trim());
  const byHex = hexToNumber.get(color.hex.toUpperCase());
  if (!byName && !byHex) {
    preCheckFailed = true;
    preUnmatched.push(color.name);
  }
}
if (preCheckFailed) {
  console.error(`PRE-CHECK FAILED: ${preUnmatched.length} SW colors have no match in dataset:`);
  console.error(preUnmatched);
  process.exit(1);
}
console.log(`Pre-check passed: all ${slugColors.length} slug-format SW colors have a mapping.`);

// ── Connect and run updates ──────────────────────────────────────────────────
async function main() {
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  let totalUpdated = 0;
  const failed: string[] = [];

  // 1. SW slug-format colors (SW/black-magic) → look up real number
  const swSlugs = await prisma.paintColor.findMany({
    where: { brand: "Sherwin-Williams", number: null, code: { contains: "/" } },
    select: { id: true, name: true, code: true, hex: true },
  });
  console.log(`Found ${swSlugs.length} SW slug-format colors to update.`);

  for (const color of swSlugs) {
    const number =
      nameToNumber.get(color.name.toLowerCase().trim()) ??
      hexToNumber.get(color.hex.toUpperCase());
    if (number) {
      await prisma.paintColor.update({ where: { id: color.id }, data: { number } });
      totalUpdated++;
    } else {
      failed.push(color.name);
    }
  }

  // 2. SW number-format colors (SW 7006) — code IS the number
  const swNums = await prisma.paintColor.findMany({
    where: { brand: "Sherwin-Williams", number: null, code: { not: { contains: "/" } } },
    select: { id: true, code: true },
  });
  for (const color of swNums) {
    await prisma.paintColor.update({ where: { id: color.id }, data: { number: color.code } });
    totalUpdated++;
  }
  console.log(`SW number-format: ${swNums.length} updated.`);

  // 3. Brands where code = product number (no conversion needed)
  const numberBrands = [
    "Benjamin Moore",
    "PPG",
    "Behr",
    "Dunn-Edwards",
    "Valspar",
  ];
  for (const brand of numberBrands) {
    const colors = await prisma.paintColor.findMany({
      where: { brand, number: null },
      select: { id: true, code: true },
    });
    for (const color of colors) {
      await prisma.paintColor.update({ where: { id: color.id }, data: { number: color.code } });
      totalUpdated++;
    }
    if (colors.length > 0) console.log(`${brand}: ${colors.length} updated.`);
  }

  await prisma.$disconnect();
  await pool.end();

  console.log(`\nTotal updated: ${totalUpdated}`);
  console.log(`SW slug updated: ${swSlugs.length - failed.length}/${swSlugs.length}`);
  if (failed.length > 0) {
    console.error(`FAILED (${failed.length} colors with no match):`, failed);
    process.exit(1);
  }
  console.log("All records updated successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
