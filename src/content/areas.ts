import { PROJECT_LIST, sortProjectsForDisplay } from "@/content/projects";
import { FEATURED_REVIEWS, REVIEW_LIST } from "@/content/reviews";
import { ACTIVE_SERVICES } from "@/content/services";

export type AreaStatus = "active" | "coming-soon";

export type AreaDef = {
  slug: string;
  name: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  intro: string;
  heroHeadline: string;
  heroBody: string;
  serviceAreaLabel: string;
  relatedServiceSlugs: string[];
  nearbyAreas: string[];
  status?: AreaStatus;
};

export const AREA_LIST: AreaDef[] = [
  {
    slug: "summerlin",
    name: "Summerlin",
    title: "Custom Finish Carpentry in Summerlin",
    seoTitle: "Custom Finish Carpentry Summerlin | Sublime Design NV",
    seoDescription:
      "Custom built-ins, floating shelves, cabinetry, and closet systems in Summerlin. Measured, built, and installed by Sublime Design NV.",
    intro:
      "Summerlin projects usually call for clean lines, tight installs, and built-ins that feel like part of the home instead of furniture added after the fact. We handle the measure, build, and install with that standard in mind.",
    heroHeadline: "Custom Carpentry for Summerlin Homes",
    heroBody:
      "Built-ins, floating shelves, cabinetry, closet systems, pantry pullouts, and mantels measured and installed for homes across Summerlin.",
    serviceAreaLabel: "Summerlin",
    relatedServiceSlugs: ["floating-shelves", "built-ins", "custom-cabinetry", "mantels"],
    nearbyAreas: ["las-vegas", "spring-valley", "paradise"],
    status: "active",
  },
  {
    slug: "henderson",
    name: "Henderson",
    title: "Custom Finish Carpentry in Henderson",
    seoTitle: "Custom Finish Carpentry Henderson | Sublime Design NV",
    seoDescription:
      "Custom built-ins, closet systems, pantry pullouts, and cabinetry in Henderson. Shop-built and installed by Sublime Design NV.",
    intro:
      "Henderson homeowners usually want finish carpentry that solves a storage problem and still looks like it belongs with the rest of the house. We build around the room, the wall conditions, and the daily use of the space.",
    heroHeadline: "Measured and Built for Henderson Homes",
    heroBody:
      "Custom finish carpentry in Henderson with a focus on built-ins, closet systems, cabinetry, and clean install work that fits the home.",
    serviceAreaLabel: "Henderson",
    relatedServiceSlugs: ["built-ins", "closet-systems", "pantry-pullouts", "custom-cabinetry"],
    nearbyAreas: ["las-vegas", "paradise", "spring-valley"],
    status: "active",
  },
  {
    slug: "las-vegas",
    name: "Las Vegas",
    title: "Custom Finish Carpentry in Las Vegas",
    seoTitle: "Custom Finish Carpentry Las Vegas | Sublime Design NV",
    seoDescription:
      "Custom floating shelves, built-ins, pantry pullouts, closet systems, cabinetry, and mantels in Las Vegas by Sublime Design NV.",
    intro:
      "Las Vegas projects cover everything from one-wall built-ins to full pantry and closet upgrades. We keep the process straightforward: measure the space, build to fit, and install cleanly.",
    heroHeadline: "Custom Carpentry Across Las Vegas",
    heroBody:
      "Finish carpentry for Las Vegas homes including built-ins, floating shelves, pantry pullouts, closet systems, cabinetry, and mantels.",
    serviceAreaLabel: "Las Vegas",
    relatedServiceSlugs: ["floating-shelves", "built-ins", "pantry-pullouts", "mantels"],
    nearbyAreas: ["summerlin", "spring-valley", "paradise", "henderson"],
    status: "active",
  },
  {
    slug: "spring-valley",
    name: "Spring Valley",
    title: "Custom Finish Carpentry in Spring Valley",
    seoTitle: "Custom Finish Carpentry Spring Valley | Sublime Design NV",
    seoDescription:
      "Custom finish carpentry in Spring Valley with built-ins, cabinetry, closet systems, and floating shelves designed and installed by Sublime Design NV.",
    intro:
      "Spring Valley homes often need practical storage upgrades that still read custom. We build finish carpentry around the exact room dimensions so the result feels intentional and long-term.",
    heroHeadline: "Finish Carpentry for Spring Valley Homes",
    heroBody:
      "Custom built-ins, cabinetry, shelves, and storage systems for homes in Spring Valley and the surrounding Las Vegas Valley.",
    serviceAreaLabel: "Spring Valley",
    relatedServiceSlugs: ["built-ins", "custom-cabinetry", "floating-shelves", "closet-systems"],
    nearbyAreas: ["las-vegas", "summerlin", "paradise"],
    status: "active",
  },
  {
    slug: "paradise",
    name: "Paradise",
    title: "Custom Finish Carpentry in Paradise",
    seoTitle: "Custom Finish Carpentry Paradise | Sublime Design NV",
    seoDescription:
      "Custom finish carpentry in Paradise including cabinetry, built-ins, floating shelves, and pantry pullouts by Sublime Design NV.",
    intro:
      "Paradise projects need the same measured fit and clean install as the rest of the valley. We build the work to the room, keep the details tight, and make the next step clear before install day.",
    heroHeadline: "Custom Carpentry for Paradise Properties",
    heroBody:
      "Measured, built, and installed custom carpentry for homes in Paradise, from built-ins and shelves to pantry and cabinetry upgrades.",
    serviceAreaLabel: "Paradise",
    relatedServiceSlugs: ["built-ins", "floating-shelves", "pantry-pullouts", "custom-cabinetry"],
    nearbyAreas: ["las-vegas", "henderson", "spring-valley"],
    status: "active",
  },
];

export const ACTIVE_AREAS = AREA_LIST.filter((area) => (area.status ?? "active") === "active");

export function findArea(slug: string) {
  return AREA_LIST.find((area) => area.slug === slug);
}

export function getAllAreaSlugs() {
  return ACTIVE_AREAS.map((area) => area.slug);
}

export function getAreaProjects(areaSlug: string) {
  return sortProjectsForDisplay(
    PROJECT_LIST.filter((project) => project.location.city === areaSlug),
  );
}

export function getAreaServices(areaSlug: string) {
  const area = findArea(areaSlug);
  if (!area) return [];

  return area.relatedServiceSlugs
    .map((slug) => ACTIVE_SERVICES.find((service) => service.slug === slug))
    .filter((service): service is NonNullable<typeof service> => Boolean(service));
}

export function getAreaReviews(areaSlug: string) {
  const area = findArea(areaSlug);
  if (!area) return [];

  const areaProjects = new Set(getAreaProjects(areaSlug).map((project) => project.slug));
  const matching = REVIEW_LIST.filter((review) => {
    const locationMatch = review.location.toLowerCase().includes(area.name.toLowerCase());
    const projectMatch = review.projectSlug ? areaProjects.has(review.projectSlug) : false;
    return locationMatch || projectMatch;
  });

  return matching.length ? matching : FEATURED_REVIEWS.slice(0, 2);
}
