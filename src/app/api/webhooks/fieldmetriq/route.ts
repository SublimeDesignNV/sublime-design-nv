import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

function verifySignature(body: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  const provided = signature.replace("sha256=", "");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(provided, "hex"),
    );
  } catch {
    return false;
  }
}

const SERVICE_SLUG_MAP: Record<string, string> = {
  "Floating Shelves": "floating-shelves",
  "Built-Ins": "built-ins",
  "Built Ins": "built-ins",
  "Custom Cabinets": "custom-cabinetry",
  "Cabinets": "custom-cabinetry",
  "Pantry Pullouts": "pantry-pullouts",
  "Pantry": "pantry-pullouts",
  "Closet Systems": "closet-systems",
  "Closets": "closet-systems",
  "Mantels": "mantels",
  "Media Walls": "built-ins",
  "Media Wall": "built-ins",
};

type FMJobPayload = {
  event: string;
  job: {
    jobId: string;
    clientName?: string;
    serviceType?: string;
    neighborhood?: string;
    completionDate?: string;
    contractorId?: string;
    workDescription?: string;
    notes?: string;
    photoUrls?: string[];
  };
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-fieldmetriq-signature") ?? "";
  const secret = process.env.FIELDMETRIQ_WEBHOOK_SECRET ?? "";

  if (!secret || !verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: FMJobPayload;
  try {
    payload = JSON.parse(rawBody) as FMJobPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (payload.event !== "job.completed") {
    return NextResponse.json({ received: true });
  }

  const { job } = payload;

  const serviceSlug = job.serviceType
    ? (SERVICE_SLUG_MAP[job.serviceType] ??
       job.serviceType.toLowerCase().replace(/\s+/g, "-"))
    : null;

  // Parse completionDate → year + month
  let completionYear: number | null = null;
  let completionMonth: number | null = null;
  if (job.completionDate) {
    const d = new Date(job.completionDate);
    if (!isNaN(d.getTime())) {
      completionYear = d.getFullYear();
      completionMonth = d.getMonth() + 1;
    }
  }

  const projectSlug = `fm-${job.jobId}-${Date.now()}`;
  const title =
    job.serviceType && job.neighborhood
      ? `${job.serviceType} · ${job.neighborhood}`
      : `FM Job ${job.jobId}`;

  const description =
    job.workDescription ?? job.notes ?? `Imported from FieldMetriq job ${job.jobId}`;

  const project = await db.project
    .upsert({
      where: { slug: projectSlug },
      update: {},
      create: {
        slug: projectSlug,
        title,
        description,
        location: job.neighborhood ?? null,
        serviceSlug: serviceSlug ?? null,
        completionYear,
        completionMonth,
        published: false,
        externalId: job.jobId,
        externalSource: "fieldmetriq",
      },
    })
    .catch(() => null);

  const params = new URLSearchParams();
  if (job.jobId) params.set("fmJobId", job.jobId);
  if (project?.id) params.set("projectId", project.id);
  if (job.serviceType) params.set("service", serviceSlug ?? job.serviceType);
  if (job.neighborhood) params.set("location", job.neighborhood);
  if (job.completionDate) params.set("date", job.completionDate);
  if (job.workDescription ?? job.notes) {
    params.set("notes", (job.workDescription ?? job.notes) as string);
  }

  const uploadUrl = `https://www.sublimedesignnv.com/admin/uploads?${params.toString()}`;
  const projectUrl = project
    ? `https://www.sublimedesignnv.com/projects/${projectSlug}`
    : null;

  return NextResponse.json({
    received: true,
    projectId: project?.id ?? null,
    projectSlug,
    uploadUrl,
    projectUrl,
  });
}
