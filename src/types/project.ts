export type FinishCategory =
  | "wood"
  | "paint"
  | "stain"
  | "hardware"
  | "led_tape"
  | "led_controller"
  | "led_power"
  | "lighting"
  | "product"
  | "other";

export const FINISH_CATEGORY_LABELS: Record<FinishCategory, string> = {
  wood: "Wood",
  paint: "Paint",
  stain: "Stain",
  hardware: "Hardware",
  led_tape: "LED Tape",
  led_controller: "LED Controller",
  led_power: "LED Power Supply",
  lighting: "Lighting (Other)",
  product: "Product",
  other: "Other",
};

export const FINISH_CATEGORY_ICONS: Record<FinishCategory, string> = {
  wood: "🪵",
  paint: "🎨",
  stain: "🖌️",
  hardware: "⚙️",
  led_tape: "💡",
  led_controller: "🎛️",
  led_power: "🔌",
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
