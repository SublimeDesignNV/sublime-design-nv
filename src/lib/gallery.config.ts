export type GallerySection = {
  title: string;
  slug: string;
  folder: string;
};

export const GALLERY_SECTIONS: GallerySection[] = [
  {
    title: "Floating Shelves",
    slug: "floating-shelves",
    folder: "sublime/gallery/floating-shelves",
  },
  { title: "Pantry Pullouts", slug: "pantry", folder: "sublime/gallery/pantry" },
  { title: "Built-ins", slug: "built-ins", folder: "sublime/gallery/built-ins" },
  {
    title: "Custom Cabinetry",
    slug: "custom-cabinetry",
    folder: "sublime/gallery/custom-cabinetry",
  },
  { title: "Mantels", slug: "mantels", folder: "sublime/gallery/mantels" },
];
