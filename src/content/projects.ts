export type ProjectLocation = {
  city: string;
  cityLabel: string;
  state: string;
};

export type ProjectDef = {
  slug: string;
  title: string;
  serviceSlug: string;
  location: ProjectLocation;
  summary: string;
  challenge: string;
  solution: string;
  materials: string;
  timeline: string;
  year: string;
  featured: boolean;
  /** Explicit Cloudinary public IDs — highest-priority image source */
  galleryImagePublicIds?: string[];
  /** Cloudinary tag to search when no explicit IDs — defaults to serviceSlug */
  galleryServiceSlug?: string;
  /** Slug from testimonials.ts — normalized testimonial reference */
  testimonialSlug?: string;
  relatedServices: string[];
  seoTitle: string;
  seoDescription: string;
};

export const PROJECT_LIST: ProjectDef[] = [
  {
    slug: "henderson-built-in-library",
    title: "Henderson Built-In Library Wall",
    serviceSlug: "built-ins",
    location: { city: "henderson", cityLabel: "Henderson", state: "NV" },
    featured: true,
    year: "2024",
    summary:
      "Floor-to-ceiling library wall with integrated desk and display niches for a Henderson home office.",
    challenge:
      "The client needed to transform a bare 14-foot wall into a functional library with a built-in desk, open display shelves, and closed storage — all while keeping cable management invisible and the finished look seamless.",
    solution:
      "We measured and shop-built modular sections that fit the wall precisely, incorporating a floating desk with a drawer cabinet base, flanking bookcases with adjustable shelves, and a central display niche with LED cove lighting wired behind the face frame.",
    materials: "Paint-grade MDF, solid maple face frames, brushed nickel hardware",
    timeline: "3 weeks",
    testimonialSlug: "sarah-tom-m-built-in-library",
    relatedServices: ["floating-shelves", "custom-cabinetry"],
    seoTitle: "Henderson Built-In Library Wall | Sublime Design NV",
    seoDescription:
      "Custom floor-to-ceiling built-in library wall with integrated desk, open shelves, and closed storage — designed and installed in Henderson, NV.",
  },
  {
    slug: "summerlin-floating-shelves",
    title: "Summerlin Living Room Floating Shelves",
    serviceSlug: "floating-shelves",
    location: { city: "summerlin", cityLabel: "Summerlin", state: "NV" },
    featured: true,
    year: "2024",
    summary:
      "Staggered walnut floating shelves with invisible steel bracket mounts in a Summerlin great room.",
    challenge:
      "The client wanted dramatic floating shelves on a 10-foot accent wall that would support heavy books and decorative items without any visible hardware — and align perfectly with the existing wall texture and ceiling height.",
    solution:
      "We used concealed steel rod brackets set deep into the studs and installed custom-milled walnut shelves at staggered heights. Each shelf was leveled precisely to account for slight wall irregularities, and the rod pockets were filled and painted to disappear.",
    materials: "American black walnut, concealed steel rod hardware",
    timeline: "1 week",
    testimonialSlug: "michael-r-floating-shelves",
    relatedServices: ["built-ins", "mantels"],
    seoTitle: "Summerlin Floating Shelves | Sublime Design NV",
    seoDescription:
      "Custom staggered walnut floating shelves with invisible steel mounts — designed and installed in a Summerlin, NV living room.",
  },
  {
    slug: "las-vegas-pantry-pullouts",
    title: "Las Vegas Kitchen Pantry Pullout System",
    serviceSlug: "pantry-pullouts",
    location: { city: "las-vegas", cityLabel: "Las Vegas", state: "NV" },
    featured: false,
    year: "2024",
    summary:
      "Full-depth pullout shelves and drawer organizers retrofitted into existing pantry cabinet boxes in a Las Vegas kitchen.",
    challenge:
      "Deep pantry shelves were creating dead zones at the back of each cabinet, making it impossible to see or reach items stored there. The client wanted to reclaim every inch of pantry space without replacing the cabinet boxes.",
    solution:
      "We measured each cabinet opening individually and built custom soft-close pullout frames with full-extension drawer slides. The system included tiered spice pullouts, a baking sheet organizer, and wide-format shelves for small appliances.",
    materials: "Baltic birch plywood, full-extension soft-close slides, chrome wire inserts",
    timeline: "2 days",
    testimonialSlug: "patricia-w-pantry-pullouts",
    relatedServices: ["custom-cabinetry", "closet-systems"],
    seoTitle: "Las Vegas Pantry Pullout Shelves | Sublime Design NV",
    seoDescription:
      "Custom pantry pullout shelves and drawer organizers retrofitted into existing cabinetry — Las Vegas kitchen project.",
  },
  {
    slug: "henderson-closet-system",
    title: "Henderson Primary Closet Overhaul",
    serviceSlug: "closet-systems",
    location: { city: "henderson", cityLabel: "Henderson", state: "NV" },
    featured: true,
    year: "2024",
    summary:
      "Custom double-hang sections, floor-to-ceiling drawers, and open shoe display in a Henderson primary walk-in closet.",
    challenge:
      "A walk-in closet with only a single hanging rod and one wire shelf was being shared by two people with no dedicated zones for hanging, folding, shoes, or accessories — all within a fixed room footprint.",
    solution:
      "We designed a zone-based layout: double-hang sections on both side walls, a central island with deep drawers and a felt-lined jewelry tray, and floor-to-ceiling open shelving for shoes and bags on the back wall. Every piece was shop-built for a furniture-grade finish.",
    materials: "Paint-grade MDF, soft-close undermount slides, polished chrome rods and hardware",
    timeline: "1.5 weeks",
    testimonialSlug: "jessica-chris-l-closet-system",
    relatedServices: ["built-ins", "pantry-pullouts"],
    seoTitle: "Henderson Closet System | Sublime Design NV",
    seoDescription:
      "Custom built-in closet system with double-hang sections, built-in drawers, and shoe display — installed in Henderson, NV.",
  },
  {
    slug: "summerlin-mudroom-cabinetry",
    title: "Summerlin Mudroom Entry Cabinetry",
    serviceSlug: "custom-cabinetry",
    location: { city: "summerlin", cityLabel: "Summerlin", state: "NV" },
    featured: false,
    year: "2024",
    summary:
      "Built-in mudroom bench with cubbies, coat hooks, and lower cabinet storage in a Summerlin entry hall.",
    challenge:
      "A narrow entry hall was being used as an informal drop zone — backpacks, shoes, and coats piled with no organization. The client needed individual cubbies per family member, bench seating, and concealed storage, all within a 6-foot wall run.",
    solution:
      "We built a floor-to-ceiling cabinet wall with five individual open cubbies above a shaker-style bench, a coat hook rail at each cubby, and two-door base cabinets with adjustable shelves below for shoes and seasonal gear.",
    materials: "Paint-grade maple, shaker panel doors, matte black hardware",
    timeline: "2 weeks",
    testimonialSlug: "tom-g-mudroom-cabinetry",
    relatedServices: ["closet-systems", "built-ins"],
    seoTitle: "Summerlin Mudroom Cabinetry | Sublime Design NV",
    seoDescription:
      "Custom mudroom built-in with bench, cubbies, and cabinet storage — designed and installed in Summerlin, NV.",
  },
  {
    slug: "las-vegas-fireplace-mantel",
    title: "Las Vegas Custom Fireplace Mantel",
    serviceSlug: "mantels",
    location: { city: "las-vegas", cityLabel: "Las Vegas", state: "NV" },
    featured: false,
    year: "2024",
    summary:
      "Craftsman-style fireplace mantel surround with built-in display ledge and painted finish in a Las Vegas living room.",
    challenge:
      "The existing fireplace had a builder-grade prefab surround that clashed with the client's transitional interior style. They wanted a custom mantel with more visual weight, a deep display ledge, and trim details that matched the rest of the room.",
    solution:
      "We designed a Craftsman-profile surround with a deep display ledge, pilasters on each side, and a coffered header — shop-built in sections for precise fit and finished with satin white paint matched to the room's existing trim throughout.",
    materials: "Paint-grade MDF, solid poplar trim details, satin finish paint",
    timeline: "1 week",
    testimonialSlug: "david-k-fireplace-mantel",
    relatedServices: ["built-ins", "floating-shelves"],
    seoTitle: "Las Vegas Custom Fireplace Mantel | Sublime Design NV",
    seoDescription:
      "Custom Craftsman-style fireplace mantel surround with display ledge — designed and installed in Las Vegas, NV.",
  },
];

export const FEATURED_PROJECTS = PROJECT_LIST.filter((p) => p.featured);

export function findProject(slug: string): ProjectDef | undefined {
  return PROJECT_LIST.find((p) => p.slug === slug);
}

export function getProjectsByService(serviceSlug: string): ProjectDef[] {
  return PROJECT_LIST.filter((p) => p.serviceSlug === serviceSlug);
}

export function getAllProjectSlugs(): string[] {
  return PROJECT_LIST.map((p) => p.slug);
}
