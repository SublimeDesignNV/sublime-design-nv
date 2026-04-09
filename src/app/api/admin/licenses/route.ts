import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();
  const licenses = await db.contractorLicense.findMany({ orderBy: { position: "asc" } });
  return Response.json(licenses);
}

export async function POST(req: Request) {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();
  const body = (await req.json().catch(() => ({}))) as {
    licenseType?: string;
    licenseNumber?: string;
    issuingState?: string;
    expiresAt?: string | null;
  };
  if (!body.licenseType || !body.licenseNumber) {
    return Response.json({ error: "licenseType and licenseNumber required" }, { status: 400 });
  }
  const max = await db.contractorLicense.findFirst({ orderBy: { position: "desc" }, select: { position: true } });
  const license = await db.contractorLicense.create({
    data: {
      licenseType: body.licenseType,
      licenseNumber: body.licenseNumber,
      issuingState: body.issuingState ?? "NV",
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      position: (max?.position ?? -1) + 1,
    },
  });
  return Response.json(license);
}
