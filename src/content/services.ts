export type ServiceStatus = "active" | "coming-soon";

export type FaqItem = {
  question: string;
  answer: string;
};

/**
 * Optional fields for future case-study pages.
 * Types are shaped here so project pages can be built cleanly later
 * without restructuring the service registry.
 */
export type ServiceCaseStudyMeta = {
  projectSlug?: string;
  projectTitle?: string;
  location?: string;
  summary?: string;
};

export type ServiceDef = {
  slug: string;
  title: string;
  shortTitle: string;
  /** Long marketing description */
  description: string;
  /** One-line card teaser */
  shortDescription: string;
  /** H1 on service page */
  heroHeadline: string;
  /** Body copy under the H1 */
  heroBody: string;
  /** Longer intro paragraph for SEO depth */
  introParagraph: string;
  /** 3 short value bullets */
  valueBullets: string[];
  /** 3 process step labels */
  processSteps: [string, string, string];
  /** 3 FAQ items */
  faq: FaqItem[];
  /** Slugs of related active services to link at page bottom */
  relatedServices: string[];
  /** <title> tag copy */
  seoTitle: string;
  /** Meta description copy */
  seoDescription: string;
  /** CTA button label */
  ctaLabel: string;
  sortOrder: number;
  /** URL slugs that redirect or resolve to this service */
  aliases: string[];
  status: ServiceStatus;
  /** Optional case-study preview data (populated when a featured project exists) */
  caseStudy?: ServiceCaseStudyMeta;
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
    introParagraph:
      "Most floating shelves look fine in the store and loose on the wall six months later. We build them differently. Every shelf we install is sized to your wall, anchored into studs or blocking with concealed hardware, and finished to your painter's spec. The result is a shelf that holds weight, looks clean, and doesn't shift. We work throughout Las Vegas, Henderson, Summerlin, and the surrounding valley.",
    valueBullets: [
      "Custom sizing for any wall or alcove",
      "Clean hidden bracket system — no visible hardware",
      "Professional install with level, plumb, and protected surfaces",
    ],
    processSteps: [
      "Measure your wall, locate studs, confirm depth and finish spec",
      "Build shelf and cut hidden bracket channel to exact fit",
      "Install bracket, mount shelf, verify level and reveal",
    ],
    faq: [
      {
        question: "How much weight can a floating shelf hold?",
        answer:
          "It depends on the bracket system and the wall. Our hidden bracket installs into studs or blocking and typically support 50–80 lbs per bracket. We size the bracket count to your shelf length and expected load during the estimate.",
      },
      {
        question: "Do you supply the wood or do I choose my own?",
        answer:
          "Both options work. We can source solid hardwood, plywood with a hardwood face, or MDF for painted applications. If you have material preferences we can also work from what you supply.",
      },
      {
        question: "Can floating shelves go on any wall?",
        answer:
          "Most walls are suitable. Drywall over studs is ideal. Tile, brick, and concrete are also workable with the right anchors. We confirm wall conditions during the site measure before committing to a bracket layout.",
      },
    ],
    relatedServices: ["built-ins", "custom-cabinetry"],
    seoTitle: "Custom Floating Shelves Las Vegas | Sublime Design NV",
    seoDescription:
      "Custom floating shelves installed throughout Las Vegas, Henderson, and Summerlin. Hidden brackets, solid wood, professional install. Get a quote today.",
    ctaLabel: "Get a Floating Shelf Quote",
    sortOrder: 1,
    aliases: [],
    status: "active",
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
    introParagraph:
      "A well-built built-in makes a room. A poorly built one shows every gap and never looks quite right. We measure before we build anything — ceiling height, wall rake, floor level, existing trim profiles — and fabricate components in our shop so the install is clean and fast. Whether it's an entertainment wall, a home office surround, or a library-style bookcase, we build it to fit your room and hand it off ready for your painter. We serve homeowners throughout Las Vegas, Henderson, Summerlin, and North Las Vegas.",
    valueBullets: [
      "Floor-to-ceiling designs that maximize every inch",
      "Adjustable shelf layouts built around your storage needs",
      "Finish-ready with paint or stain — no filler gaps",
    ],
    processSteps: [
      "Measure the wall — ceiling, floor, square, level, and trim profile",
      "Build components in the shop to your exact room dimensions",
      "Install, fit reveals, and hand off paint-ready or stain-ready",
    ],
    faq: [
      {
        question: "Are built-ins permanent or can they be removed later?",
        answer:
          "Built-ins are installed to be permanent, but they are not irreversible. They are attached to wall framing and can be removed if needed, though some patching and painting would follow. Most clients treat them as a long-term feature of the home.",
      },
      {
        question: "Can you build around an existing fireplace or window?",
        answer:
          "Yes. Flanking a fireplace or building around a window or door opening is one of the most common built-in requests we get. We account for all openings and protrusions during the measure.",
      },
      {
        question: "Do you include electrical or lighting?",
        answer:
          "We build the cabinet boxes and plan openings for outlets and lighting, but we do not do electrical rough-in. We coordinate with your electrician or you can have one in before we install.",
      },
    ],
    relatedServices: ["floating-shelves", "custom-cabinetry"],
    seoTitle: "Custom Built-In Shelving Las Vegas | Sublime Design NV",
    seoDescription:
      "Wall-to-wall built-ins for living rooms, offices, and media walls in Las Vegas and Henderson, NV. Shop-built, installed clean, handed off paint-ready.",
    ctaLabel: "Get a Built-in Quote",
    sortOrder: 2,
    aliases: [],
    status: "active",
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
    introParagraph:
      "Standard pantry shelves waste roughly a third of their depth because you can't reach the back without moving everything in front. Pullout systems fix that. We build them to your exact cabinet opening dimensions, use quality full-extension slides, and install them so they glide cleanly and close flush. Whether you have an existing pantry cabinet, a reach-in closet pantry, or a full walk-in, we can fit a pullout layout that makes use of every inch. We install throughout Las Vegas and the Henderson area.",
    valueBullets: [
      "Better access to every shelf — nothing lost in the back",
      "Custom fit for your existing cabinet or pantry openings",
      "Heavy-duty full-extension slide hardware",
    ],
    processSteps: [
      "Measure cabinet openings and confirm slide clearance specs",
      "Build pullout boxes to fit your opening dimensions exactly",
      "Install slides, fit boxes, adjust clearances and soft-close action",
    ],
    faq: [
      {
        question: "Do you work in existing cabinets or only new installs?",
        answer:
          "Mostly existing cabinets. Retrofitting pullouts into existing pantry or kitchen cabinets is our most common request. We just need the opening dimensions and interior depth to spec the hardware and build the boxes.",
      },
      {
        question: "What slide hardware do you use?",
        answer:
          "We use full-extension soft-close undermount or side-mount slides depending on cabinet configuration. We spec the load rating to match the expected use — heavier for canned goods and appliances, standard for pantry staples and dry goods.",
      },
      {
        question: "How long does a pantry pullout install take?",
        answer:
          "Most pantry installs take one day. We build the boxes in the shop ahead of time, so the day-of work is slide installation and box fitting — usually three to six hours depending on the number of units.",
      },
    ],
    relatedServices: ["closet-systems", "custom-cabinetry"],
    seoTitle: "Pantry Pullout Systems Las Vegas | Sublime Design NV",
    seoDescription:
      "Custom pantry pullout systems installed in Las Vegas and Henderson, NV. Retrofit into existing cabinets. Full-extension hardware, built and installed in one day.",
    ctaLabel: "Get a Pantry Quote",
    sortOrder: 3,
    aliases: ["pantry"],
    status: "active",
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
    introParagraph:
      "Wire shelving is cheap and it looks it. Prefab closet kits are designed for average spaces — not yours. We build closet systems from scratch, sized for your closet's exact footprint, and laid out around how you actually use the space. Double-hang sections for shirts and jackets, long hang for dresses, shelves and drawers where you need them, and a clean finish that looks like part of the house. We work in walk-in closets, reach-ins, and linen closets throughout Las Vegas, Henderson, and Summerlin.",
    valueBullets: [
      "Designed around how you actually use your space",
      "Double hang, shelving, drawers, and shoe storage layouts",
      "Clean alignment with no exposed edges or raw cuts",
    ],
    processSteps: [
      "Measure the closet and map out hanging, folding, and shoe storage needs",
      "Build towers, shelves, and drawer units to your exact dimensions",
      "Install, align, and adjust everything to square and level",
    ],
    faq: [
      {
        question: "Can you add drawers or a built-in dresser section?",
        answer:
          "Yes. Built-in drawer stacks are one of the most requested closet additions. We build them to the same standard as our cabinetry — dovetail drawers or full-extension boxes depending on the build spec.",
      },
      {
        question: "What is the lead time from quote to install?",
        answer:
          "Typically two to four weeks from signed quote to install day, depending on our current schedule. Smaller reach-in closets can sometimes move faster. We will give you a realistic timeline during the quote.",
      },
      {
        question: "Do you paint or stain the closet components?",
        answer:
          "We deliver the system either pre-primed for painting or pre-finished in a stain of your choice. Full paint or stain is available as an add-on. Many clients prefer to have their painter finish the system at the same time as surrounding trim.",
      },
    ],
    relatedServices: ["pantry-pullouts", "built-ins"],
    seoTitle: "Custom Closet Systems Las Vegas | Sublime Design NV",
    seoDescription:
      "Custom walk-in and reach-in closet systems in Las Vegas, Henderson, and Summerlin, NV. Built to your layout — double hang, shelves, drawers, and shoe storage.",
    ctaLabel: "Get a Closet Quote",
    sortOrder: 4,
    aliases: ["closets"],
    status: "active",
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
    introParagraph:
      "Stock cabinets are built for a range of spaces, not yours. The result is filler pieces that don't quite blend, alignment that never gets quite right, and details that look like an afterthought. We build custom boxes sized for your kitchen, bath, laundry, or utility room — and we install them with the filler strips, scribe molding, and end panels done right. If you are working with a designer or general contractor we can coordinate directly. If you are managing the project yourself we can walk you through the process. We install throughout the Las Vegas Valley.",
    valueBullets: [
      "Built to your exact dimensions — no standard-size compromises",
      "Proper filler strips, scribe molding, and end panels",
      "Kitchen, laundry, bath, and utility builds",
    ],
    processSteps: [
      "Measure the space, confirm filler, scribing, and reveal requirements",
      "Build boxes, doors, and drawer fronts in the shop",
      "Install, align, fit fillers and panels, deliver paint-ready",
    ],
    faq: [
      {
        question: "Do you work with existing cabinet doors or build new ones?",
        answer:
          "Both. We can build complete cabinets from scratch, or we can build new boxes to match existing door and drawer fronts. If you need replacement doors only, we can do that too.",
      },
      {
        question: "Can you match my existing kitchen cabinet style?",
        answer:
          "In most cases, yes. We build shaker, flat-panel, and inset-frame cabinet styles. If you have an existing kitchen and need to add an island, peninsula, or a run of cabinets, we can match the profile and finish closely.",
      },
      {
        question: "Do you install appliances or countertops?",
        answer:
          "We do not install countertops or appliances. We build and install the cabinet boxes and leave the space for your countertop installer. We coordinate reveals and filler widths so everything lines up correctly.",
      },
    ],
    relatedServices: ["built-ins", "mantels"],
    seoTitle: "Custom Cabinetry Las Vegas | Sublime Design NV",
    seoDescription:
      "Custom cabinet builds and installs for kitchens, bathrooms, and laundry rooms in Las Vegas, NV. Proper filler details, clean alignment, finish-ready delivery.",
    ctaLabel: "Get a Cabinetry Quote",
    sortOrder: 5,
    aliases: ["cabinets"],
    status: "active",
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
    introParagraph:
      "A fireplace without a proper mantel is just a hole in the wall. A mantel that isn't scaled to the room makes the problem worse. We design and build custom mantels proportioned to your fireplace opening, ceiling height, and wall width — then install them clean and hand them off ready to paint or stain. Whether you want something contemporary and minimal, a traditional surround with legs and a shelf, or a simple floating beam, we build it from solid wood and install it to last. We serve homeowners throughout Las Vegas and the surrounding valley.",
    valueBullets: [
      "Scaled to your fireplace opening and wall proportions",
      "Shelf, legs, and surround built as one cohesive unit",
      "Handed off paint-ready or stain-ready to your finish crew",
    ],
    processSteps: [
      "Measure fireplace opening, wall width, and ceiling height",
      "Build the surround, legs, and shelf as one unit in the shop",
      "Install to wall, fit to floor and ceiling line, finish-ready handoff",
    ],
    faq: [
      {
        question: "What wood species do you use for mantels?",
        answer:
          "Paint-grade mantels are typically built from MDF or poplar for a smooth finish. Stain-grade mantels use hardwoods — white oak, walnut, and alder are the most common requests. We can source others on request.",
      },
      {
        question: "Can you build around a gas or electric insert?",
        answer:
          "Yes, and we do it often. We need to know the clearance requirements for your specific unit — either from the manual or from your HVAC contractor — and we build the surround to those specs so you stay within code.",
      },
      {
        question: "Do you do the tile or stone work on the surround face?",
        answer:
          "No — we build the wood framing and mantel structure. Tile, stone, or shiplap on the surround face is typically done by your tile setter before or after we install the mantel, depending on the design sequence.",
      },
    ],
    relatedServices: ["custom-cabinetry", "built-ins"],
    seoTitle: "Custom Fireplace Mantels Las Vegas | Sublime Design NV",
    seoDescription:
      "Custom fireplace mantels and surrounds built and installed in Las Vegas, NV. Scaled to your wall, built in solid wood, paint-ready or stain-ready delivery.",
    ctaLabel: "Get a Mantel Quote",
    sortOrder: 6,
    aliases: [],
    status: "active",
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
    introParagraph:
      "A mudroom built-in needs to handle daily use from everyone in the house. We build them from solid components with proper joinery, sized for your entry width and ceiling height, and finished to take the abuse.",
    valueBullets: [
      "Locker sections with hooks, shelves, and optional doors",
      "Built-in bench with storage below",
      "Sized for your entry width and ceiling height",
    ],
    processSteps: [
      "Measure entry width, ceiling height, and traffic flow",
      "Build locker units and bench in the shop",
      "Install, fit to walls, and deliver paint-ready",
    ],
    faq: [
      {
        question: "Can mudroom lockers include doors?",
        answer:
          "Yes. Open cubbies are most common, but we can add shaker-style doors to any locker section for a cleaner look.",
      },
      {
        question: "Do you include a built-in bench seat?",
        answer:
          "Yes — a bench with either open storage or lift-lid storage below is standard in most mudroom builds.",
      },
      {
        question: "What is the typical mudroom build lead time?",
        answer:
          "Roughly two to three weeks from signed quote to install, depending on complexity and schedule availability.",
      },
    ],
    relatedServices: ["built-ins", "closet-systems"],
    seoTitle: "Custom Mudroom Built-ins Las Vegas | Sublime Design NV",
    seoDescription:
      "Custom mudroom storage systems with lockers, benches, and hooks in Las Vegas, NV. Built to your entry dimensions.",
    ctaLabel: "Get a Mudroom Quote",
    sortOrder: 7,
    aliases: [],
    status: "coming-soon",
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
    introParagraph:
      "A garage storage system needs to handle tools, seasonal gear, and everything else that doesn't fit in the house. We build wall-mounted systems that clear the floor, combine cabinet and open shelf sections, and install solidly into framing.",
    valueBullets: [
      "Wall-mounted systems that clear the floor",
      "Cabinet and open shelf combinations for tools and gear",
      "Overhead platform storage for bins and seasonal items",
    ],
    processSteps: [
      "Measure garage walls and confirm stud layout and floor clearance",
      "Build cabinet boxes and shelf units in the shop",
      "Install wall-mounted, level, and secure into framing",
    ],
    faq: [
      {
        question: "Can you build around garage doors and openers?",
        answer: "Yes — we account for door tracks and opener clearance in the layout during the measure.",
      },
      {
        question: "What finish options work in a garage environment?",
        answer:
          "Paint-grade melamine or a durable lacquer are the most common. We steer clear of raw MDF in garages due to humidity.",
      },
      {
        question: "Do you do epoxy floors as well?",
        answer: "No — we focus on the cabinetry and storage systems. Epoxy floors are a separate trade.",
      },
    ],
    relatedServices: ["built-ins", "custom-cabinetry"],
    seoTitle: "Garage Storage Systems Las Vegas | Sublime Design NV",
    seoDescription:
      "Custom garage storage systems with wall cabinets and shelving in Las Vegas, NV. Built and installed to last.",
    ctaLabel: "Get a Garage Storage Quote",
    sortOrder: 8,
    aliases: [],
    status: "coming-soon",
  },
];

/** Active services in sort order */
export const ACTIVE_SERVICES = SERVICE_LIST.filter((s) => s.status === "active");

/** Top 4 primary services for homepage spotlight */
export const HOMEPAGE_PRIMARY_SERVICES = ACTIVE_SERVICES.slice(0, 4);

/** Secondary services shown as a compact link row on the homepage */
export const HOMEPAGE_SECONDARY_SERVICES = ACTIVE_SERVICES.slice(4);

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
