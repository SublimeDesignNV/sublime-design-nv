export type GallerySection = {
  title: string;
  slug: string;
  folder: string;
};

export const GALLERY_SECTIONS: GallerySection[] = [
  {
    title: "Floating Shelves",
    slug: "floating-shelves",
    folder: "Sublime/Gallery/floating-shelves",
  },
  { title: "Pantry Pullouts", slug: "pantry", folder: "Sublime/Gallery/pantry" },
  { title: "Built-ins", slug: "built-ins", folder: "Sublime/Gallery/built-ins" },
  {
    title: "Custom Cabinetry",
    slug: "custom-cabinetry",
    folder: "Sublime/Gallery/custom-cabinetry",
  },
  { title: "Mantels", slug: "mantels", folder: "Sublime/Gallery/mantels" },
];
