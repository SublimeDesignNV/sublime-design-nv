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
  /** Top-tier projects surfaced first on homepage and projects index */
  flagship?: boolean;
  /** Lower numbers surface first among flagship projects */
  flagshipOrder?: number;
  /** Explicit Cloudinary public IDs — highest-priority image source */
  galleryImagePublicIds?: string[];
  /** Cloudinary tag to search when no explicit IDs — defaults to serviceSlug */
  galleryServiceSlug?: string;
  /** Slug from testimonials.ts — normalized testimonial reference */
  testimonialSlug?: string;
  preferredHeroPublicId?: string;
  preferredGalleryFirstPublicId?: string;
  intro?: string;
  problem?: string;
  approach?: string;
  result?: string;
  clientType?: string;
  scopeItems?: string[];
  fitBullets?: string[];
  commonRequests?: string[];
  materialsDetail?: string;
  timelineDetail?: string;
  ctaLine?: string;
  heroAlt?: string;
  galleryAltPrefix?: string;
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
    flagship: true,
    flagshipOrder: 1,
    year: "2024",
    summary:
      "Floor-to-ceiling built-in library wall with integrated desk and display storage for a Henderson home office.",
    challenge:
      "The client needed to transform a bare 14-foot wall into a functional library with a built-in desk, open display shelves, and closed storage — all while keeping cable management invisible and the finished look seamless.",
    solution:
      "We measured and shop-built modular sections that fit the wall precisely, incorporating a floating desk with a drawer cabinet base, flanking bookcases with adjustable shelves, and a central display niche with LED cove lighting wired behind the face frame.",
    materials: "Paint-grade MDF, solid maple face frames, brushed nickel hardware",
    timeline: "3 weeks",
    intro:
      "This Henderson library wall was designed to turn one blank office wall into a full working case-study piece: storage below, display above, and an integrated desk that feels built into the home instead of set against it.",
    problem:
      "The room had plenty of wall space but no real storage, no focal point, and nowhere to work without adding freestanding furniture that would make the office feel crowded.",
    approach:
      "We measured the full wall, broke the build into shop-fabricated sections, and planned the desk, display niche, adjustable shelving, and closed storage as one continuous built-in installation.",
    result:
      "The finished wall now functions as library, workstation, and display piece in one clean run, with tight reveals and enough storage to keep the office usable day to day.",
    clientType: "Home office homeowner",
    scopeItems: [
      "Floor-to-ceiling bookcase sections",
      "Integrated desk and drawer base",
      "Display niche with concealed lighting path",
      "Closed lower storage and trim fit-out",
    ],
    materialsDetail:
      "Paint-grade MDF cabinet boxes, solid maple face frames, adjustable shelving hardware, and brushed nickel pulls selected to match the home's finish carpentry.",
    timelineDetail:
      "Three weeks from final field measure to installation, including shop build, site fitting, and punch adjustments.",
    ctaLine:
      "Planning a home office or library wall in Henderson or Las Vegas Valley? We can quote the layout, storage, and install approach.",
    heroAlt:
      "Henderson built-in library wall with integrated desk, display niche, and full-height shelving",
    galleryAltPrefix:
      "Henderson built-in library wall detail showing custom shelving and desk installation",
    fitBullets: [
      "You want wall-to-wall storage that looks built with the room.",
      "The space needs display, work surface, and concealed storage in one run.",
      "You want a measured installation instead of stock cabinets plus filler work.",
    ],
    commonRequests: [
      "Integrated desk and drawer base",
      "Adjustable shelving for books and display pieces",
      "Closed lower cabinets for office storage",
    ],
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
    flagship: true,
    flagshipOrder: 2,
    year: "2024",
    summary:
      "Walnut floating shelves with concealed steel support and a clean staggered layout in a Summerlin great room.",
    challenge:
      "The client wanted dramatic floating shelves on a 10-foot accent wall that would support heavy books and decorative items without any visible hardware — and align perfectly with the existing wall texture and ceiling height.",
    solution:
      "We used concealed steel rod brackets set deep into the studs and installed custom-milled walnut shelves at staggered heights. Each shelf was leveled precisely to account for slight wall irregularities, and the rod pockets were filled and painted to disappear.",
    materials: "American black walnut, concealed steel rod hardware",
    timeline: "1 week",
    intro:
      "This Summerlin floating-shelves project was built to read clean from across the room and still carry real weight up close, with concealed support and custom spacing tied to the wall and furniture layout.",
    problem:
      "The homeowner wanted open display storage without visible brackets, but the wall needed to support books and decor without sagging or looking like an afterthought.",
    approach:
      "We laid out the full composition first, located structural support points behind the wall, and built each walnut shelf to fit its exact bracket pocket and final reveal.",
    result:
      "The shelves now act like built-in architecture rather than accessory pieces, giving the room warmth, storage, and a cleaner focal wall without visible hardware.",
    clientType: "Living room homeowner",
    scopeItems: [
      "Accent-wall layout planning",
      "Concealed bracket placement into framing",
      "Custom walnut shelf fabrication",
      "Level install and finish-ready detailing",
    ],
    materialsDetail:
      "Custom-milled American black walnut shelves paired with concealed steel rod hardware sized for the shelf depth and expected load.",
    timelineDetail:
      "One week from confirmed measurements to install, including bracket prep, fabrication, finish work, and final alignment.",
    ctaLine:
      "Need floating shelves that actually hold weight and look built in? We can quote the layout and install for your wall.",
    heroAlt:
      "Summerlin floating shelves in walnut with concealed steel support on a living room accent wall",
    galleryAltPrefix:
      "Summerlin floating shelves detail showing walnut finish and concealed bracket installation",
    fitBullets: [
      "You want open shelving without visible brackets or sagging lines.",
      "The wall needs a cleaner focal point without a full built-in run.",
      "You need shelves sized to the room, furniture, and real display weight.",
    ],
    commonRequests: [
      "Accent-wall shelf layouts",
      "Walnut or paint-grade shelf fabrication",
      "Heavy-duty concealed bracket installs",
    ],
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
    featured: true,
    flagship: true,
    flagshipOrder: 3,
    year: "2024",
    summary:
      "Full-depth pullout shelves and drawer organizers retrofitted into existing pantry cabinet boxes in a Las Vegas kitchen.",
    challenge:
      "Deep pantry shelves were creating dead zones at the back of each cabinet, making it impossible to see or reach items stored there. The client wanted to reclaim every inch of pantry space without replacing the cabinet boxes.",
    solution:
      "We measured each cabinet opening individually and built custom soft-close pullout frames with full-extension drawer slides. The system included tiered spice pullouts, a baking sheet organizer, and wide-format shelves for small appliances.",
    materials: "Baltic birch plywood, full-extension soft-close slides, chrome wire inserts",
    timeline: "2 days",
    intro:
      "This Las Vegas pantry pullout project focused on one thing: turning deep, low-visibility cabinet space into storage the homeowner could actually use every day without rebuilding the full kitchen.",
    problem:
      "Deep shelves were swallowing food, appliances, and small items at the back of the pantry cabinets, which meant the homeowner had capacity on paper but poor access in practice.",
    approach:
      "We measured every opening independently, built pullouts around those exact dimensions, and paired the layouts with full-extension slides so the full cabinet depth could be reached cleanly.",
    result:
      "The finished pantry now holds more usable storage, opens cleanly, and makes every cabinet easier to load, organize, and maintain without replacing the existing boxes.",
    clientType: "Kitchen homeowner",
    scopeItems: [
      "Field measurements for each pantry opening",
      "Custom pullout box fabrication",
      "Soft-close slide installation and tuning",
      "Organizer layout for spices, trays, and appliances",
    ],
    materialsDetail:
      "Baltic birch plywood pullout boxes, full-extension soft-close slides, and chrome organizer inserts selected for heavy pantry use.",
    timelineDetail:
      "Two-day turnaround for fabrication fit-up and on-site installation once cabinet measurements were confirmed.",
    ctaLine:
      "If your pantry cabinets waste depth, we can quote custom pullouts sized to the exact openings and hardware needed.",
    heroAlt:
      "Las Vegas kitchen pantry pullout system with custom full-extension shelves and organizer inserts",
    galleryAltPrefix:
      "Las Vegas pantry pullout detail showing custom shelving and full-extension storage hardware",
    fitBullets: [
      "Your pantry has depth but poor access.",
      "You want better storage without replacing cabinet boxes.",
      "The job needs clean hardware and precise fit inside existing openings.",
    ],
    commonRequests: [
      "Full-extension pantry pullouts",
      "Spice and tray organizers",
      "Heavy-duty slide upgrades for appliance storage",
    ],
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
      "Custom closet layout with double-hang sections, full-height drawers, and open shoe storage in Henderson.",
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

function getFlagshipSortValue(project: ProjectDef) {
  return project.flagshipOrder ?? Number.MAX_SAFE_INTEGER;
}

export function sortProjectsForDisplay(projects: ProjectDef[]): ProjectDef[] {
  return [...projects].sort((a, b) => {
    if (Boolean(a.flagship) !== Boolean(b.flagship)) {
      return a.flagship ? -1 : 1;
    }

    if (a.flagship && b.flagship && getFlagshipSortValue(a) !== getFlagshipSortValue(b)) {
      return getFlagshipSortValue(a) - getFlagshipSortValue(b);
    }

    if (a.featured !== b.featured) {
      return a.featured ? -1 : 1;
    }

    return PROJECT_LIST.findIndex((project) => project.slug === a.slug) -
      PROJECT_LIST.findIndex((project) => project.slug === b.slug);
  });
}

export const FEATURED_PROJECTS = sortProjectsForDisplay(
  PROJECT_LIST.filter((p) => p.featured),
);
export const FLAGSHIP_PROJECTS = sortProjectsForDisplay(
  PROJECT_LIST.filter((p) => p.flagship),
);

export function getPriorityProjects(minimum = 3): ProjectDef[] {
  const ranked = sortProjectsForDisplay(PROJECT_LIST);
  const selected: ProjectDef[] = [];
  const seen = new Set<string>();

  for (const project of ranked) {
    if (!project.flagship) continue;
    selected.push(project);
    seen.add(project.slug);
  }

  if (selected.length < minimum) {
    for (const project of ranked) {
      if (!project.featured || seen.has(project.slug)) continue;
      selected.push(project);
      seen.add(project.slug);
      if (selected.length >= minimum) break;
    }
  }

  return selected;
}

export function findProject(slug: string): ProjectDef | undefined {
  return PROJECT_LIST.find((p) => p.slug === slug);
}

export function getProjectsByService(serviceSlug: string): ProjectDef[] {
  return sortProjectsForDisplay(
    PROJECT_LIST.filter((p) => p.serviceSlug === serviceSlug),
  );
}

export function getAllProjectSlugs(): string[] {
  return PROJECT_LIST.map((p) => p.slug);
}
