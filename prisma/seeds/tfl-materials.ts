import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const tflCat = await prisma.materialCategory.findUnique({ where: { slug: "tfl-melamine" } });
  const hplCat = await prisma.materialCategory.findUnique({ where: { slug: "hpl" } });
  if (!tflCat || !hplCat) throw new Error("Categories not found — run materials seed first");

  const egger = await prisma.manufacturer.findUnique({ where: { slug: "egger" } });
  const stevenswood = await prisma.manufacturer.findUnique({ where: { slug: "stevenswood" } });
  const cleaf = await prisma.manufacturer.findUnique({ where: { slug: "cleaf" } });
  const salt = await prisma.manufacturer.findUnique({ where: { slug: "salt" } });
  const prism = await prisma.manufacturer.findUnique({ where: { slug: "prism" } });
  const truNorth = await prisma.manufacturer.findUnique({ where: { slug: "tru-north" } });
  if (!egger || !stevenswood || !cleaf || !salt || !prism || !truNorth) {
    throw new Error("Manufacturers not found — run materials seed first");
  }

  const intermountain = await prisma.supplier.findUnique({ where: { slug: "intermountain-wood-products" } });
  const peterman = await prisma.supplier.findUnique({ where: { slug: "peterman-lumber" } });
  const ebBradley = await prisma.supplier.findUnique({ where: { slug: "eb-bradley" } });
  if (!intermountain || !peterman || !ebBradley) {
    throw new Error("Suppliers not found — run materials seed first");
  }

  const tflMaterials = [
    // ── Egger ──────────────────────────────────────────────────────────────────
    {
      name: "Graphite Grey",
      slug: "egger-graphite-grey-u961",
      sku: "U961 ST9",
      categoryId: tflCat.id,
      manufacturerId: egger.id,
      sheen: "Matte",
      thickness: '3/4"',
      supplierId: intermountain.id,
    },
    {
      name: "Light Grey",
      slug: "egger-light-grey-u708",
      sku: "U708 ST9",
      categoryId: tflCat.id,
      manufacturerId: egger.id,
      sheen: "Matte",
      thickness: '3/4"',
      supplierId: intermountain.id,
    },
    {
      name: "Linen Beige Textile",
      slug: "egger-linen-beige-textile-u748",
      sku: "U748 ST9",
      categoryId: tflCat.id,
      manufacturerId: egger.id,
      sheen: "Suede",
      thickness: '3/4"',
      supplierId: intermountain.id,
    },
    {
      name: "Concrete Light Grey",
      slug: "egger-concrete-light-grey-f186",
      sku: "F186 ST9",
      categoryId: tflCat.id,
      manufacturerId: egger.id,
      sheen: "Matte",
      thickness: '3/4"',
      supplierId: intermountain.id,
    },
    {
      name: "Warm White",
      slug: "egger-warm-white-w908",
      sku: "W908 ST9",
      categoryId: tflCat.id,
      manufacturerId: egger.id,
      sheen: "Matte",
      thickness: '3/4"',
      supplierId: intermountain.id,
    },
    // ── Stevenswood ────────────────────────────────────────────────────────────
    {
      name: "Bright White",
      slug: "stevenswood-bright-white",
      sku: "BW-1000",
      categoryId: tflCat.id,
      manufacturerId: stevenswood.id,
      sheen: "Matte",
      thickness: '3/4"',
      supplierId: peterman.id,
    },
    {
      name: "Almond",
      slug: "stevenswood-almond",
      sku: "AL-2000",
      categoryId: tflCat.id,
      manufacturerId: stevenswood.id,
      sheen: "Matte",
      thickness: '3/4"',
      supplierId: peterman.id,
    },
    // ── Cleaf ──────────────────────────────────────────────────────────────────
    {
      name: "Bianco Liscio",
      slug: "cleaf-bianco-liscio-s001",
      sku: "S001",
      categoryId: tflCat.id,
      manufacturerId: cleaf.id,
      sheen: "Super Matte (SM)",
      thickness: '3/4"',
      supplierId: ebBradley.id,
    },
    {
      name: "Grigio Seta",
      slug: "cleaf-grigio-seta-s072",
      sku: "S072",
      categoryId: tflCat.id,
      manufacturerId: cleaf.id,
      sheen: "Super Matte (SM)",
      thickness: '3/4"',
      supplierId: ebBradley.id,
    },
    // ── Salt ───────────────────────────────────────────────────────────────────
    {
      name: "White Salt",
      slug: "salt-white-w01",
      sku: "SALT-W01",
      categoryId: tflCat.id,
      manufacturerId: salt.id,
      sheen: "Textured",
      thickness: '3/4"',
      supplierId: peterman.id,
    },
    // ── Tru North (Intermountain house brand) ──────────────────────────────────
    {
      name: "Tru White",
      slug: "tru-north-tru-white",
      sku: "TN-W100",
      categoryId: tflCat.id,
      manufacturerId: truNorth.id,
      sheen: "Matte",
      thickness: '3/4"',
      supplierId: intermountain.id,
    },
    {
      name: "Tru Linen",
      slug: "tru-north-tru-linen",
      sku: "TN-L200",
      categoryId: tflCat.id,
      manufacturerId: truNorth.id,
      sheen: "Matte",
      thickness: '3/4"',
      supplierId: intermountain.id,
    },
  ];

  let created = 0;
  for (const mat of tflMaterials) {
    const { supplierId, ...matData } = mat;
    const material = await prisma.material.upsert({
      where: { slug: mat.slug },
      update: {},
      create: { ...matData, isPublic: true, grade: "TFL/Melamine" },
    });
    // Add supplier pricing record
    await prisma.supplierPricing.upsert({
      where: { materialId_supplierId: { materialId: material.id, supplierId } },
      update: {},
      create: {
        materialId: material.id,
        supplierId,
        unit: "4x8 sheet",
        isPreferred: true,
        notes: "Call for current pricing.",
      },
    });
    created++;
    console.log(`  ✓ ${mat.name} (${mat.sku})`);
  }

  console.log(`\nSeeded ${created} TFL/Melamine materials.`);
  await prisma.$disconnect();
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
