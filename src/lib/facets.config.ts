export const CITIES = [
  { label: "Las Vegas", slug: "las-vegas" },
  { label: "Henderson", slug: "henderson" },
  { label: "Summerlin", slug: "summerlin" },
  { label: "Southern Highlands", slug: "southern-highlands" },
  { label: "Green Valley", slug: "green-valley" },
  { label: "Centennial Hills", slug: "centennial-hills" },
] as const;

export const MATERIALS = [
  { label: "White Oak", slug: "white-oak" },
  { label: "Walnut", slug: "walnut" },
  { label: "Maple", slug: "maple" },
  { label: "Paint Grade", slug: "paint-grade" },
  { label: "MDF", slug: "mdf" },
] as const;

export const ROOMS = [
  { label: "Kitchen", slug: "kitchen" },
  { label: "Living Room", slug: "living-room" },
  { label: "Pantry", slug: "pantry" },
  { label: "Office", slug: "office" },
  { label: "Laundry", slug: "laundry" },
  { label: "Closet", slug: "closet" },
] as const;

export type FacetCitySlug = (typeof CITIES)[number]["slug"];
export type FacetMaterialSlug = (typeof MATERIALS)[number]["slug"];
export type FacetRoomSlug = (typeof ROOMS)[number]["slug"];
