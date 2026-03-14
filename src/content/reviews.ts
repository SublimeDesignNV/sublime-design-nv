export type ReviewDef = {
  slug: string;
  name: string;
  location: string;
  quote: string;
  rating: number;
  sourceLabel: string;
  sourceUrl?: string;
  featured: boolean;
  sortOrder: number;
  serviceSlugs: string[];
  projectSlug?: string;
};

export const REVIEW_LIST: ReviewDef[] = [
  {
    slug: "sarah-m-henderson-library",
    name: "Sarah M.",
    location: "Henderson, NV",
    quote:
      "The built-in library changed the whole room. Everything lines up clean, the desk fits perfectly, and the install was handled without any mess left behind.",
    rating: 5,
    sourceLabel: "Curated Client Review",
    featured: true,
    sortOrder: 1,
    serviceSlugs: ["built-ins", "custom-cabinetry"],
    projectSlug: "henderson-built-in-library",
  },
  {
    slug: "michael-r-summerlin-shelves",
    name: "Michael R.",
    location: "Summerlin, NV",
    quote:
      "The floating shelves feel solid and look clean from every angle. They measured carefully, hit the layout exactly, and the final finish looks custom because it is.",
    rating: 5,
    sourceLabel: "Curated Client Review",
    featured: true,
    sortOrder: 2,
    serviceSlugs: ["floating-shelves"],
    projectSlug: "summerlin-floating-shelves",
  },
  {
    slug: "jessica-l-henderson-closet",
    name: "Jessica L.",
    location: "Henderson, NV",
    quote:
      "Our closet is finally laid out the right way. The drawers, double-hang sections, and shelving all feel deliberate instead of pieced together.",
    rating: 5,
    sourceLabel: "Curated Client Review",
    featured: true,
    sortOrder: 3,
    serviceSlugs: ["closet-systems"],
    projectSlug: "henderson-closet-system",
  },
  {
    slug: "patricia-w-las-vegas-pantry",
    name: "Patricia W.",
    location: "Las Vegas, NV",
    quote:
      "The pantry pullouts make the cabinets actually usable. Everything slides smoothly, nothing rubs, and we can reach the full depth now.",
    rating: 5,
    sourceLabel: "Curated Client Review",
    featured: true,
    sortOrder: 4,
    serviceSlugs: ["pantry-pullouts"],
    projectSlug: "las-vegas-pantry-pullouts",
  },
  {
    slug: "tom-g-summerlin-mudroom",
    name: "Tom G.",
    location: "Summerlin, NV",
    quote:
      "The mudroom cabinetry was planned well from the start. Bench, cubbies, and storage all fit the space tightly and the install moved fast.",
    rating: 5,
    sourceLabel: "Curated Client Review",
    featured: false,
    sortOrder: 5,
    serviceSlugs: ["custom-cabinetry", "built-ins"],
    projectSlug: "summerlin-mudroom-cabinetry",
  },
  {
    slug: "david-k-las-vegas-mantel",
    name: "David K.",
    location: "Las Vegas, NV",
    quote:
      "The mantel gave the fireplace real weight. Trim details are tight, the proportions feel right, and it now looks like it belonged in the room from day one.",
    rating: 5,
    sourceLabel: "Curated Client Review",
    featured: false,
    sortOrder: 6,
    serviceSlugs: ["mantels"],
    projectSlug: "las-vegas-fireplace-mantel",
  },
];

function sortReviews(reviews: ReviewDef[]) {
  return [...reviews].sort((a, b) => a.sortOrder - b.sortOrder);
}

export const FEATURED_REVIEWS = sortReviews(REVIEW_LIST.filter((review) => review.featured));

export function findReview(slug: string) {
  return REVIEW_LIST.find((review) => review.slug === slug);
}

export function getReviewsByService(serviceSlug: string) {
  return sortReviews(
    REVIEW_LIST.filter((review) => review.serviceSlugs.includes(serviceSlug)),
  );
}

export function getReviewsByProject(projectSlug: string) {
  return sortReviews(
    REVIEW_LIST.filter((review) => review.projectSlug === projectSlug),
  );
}

export function getRelatedReviews({
  serviceSlug,
  projectSlug,
  limit = 3,
}: {
  serviceSlug?: string;
  projectSlug?: string;
  limit?: number;
}) {
  const selected: ReviewDef[] = [];
  const seen = new Set<string>();

  if (projectSlug) {
    for (const review of getReviewsByProject(projectSlug)) {
      selected.push(review);
      seen.add(review.slug);
      if (selected.length >= limit) return selected;
    }
  }

  if (serviceSlug) {
    for (const review of getReviewsByService(serviceSlug)) {
      if (seen.has(review.slug)) continue;
      selected.push(review);
      seen.add(review.slug);
      if (selected.length >= limit) break;
    }
  }

  return selected;
}
