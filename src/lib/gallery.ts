import { SERVICES } from "@/lib/constants";

export type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  serviceSlug: string;
  serviceLabel: string;
};

const serviceLabelBySlug = Object.fromEntries(
  SERVICES.map((service) => [service.slug, service.shortTitle]),
) as Record<string, string>;

const seededServiceSlugs = [
  "barn-doors",
  "cabinets",
  "closets",
  "faux-beams",
  "floating-shelves",
  "mantels",
  "trim-work",
  "barn-doors",
  "cabinets",
  "closets",
  "faux-beams",
  "floating-shelves",
] as const;

export const GALLERY_ITEMS: GalleryItem[] = seededServiceSlugs.map(
  (serviceSlug, index) => {
    const serviceLabel = serviceLabelBySlug[serviceSlug];
    const imageNumber = index + 1;

    return {
      id: `gallery-${imageNumber}`,
      src: `/images/gallery/${imageNumber}.jpg`,
      alt: `${serviceLabel} project`,
      serviceSlug,
      serviceLabel,
    };
  },
);
