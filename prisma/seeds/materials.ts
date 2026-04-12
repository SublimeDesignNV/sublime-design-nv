import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // ── Categories ────────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.materialCategory.upsert({
      where: { slug: "tfl-melamine" },
      update: {},
      create: {
        name: "TFL / Melamine",
        slug: "tfl-melamine",
        description: "Thermally Fused Laminate (TFL) and melamine-coated sheet goods. The most common substrate for painted and solid-color cabinet faces in Las Vegas custom woodwork.",
      },
    }),
    prisma.materialCategory.upsert({
      where: { slug: "hpl" },
      update: {},
      create: {
        name: "HPL",
        slug: "hpl",
        description: "High Pressure Laminate — extremely durable decorative surface bonded under high heat and pressure. Used for countertops, work surfaces, and high-wear cabinet doors.",
      },
    }),
    prisma.materialCategory.upsert({
      where: { slug: "solid-wood" },
      update: {},
      create: {
        name: "Solid Wood",
        slug: "solid-wood",
        description: "Kiln-dried hardwood lumber used for face frames, doors, drawer boxes, and decorative elements. Common species include maple, oak, walnut, and alder.",
      },
    }),
    prisma.materialCategory.upsert({
      where: { slug: "plywood-sheet-goods" },
      update: {},
      create: {
        name: "Plywood / Sheet Goods",
        slug: "plywood-sheet-goods",
        description: "Structural plywood and sheet goods used for cabinet boxes, shelving, and interior panels.",
      },
    }),
    prisma.materialCategory.upsert({
      where: { slug: "hardwood" },
      update: {},
      create: {
        name: "Hardwood",
        slug: "hardwood",
        description: "Domestic and imported hardwood lumber for decorative trim, moldings, and custom millwork.",
      },
    }),
  ]);

  const [tflCat] = categories;
  console.log("Categories seeded:", categories.map((c) => c.name));

  // ── Manufacturers ─────────────────────────────────────────────────────────
  const manufacturers = await Promise.all([
    prisma.manufacturer.upsert({
      where: { slug: "egger" },
      update: {},
      create: {
        name: "Egger",
        slug: "egger",
        website: "https://www.egger.com",
        description: "Austrian manufacturer of TFL/melamine sheet goods, known for consistent color and texture across their Decorative Collection.",
      },
    }),
    prisma.manufacturer.upsert({
      where: { slug: "stevenswood" },
      update: {},
      create: {
        name: "Stevenswood",
        slug: "stevenswood",
        website: "https://www.stevenswood.com",
        description: "North American manufacturer of decorative panels and wood composite products.",
      },
    }),
    prisma.manufacturer.upsert({
      where: { slug: "cleaf" },
      update: {},
      create: {
        name: "Cleaf",
        slug: "cleaf",
        website: "https://www.cleaf.com",
        description: "Italian manufacturer of high-end decorative surfaces with distinctive tactile textures.",
      },
    }),
    prisma.manufacturer.upsert({
      where: { slug: "salt" },
      update: {},
      create: {
        name: "Salt",
        slug: "salt",
        description: "Premium decorative panel brand available through select distributors.",
      },
    }),
    prisma.manufacturer.upsert({
      where: { slug: "prism" },
      update: {},
      create: {
        name: "Prism",
        slug: "prism",
        description: "Decorative sheet goods manufacturer offering a broad palette of colors and textures.",
      },
    }),
    prisma.manufacturer.upsert({
      where: { slug: "tru-north" },
      update: {},
      create: {
        name: "Tru North",
        slug: "tru-north",
        description: "House brand of Intermountain Wood Products — quality TFL and melamine sheet goods available locally in Las Vegas.",
      },
    }),
  ]);

  const [egger, stevenswood, cleaf, salt, prism, truNorth] = manufacturers;
  console.log("Manufacturers seeded:", manufacturers.map((m) => m.name));

  // ── Suppliers ─────────────────────────────────────────────────────────────
  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { slug: "intermountain-wood-products" },
      update: {},
      create: {
        name: "Intermountain Wood Products",
        slug: "intermountain-wood-products",
        website: "https://www.intermountainwood.com",
        city: "Las Vegas",
        state: "NV",
        description: "Full-service lumber and sheet goods supplier serving Las Vegas contractors and cabinet shops. Carries Egger, Tru North, and other major brands.",
      },
    }),
    prisma.supplier.upsert({
      where: { slug: "peterman-lumber" },
      update: {},
      create: {
        name: "Peterman Lumber",
        slug: "peterman-lumber",
        city: "Las Vegas",
        state: "NV",
        description: "Las Vegas lumber yard supplying dimensional lumber, sheet goods, and specialty wood products to contractors across the valley.",
      },
    }),
    prisma.supplier.upsert({
      where: { slug: "eb-bradley" },
      update: {},
      create: {
        name: "EB Bradley",
        slug: "eb-bradley",
        website: "https://www.ebbradley.com",
        city: "Las Vegas",
        state: "NV",
        description: "Wholesale distributor of decorative surfaces, hardware, and finishing supplies for the cabinet and furniture industry.",
      },
    }),
    prisma.supplier.upsert({
      where: { slug: "royal-plywood" },
      update: {},
      create: {
        name: "Royal Plywood",
        slug: "royal-plywood",
        website: "https://www.royalplywood.com",
        city: "Las Vegas",
        state: "NV",
        description: "Specialty plywood and panel distributor offering a wide selection of domestic and imported sheet goods.",
      },
    }),
  ]);

  const [intermountain, peterman, ebBradley, royalPlywood] = suppliers;
  console.log("Suppliers seeded:", suppliers.map((s) => s.name));

  // ── Sample Materials ──────────────────────────────────────────────────────
  const sampleMaterial = await prisma.material.upsert({
    where: { slug: "egger-white-premium-w1000" },
    update: {},
    create: {
      name: "White Premium",
      slug: "egger-white-premium-w1000",
      sku: "W1000 ST9",
      description: "Clean, bright white TFL melamine. The most-specified color in Las Vegas custom cabinetry. Consistent tone edge-to-edge with a smooth matte surface.",
      isPublic: true,
      categoryId: tflCat!.id,
      manufacturerId: egger!.id,
      grade: "TFL/Melamine",
      sheen: "Matte",
      thickness: '3/4"',
    },
  });

  // Supplier pricing for sample material
  await prisma.supplierPricing.upsert({
    where: { materialId_supplierId: { materialId: sampleMaterial.id, supplierId: intermountain!.id } },
    update: {},
    create: {
      materialId: sampleMaterial.id,
      supplierId: intermountain!.id,
      unit: "4x8 sheet",
      isPreferred: true,
      notes: "Call for current pricing. Volume discounts available.",
    },
  });

  console.log("Sample material seeded:", sampleMaterial.name);

  // Seed supplier-manufacturer associations (via empty pricing records for discoverability)
  const associations: Array<{ mfgId: string; supId: string }> = [
    { mfgId: egger!.id, supId: intermountain!.id },
    { mfgId: stevenswood!.id, supId: peterman!.id },
    { mfgId: stevenswood!.id, supId: intermountain!.id },
    { mfgId: cleaf!.id, supId: ebBradley!.id },
    { mfgId: salt!.id, supId: peterman!.id },
    { mfgId: prism!.id, supId: royalPlywood!.id },
    { mfgId: truNorth!.id, supId: intermountain!.id },
  ];

  console.log("All materials seed data applied.");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
