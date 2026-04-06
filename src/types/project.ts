export type FinishCategory =
  | "wood"
  | "paint"
  | "stain"
  | "hardware"
  | "lighting"
  | "product"
  | "other";

export const FINISH_CATEGORY_LABELS: Record<FinishCategory, string> = {
  wood: "Wood",
  paint: "Paint",
  stain: "Stain",
  hardware: "Hardware",
  lighting: "Lighting",
  product: "Product",
  other: "Other",
};

export const FINISH_CATEGORY_ICONS: Record<FinishCategory, string> = {
  wood: "🪵",
  paint: "🎨",
  stain: "🖌️",
  hardware: "⚙️",
  lighting: "💡",
  product: "📦",
  other: "📋",
};

export interface ProjectFinish {
  id: string;
  category: FinishCategory;
  name: string;
  code?: string;
  supplier?: string;
  url?: string;
  notes?: string;
  color?: string;
}
