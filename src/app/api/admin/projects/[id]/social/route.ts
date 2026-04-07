import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

async function generateSocialCopy(project: {
  title: string;
  description: string | null;
  serviceSlug: string | null;
  serviceLabel: string | null;
  location: string | null;
  areaLabel: string | null;
  completionMonth: number | null;
  completionYear: number | null;
  slug: string;
}): Promise<{ instagramCaption: string; facebookCaption: string; hashtagSet: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");

  const completionDate =
    project.completionMonth && project.completionYear
      ? new Date(project.completionYear, project.completionMonth - 1).toLocaleString("en-US", {
          month: "long",
          year: "numeric",
        })
      : null;

  const prompt = `You are a social media copywriter for Sublime Design NV, a custom woodworking and cabinetry company in Las Vegas, NV.

Write social media content for this completed project:
- Title: ${project.title}
- Service: ${project.serviceLabel ?? project.serviceSlug ?? "Custom woodwork"}
- Location: ${[project.location, project.areaLabel].filter(Boolean).join(", ") || "Las Vegas, NV"}
- Description: ${project.description || "Custom woodworking project"}
${completionDate ? `- Completed: ${completionDate}` : ""}
- Project URL: https://sublimedesignnv.com/projects/${project.slug}

Return ONLY valid JSON with these exact keys:
{
  "instagramCaption": "...",
  "facebookCaption": "...",
  "hashtagSet": "..."
}

Guidelines:
- instagramCaption: 150-200 chars, warm and visual, ends with a CTA like "Link in bio →". No hashtags.
- facebookCaption: 200-280 chars, slightly longer, includes the full project URL at the end. Conversational tone.
- hashtagSet: 15-20 hashtags space-separated. Mix: brand (#SublimeDesignNV), location (#LasVegas #Henderson #SummerlinNV), service (#CustomCabinetry #FloatingShelves etc.), material/style (#WalnutWood #ModernStorage etc.)`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as { choices: { message: { content: string } }[] };
  const raw = data.choices[0]?.message?.content ?? "";
  const cleaned = raw.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();

  const parsed = JSON.parse(cleaned) as {
    instagramCaption: string;
    facebookCaption: string;
    hashtagSet: string;
  };

  return {
    instagramCaption: parsed.instagramCaption ?? "",
    facebookCaption: parsed.facebookCaption ?? "",
    hashtagSet: parsed.hashtagSet ?? "",
  };
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL not configured." }, { status: 503 });
  }

  const { id } = await params;
  const project = await db.project.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      serviceSlug: true,
      location: true,
      areaSlug: true,
      completionMonth: true,
      completionYear: true,
      slug: true,
    },
  });

  if (!project) {
    return NextResponse.json({ ok: false, error: "Project not found." }, { status: 404 });
  }

  const { findService } = await import("@/content/services");
  const { findArea } = await import("@/content/areas");

  const serviceLabel = project.serviceSlug ? (findService(project.serviceSlug)?.shortTitle ?? null) : null;
  const areaLabel = project.areaSlug ? (findArea(project.areaSlug)?.name ?? null) : null;

  const captions = await generateSocialCopy({ ...project, serviceLabel, areaLabel });

  await db.project.update({
    where: { id },
    data: {
      instagramCaption: captions.instagramCaption,
      facebookCaption: captions.facebookCaption,
      hashtagSet: captions.hashtagSet,
      socialExportedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, ...captions });
}
