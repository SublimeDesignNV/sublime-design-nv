import { NextRequest, NextResponse } from "next/server";
import { getRecentPublicProjectLinks } from "@/lib/projectRecords.server";
import { isValidService, sanitizeSlug } from "@/lib/quoteForm";

export async function GET(request: NextRequest) {
  const service = sanitizeSlug(request.nextUrl.searchParams.get("service"));
  const serviceSlug = service && service !== "other" && isValidService(service) ? service : undefined;

  const projects = await getRecentPublicProjectLinks({
    serviceSlug,
    limit: 3,
  });

  return NextResponse.json({
    ok: true,
    projects: projects.map((project) => ({
      title: project.title,
      href: `/projects/${project.slug}`,
      serviceLabel: project.serviceLabel,
    })),
  });
}
