export type TestimonialDef = {
  slug: string;
  /** Display name — first name + last initial is sufficient */
  name: string;
  location: string;
  quote: string;
  /** One or more service slugs this review relates to */
  serviceSlugs: string[];
  /** Optional — links this testimonial to a specific project case study */
  projectSlug?: string;
  /** 1–5 star rating */
  rating?: number;
  /** e.g. "Google Review", "Houzz", "Direct" */
  sourceLabel?: string;
  /** Show on homepage testimonials section */
  featured: boolean;
  sortOrder: number;
  /** Optional context shown below name, e.g. "Home office remodel" */
  roleOrContext?: string;
};

export const TESTIMONIAL_LIST: TestimonialDef[] = [
  {
    slug: "sarah-tom-m-built-in-library",
    name: "Sarah & Tom M.",
    location: "Henderson, NV",
    quote:
      "Every shelf is exactly where we need it. The desk fits the space perfectly — it feels like it was always there.",
    serviceSlugs: ["built-ins"],
    projectSlug: "henderson-built-in-library",
    rating: 5,
    sourceLabel: "Google Review",
    featured: true,
    sortOrder: 1,
    roleOrContext: "Home office built-in library",
  },
  {
    slug: "michael-r-floating-shelves",
    name: "Michael R.",
    location: "Summerlin, NV",
    quote:
      "The shelves look like they're floating on air. Everyone who visits asks how we did it. Highly recommend Sublime Design for any custom woodwork.",
    serviceSlugs: ["floating-shelves"],
    projectSlug: "summerlin-floating-shelves",
    rating: 5,
    sourceLabel: "Google Review",
    featured: true,
    sortOrder: 2,
    roleOrContext: "Living room floating shelves",
  },
  {
    slug: "jessica-chris-l-closet-system",
    name: "Jessica & Chris L.",
    location: "Henderson, NV",
    quote:
      "We finally have a closet that actually works. The double-hang sections alone doubled our hanging space. They measured everything precisely and the install was fast.",
    serviceSlugs: ["closet-systems"],
    projectSlug: "henderson-closet-system",
    rating: 5,
    sourceLabel: "Houzz",
    featured: true,
    sortOrder: 3,
    roleOrContext: "Primary walk-in closet",
  },
  {
    slug: "david-k-fireplace-mantel",
    name: "David K.",
    location: "Las Vegas, NV",
    quote:
      "The fireplace is the focal point of the room now. The craftsmanship is really impressive — you can tell this was built by people who care about the details.",
    serviceSlugs: ["mantels"],
    projectSlug: "las-vegas-fireplace-mantel",
    rating: 5,
    sourceLabel: "Google Review",
    featured: false,
    sortOrder: 4,
    roleOrContext: "Custom fireplace mantel",
  },
  {
    slug: "patricia-w-pantry-pullouts",
    name: "Patricia W.",
    location: "Las Vegas, NV",
    quote:
      "I can finally see everything in my pantry. No more digging to the back of shelves. The pullouts are solid and the soft-close is a nice touch.",
    serviceSlugs: ["pantry-pullouts"],
    projectSlug: "las-vegas-pantry-pullouts",
    rating: 5,
    sourceLabel: "Google Review",
    featured: false,
    sortOrder: 5,
    roleOrContext: "Kitchen pantry pullout system",
  },
  {
    slug: "mark-n-built-ins-summerlin",
    name: "Mark N.",
    location: "Summerlin, NV",
    quote:
      "From the site measure to install day everything was smooth. The built-ins look custom because they are — tight to the ceiling, perfect paint match. Worth every dollar.",
    serviceSlugs: ["built-ins", "custom-cabinetry"],
    rating: 5,
    sourceLabel: "Direct",
    featured: false,
    sortOrder: 6,
    roleOrContext: "Living room built-ins",
  },
  {
    slug: "amy-b-closet-floating-shelves",
    name: "Amy B.",
    location: "Henderson, NV",
    quote:
      "Had them do floating shelves in two rooms and then a small closet system. Consistent quality across all of it. They show up, do the work right, and leave the space clean.",
    serviceSlugs: ["floating-shelves", "closet-systems"],
    rating: 5,
    sourceLabel: "Houzz",
    featured: false,
    sortOrder: 7,
    roleOrContext: "Floating shelves + closet system",
  },
  {
    slug: "tom-g-mudroom-cabinetry",
    name: "Tom G.",
    location: "Summerlin, NV",
    quote:
      "Our entry way was a disaster before — shoes everywhere, no organization at all. Now we have cubbies, hooks, and bench storage. The kids actually use it. Great work.",
    serviceSlugs: ["custom-cabinetry"],
    projectSlug: "summerlin-mudroom-cabinetry",
    rating: 5,
    sourceLabel: "Google Review",
    featured: false,
    sortOrder: 8,
    roleOrContext: "Mudroom entry cabinetry",
  },
];

export const FEATURED_TESTIMONIALS = TESTIMONIAL_LIST.filter((t) => t.featured).sort(
  (a, b) => a.sortOrder - b.sortOrder,
);

export function findTestimonial(slug: string): TestimonialDef | undefined {
  return TESTIMONIAL_LIST.find((t) => t.slug === slug);
}

export function getTestimonialsByService(serviceSlug: string): TestimonialDef[] {
  return TESTIMONIAL_LIST.filter((t) => t.serviceSlugs.includes(serviceSlug)).sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
}

export function getTestimonialsByProject(projectSlug: string): TestimonialDef[] {
  return TESTIMONIAL_LIST.filter((t) => t.projectSlug === projectSlug).sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
}
