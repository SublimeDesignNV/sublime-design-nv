export type ServiceStatus = "active" | "coming-soon";

export type ServiceDef = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  shortDescription: string;
  heroHeadline: string;
  heroBody: string;
  ctaLabel: string;
  sortOrder: number;
  /** URL slugs that redirect or resolve to this service */
  aliases: string[];
  status: ServiceStatus;
  valueBullets: string[];
};

export const SERVICE_LIST: ServiceDef[] = [
  {
    slug: "floating-shelves",
    title: "Custom Floating Shelves",
    shortTitle: "Floating Shelves",
    description:
      "Beautiful floating shelves designed, fabricated, and installed throughout the Las Vegas Valley. Hidden support systems, clean reveals, and finish-ready details built to last.",
    shortDescription: "Hidden brackets, solid wood, clean installs.",
    heroHeadline: "Floating Shelves That Look Like They Grew There",
    heroBody:
      "We design and install custom floating shelves with concealed hardware, clean reveals, and solid construction — measured to fit your exact wall.",
    ctaLabel: "Get a Floating Shelf Quote",
    sortOrder: 1,
    aliases: [],
    status: "active",
    valueBullets: [
      "Custom sizing for any wall or alcove",
      "Clean hidden bracket system — no visible hardware",
      "Professional install with level, plumb, and protected surfaces",
    ],
  },
  {
    slug: "built-ins",
    title: "Built-In Shelving & Storage",
    shortTitle: "Built-ins",
    description:
      "Wall-to-wall built-ins for living rooms, offices, and media walls. Every unit is measured and built to fit your exact space with finish-ready details.",
    shortDescription: "Entertainment walls, bookcases, office built-ins.",
    heroHeadline: "Built-ins That Fill the Wall the Right Way",
    heroBody:
      "Shop-built components, measured for your space, installed with tight reveals and clean transitions to ceiling, floor, and trim.",
    ctaLabel: "Get a Built-in Quote",
    sortOrder: 2,
    aliases: [],
    status: "active",
    valueBullets: [
      "Floor-to-ceiling designs that maximize every inch",
      "Adjustable shelf layouts built around your storage needs",
      "Finish-ready with paint or stain — no filler gaps",
    ],
  },
  {
    slug: "pantry-pullouts",
    title: "Pantry Pullout Systems",
    shortTitle: "Pantry Pullouts",
    description:
      "Custom pantry pullout systems designed to maximize usable storage and access. Built and installed to fit any cabinet or pantry configuration.",
    shortDescription: "Space-saving pullouts and pantry storage.",
    heroHeadline: "Stop Losing Things in the Back of Your Pantry",
    heroBody:
      "Custom pullout systems built to your cabinet dimensions, with full-extension hardware so you can actually reach what you stored.",
    ctaLabel: "Get a Pantry Quote",
    sortOrder: 3,
    aliases: ["pantry"],
    status: "active",
    valueBullets: [
      "Better access to every shelf — nothing lost in the back",
      "Custom fit for your existing cabinet or pantry openings",
      "Heavy-duty full-extension slide hardware",
    ],
  },
  {
    slug: "closet-systems",
    title: "Custom Closet Systems",
    shortTitle: "Closet Systems",
    description:
      "Closet systems built for practical storage, clean alignment, and efficient use of wall space. Walk-ins, reach-ins, and linen closets done right.",
    shortDescription: "Walk-ins, reach-ins, and linen closets done right.",
    heroHeadline: "A Closet That Actually Works for You",
    heroBody:
      "Custom closet systems designed around your wardrobe, built with solid components, and installed with the same care we bring to every finish carpentry job.",
    ctaLabel: "Get a Closet Quote",
    sortOrder: 4,
    aliases: ["closets"],
    status: "active",
    valueBullets: [
      "Designed around how you actually use your space",
      "Double hang, shelving, drawers, and shoe storage layouts",
      "Clean alignment with no exposed edges or raw cuts",
    ],
  },
  {
    slug: "custom-cabinetry",
    title: "Custom Cabinetry",
    shortTitle: "Custom Cabinetry",
    description:
      "Cabinet builds and installs with clean alignment, proper filler details, and durable finish options. Kitchen, bath, laundry, and beyond.",
    shortDescription: "Custom boxes, panels, fillers, and installs.",
    heroHeadline: "Cabinetry Built to Fit — Not to Compromise",
    heroBody:
      "We build and install cabinets that fit your space precisely, with clean filler details, proper alignment, and finish-ready surfaces throughout.",
    ctaLabel: "Get a Cabinetry Quote",
    sortOrder: 5,
    aliases: ["cabinets"],
    status: "active",
    valueBullets: [
      "Built to your exact dimensions — no standard-size compromises",
      "Proper filler strips, scribe molding, and end panels",
      "Kitchen, laundry, bath, and utility builds",
    ],
  },
  {
    slug: "mantels",
    title: "Custom Mantels & Surrounds",
    shortTitle: "Mantels",
    description:
      "Custom mantel builds and fireplace surrounds tailored to your wall dimensions and finish details. Stained, painted, or raw — built to your spec.",
    shortDescription: "Modern wraps, beams, and fireplace surrounds.",
    heroHeadline: "A Fireplace That Commands the Room",
    heroBody:
      "We build custom mantels and surrounds scaled to your fireplace and wall — clean lines, solid construction, and finish-ready for your painter.",
    ctaLabel: "Get a Mantel Quote",
    sortOrder: 6,
    aliases: [],
    status: "active",
    valueBullets: [
      "Scaled to your fireplace opening and wall proportions",
      "Shelf, legs, and surround built as one cohesive unit",
      "Handed off paint-ready or stain-ready to your finish crew",
    ],
  },
  {
    slug: "mudrooms",
    title: "Custom Mudroom Built-ins",
    shortTitle: "Mudrooms",
    description:
      "Mudroom storage systems with lockers, benches, and hooks built to handle daily use and heavy traffic.",
    shortDescription: "Lockers, benches, and entry storage.",
    heroHeadline: "A Mudroom That Handles Real Life",
    heroBody:
      "Custom mudroom built-ins with lockers, cubbies, benches, and hook panels — built to hold up and keep your entry organized.",
    ctaLabel: "Get a Mudroom Quote",
    sortOrder: 7,
    aliases: [],
    status: "coming-soon",
    valueBullets: [
      "Locker sections with hooks, shelves, and optional doors",
      "Built-in bench with storage below",
      "Sized for your entry width and ceiling height",
    ],
  },
  {
    slug: "garage-storage",
    title: "Garage Storage Systems",
    shortTitle: "Garage Storage",
    description:
      "Wall-mounted garage storage systems with cabinets, shelving, and overhead storage built to last.",
    shortDescription: "Cabinets, shelving, and overhead storage.",
    heroHeadline: "A Garage You Can Actually Park In",
    heroBody:
      "Custom garage storage systems with wall cabinets, open shelving, and overhead platforms — built tough and designed to stay organized.",
    ctaLabel: "Get a Garage Storage Quote",
    sortOrder: 8,
    aliases: [],
    status: "coming-soon",
    valueBullets: [
      "Wall-mounted systems that clear the floor",
      "Cabinet and open shelf combinations for tools and gear",
      "Overhead platform storage for bins and seasonal items",
    ],
  },
];

/** Active services in sort order */
export const ACTIVE_SERVICES = SERVICE_LIST.filter((s) => s.status === "active");

/**
 * Find a service by its canonical slug or any alias.
 * Returns the canonical ServiceDef in both cases.
 */
export function findService(slug: string): ServiceDef | undefined {
  return SERVICE_LIST.find((s) => s.slug === slug || s.aliases.includes(slug));
}

/** Legacy single-lookup helper */
export function getServiceMeta(slug: string): ServiceDef | null {
  return findService(slug) ?? null;
}

/** All slugs (canonical + aliases) that map to active services */
export function getAllServiceSlugs(): string[] {
  return SERVICE_LIST.flatMap((s) => [s.slug, ...s.aliases]);
}
