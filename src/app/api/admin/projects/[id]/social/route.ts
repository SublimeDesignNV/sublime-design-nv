import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

const PINTEREST_BOARD_NAMES = [
  "Floating Shelves Las Vegas",
  "Custom Cabinets Las Vegas",
  "Media Walls Las Vegas",
  "Barn Doors Las Vegas",
  "Faux Beams Las Vegas",
  "Mantels Las Vegas",
  "Feature Walls Las Vegas",
  "Closet Systems Las Vegas",
  "LED Lighting Ideas",
  "Las Vegas Custom Woodwork",
  "Henderson Custom Carpentry",
  "Summerlin Home Upgrades",
  "Lake Las Vegas Interiors",
  "North Las Vegas Home Projects",
  "Custom Woodwork Ideas",
  "White Oak Wood Projects",
  "Modern Living Room Ideas",
  "Kitchen Organization Ideas",
  "Home Office Built-Ins",
];

type SocialCopy = {
  instagramCaption: string;
  facebookCaption: string;
  hashtagSet: string;
  pinTitle: string;
  pinDescription: string;
  altText: string;
  suggestedBoards: string[];
};

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
}): Promise<SocialCopy> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");

  const completionDate =
    project.completionMonth && project.completionYear
      ? new Date(project.completionYear, project.completionMonth - 1).toLocaleString("en-US", {
          month: "long",
          year: "numeric",
        })
      : null;

  const projectUrl = `https://sublimedesignnv.com/projects/${project.slug}`;
  const location = [project.location, project.areaLabel].filter(Boolean).join(", ") || "Las Vegas, NV";
  const service = project.serviceLabel ?? project.serviceSlug ?? "Custom woodwork";

  const prompt = `You are a social media copywriter for Sublime Design NV, a custom woodworking and finish carpentry company in Las Vegas, NV.

Write social media content for this completed project:
- Title: ${project.title}
- Service: ${service}
- Location: ${location}
- Description: ${project.description || "Custom woodworking project"}
${completionDate ? `- Completed: ${completionDate}` : ""}
- Project URL: ${projectUrl}

Return ONLY valid JSON with these exact keys:
{
  "instagramCaption": "...",
  "facebookCaption": "...",
  "hashtagSet": "...",
  "pinTitle": "...",
  "pinDescription": "...",
  "altText": "...",
  "suggestedBoards": ["...", "..."]
}

Guidelines:
- instagramCaption: 150-200 chars, warm and visual, ends with "Link in bio →". No hashtags.
- facebookCaption: 200-280 chars, conversational, includes the full project URL at the end.
- hashtagSet: 15-20 hashtags space-separated. Mix: brand (#SublimeDesignNV), location (#LasVegas #Henderson #SummerlinNV), service (#CustomCabinetry #FloatingShelves etc.), material/style (#WalnutWood #ModernStorage etc.)
- pinTitle: max 100 chars, keyword-rich, include material + service + location. Example: "Custom White Oak Floating Shelves with LED Lighting - Lake Las Vegas, NV"
- pinDescription: max 500 chars. First sentence: what was built, materials, key features. Second: location + homeowner benefit. Third: CTA with location keyword. End with: "Custom finish carpentry by Sublime Design NV, Las Vegas Valley"
- altText: max 100 chars, descriptive for accessibility + SEO. Example: "16-foot white oak floating shelves with LED tape lighting in Lake Las Vegas home"
- suggestedBoards: pick 2-3 that best fit from this list: ${PINTEREST_BOARD_NAMES.join(", ")}`;

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
      max_tokens: 1200,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as { choices: { message: { content: string } }[] };
  const raw = data.choices[0]?.message?.content ?? "";
  const cleaned = raw.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();

  const parsed = JSON.parse(cleaned) as SocialCopy;

  return {
    instagramCaption: parsed.instagramCaption ?? "",
    facebookCaption: parsed.facebookCaption ?? "",
    hashtagSet: parsed.hashtagSet ?? "",
    pinTitle: parsed.pinTitle ?? "",
    pinDescription: parsed.pinDescription ?? "",
    altText: parsed.altText ?? "",
    suggestedBoards: parsed.suggestedBoards ?? [],
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

  return NextResponse.json({
    ok: true,
    instagramCaption: captions.instagramCaption,
    facebookCaption: captions.facebookCaption,
    hashtagSet: captions.hashtagSet,
    pinTitle: captions.pinTitle,
    pinDescription: captions.pinDescription,
    altText: captions.altText,
    suggestedBoards: captions.suggestedBoards,
  });
}
