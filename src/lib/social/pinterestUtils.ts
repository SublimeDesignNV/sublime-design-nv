import { db } from "@/lib/db";

type ProjectRef = { serviceSlug: string | null; areaSlug: string | null };

export async function getDefaultBoardForProject(project: ProjectRef) {
  // 1. Board set as default for this service
  if (project.serviceSlug) {
    const serviceBoard = await db.pinterestBoard.findFirst({
      where: { serviceType: project.serviceSlug, isDefault: true },
    });
    if (serviceBoard) return serviceBoard;
  }

  // 2. Board matching the area
  if (project.areaSlug) {
    const areaBoard = await db.pinterestBoard.findFirst({
      where: { area: project.areaSlug },
    });
    if (areaBoard) return areaBoard;
  }

  // 3. First board in DB
  return db.pinterestBoard.findFirst({ orderBy: { name: "asc" } });
}
