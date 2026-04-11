export const WOOD_SPECIES: string[] = [
  "Walnut",
  "White Oak",
  "Poplar",
  "Birch",
  "Baltic Birch",
  "Hard Maple",
  "Soft Maple",
  "Maple",
  "Cherry",
  "Hickory",
  "Red Oak",
];

export const SHEET_GOODS: string[] = [
  "MDF",
  "HDF",
  "MDF Core",
  "Plywood Core",
  "TFL",
  "HPL",
  "PLAM",
  "CLEAF",
  "SALT",
  "StyleLite",
  "Mirulx",
];

export const GRADE_CUT: string[] = [
  "Paint Grade",
  "Stain Grade",
  "Shop Grade",
  "A1",
  "Rift Cut",
  "Qtr Sawn",
  "Plain Sliced",
  "Rotary",
  "EXT Grade",
  "IMPORT",
  "DOMESTIC",
];

export const FINISH_TYPE: string[] = [
  "Matte",
  "Suede",
  "Textured",
  "EIR",
  "Super Matte (SM)",
  "Gloss",
  "Semi-Gloss",
  "Satin",
  "Flat",
  "Low Sheen",
  "UV1",
  "UV2",
];

export const BRANDS: string[] = [
  "Egger",
  "Stevenswood",
  "Artika",
  "Legano",
  "Egger - Linen - Beige Textile",
];

// ── Three-Path Material System ─────────────────────────────────────────────────

export const MATERIAL_GRADES = ["Paint Grade", "Stain Grade", "TFL / Melamine"] as const;
export type MaterialGrade = (typeof MATERIAL_GRADES)[number];

export const PAINT_SHEENS = [
  { name: "Flat", value: 0 },
  { name: "Matte", value: 5 },
  { name: "Velvet", value: 7 },
  { name: "Eggshell", value: 15 },
  { name: "Low Lustre", value: 20 },
  { name: "Satin", value: 30 },
  { name: "Pearl", value: 40 },
  { name: "Semi-Gloss", value: 55 },
  { name: "Gloss", value: 75 },
  { name: "High Gloss", value: 90 },
] as const;

export const STAIN_SHEENS = [
  { name: "Flat", value: 0 },
  { name: "Matte", value: 5 },
  { name: "Satin", value: 30 },
  { name: "Semi-Gloss", value: 55 },
  { name: "Gloss", value: 75 },
  { name: "High Gloss", value: 90 },
] as const;

export const TFL_SHEENS = [
  { name: "Super Matte (SM)", value: 3 },
  { name: "Matte", value: 5 },
  { name: "Suede", value: 10 },
  { name: "Textured", value: 0 },
  { name: "EIR", value: 0 },
  { name: "Semi-Gloss", value: 55 },
  { name: "Gloss", value: 75 },
] as const;

export const PAINT_GRADE_SUBSTRATES = ["MDF", "HDF", "MDF Core", "Plywood Core"];

export const STAIN_GRADE_SUBSTRATES = ["Plywood Core", "Baltic Birch", "Hardwood Ply"];

export const TFL_SUBSTRATES = [
  "TFL",
  "HPL",
  "PLAM",
  "CLEAF",
  "SALT",
  "StyleLite",
  "Mirulx",
  "MDF Core",
  "Plywood Core",
];

export const STAIN_FINISH_TYPES = [
  "Penetrating Oil",
  "Wiping Stain",
  "Gel Stain",
  "Water-Based Stain",
  "Solid Stain",
  "Semi-Transparent",
  "Clear Coat",
  "Lacquer",
  "Conversion Varnish",
  "Catalyzed Finish",
  "UV Cure",
  "Hardwax Oil",
];

export const GRADE_CUT_OPTIONS = [
  "Rift Cut",
  "Qtr Sawn",
  "Plain Sliced",
  "Rotary",
  "IMPORT",
  "DOMESTIC",
  "A1",
  "Shop Grade",
];

export const PAINT_BRANDS = [
  "Sherwin-Williams",
  "Benjamin Moore",
  "Dunn-Edwards",
  "PPG",
  "Behr",
  "Valspar",
  "Vista Paint",
];

export const STAIN_BRANDS = [
  "General Finishes",
  "Sherwin-Williams ML Campbell",
  "Rubio Monocoat",
  "Mohawk",
  "Varathane",
];

export const TFL_BRANDS = [
  "Egger",
  "Stevenswood",
  "Artika",
  "Legano",
  "Egger - Linen - Beige Textile",
];

export const COLOR_BRANDS = [
  "Benjamin Moore",
  "Sherwin-Williams",
  "Dunn-Edwards",
  "PPG",
  "Behr",
  "Valspar",
  "Vista Paint",
  "General Finishes",
  "Minwax",
  "Varathane",
  "Mohawk",
  "Custom / Other",
];
