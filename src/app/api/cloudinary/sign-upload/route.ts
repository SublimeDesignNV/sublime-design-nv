import { type NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getProjectSlugFromFolder, isValidProjectSlug } from "@/lib/projectSlug";

const MAX_FILES_PER_REQUEST = 20;
const ALLOWED_CONTEXT_KEYS = [
  "project_name",
  "project_slug",
  "service",
  "city",
  "state",
  "material",
  "finish",
  "room",
  "style",
  "year",
  "featured",
  "caption",
  "alt",
  "gps_lat",
  "gps_lng",
] as const;

type AllowedContextKey = (typeof ALLOWED_CONTEXT_KEYS)[number];

type SignUploadBody = {
  folder?: string;
  fileCount?: number;
  tags?: string[];
  context?: Partial<Record<AllowedContextKey, string>>;
};

function sanitizeValue(value: string | undefined) {
  if (!value) return "";
  return value.replace(/[|=]/g, " ").trim();
}

function toContextString(context: Partial<Record<AllowedContextKey, string>>) {
  const pairs: string[] = [];

  for (const key of ALLOWED_CONTEXT_KEYS) {
    const sanitized = sanitizeValue(context[key]);
    if (sanitized) {
      pairs.push(`${key}=${sanitized}`);
    }
  }

  return pairs.join("|");
}

function toTagsString(tags: string[] | undefined) {
  if (!tags?.length) return "";

  return Array.from(
    new Set(
      tags
        .map((tag) => tag.toLowerCase().replace(/[^a-z0-9-\s]/g, "").trim())
        .filter(Boolean),
    ),
  ).join(",");
}

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

function badRequest(error: string) {
  return NextResponse.json({ ok: false, error }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const expectedToken = process.env.ADMIN_UPLOAD_TOKEN;
  const providedToken = request.headers.get("x-admin-token");

  if (!expectedToken || !providedToken || providedToken !== expectedToken) {
    return unauthorized();
  }

  const body = (await request.json().catch(() => ({}))) as SignUploadBody;
  const folder = sanitizeValue(body.folder);

  if (!folder) {
    return badRequest("folder is required");
  }

  const projectSlugFromFolder = getProjectSlugFromFolder(folder);
  if (!projectSlugFromFolder || !isValidProjectSlug(projectSlugFromFolder)) {
    return badRequest("folder must match Sublime/Projects/<project_slug>");
  }

  if (typeof body.fileCount === "number") {
    if (!Number.isInteger(body.fileCount) || body.fileCount < 1) {
      return badRequest("fileCount must be a positive integer");
    }

    if (body.fileCount > MAX_FILES_PER_REQUEST) {
      return badRequest(`Too many files. Maximum is ${MAX_FILES_PER_REQUEST} per request.`);
    }
  }

  const contextInput = body.context ?? {};
  const contextProjectName = sanitizeValue(contextInput.project_name);
  const contextProjectSlug = sanitizeValue(contextInput.project_slug);

  if (!contextProjectName) {
    return badRequest("context.project_name is required");
  }

  if (!contextProjectSlug || !isValidProjectSlug(contextProjectSlug)) {
    return badRequest("context.project_slug is required and must be a valid slug");
  }

  if (contextProjectSlug !== projectSlugFromFolder) {
    return badRequest("context.project_slug must match folder slug");
  }

  const sanitizedContext: Partial<Record<AllowedContextKey, string>> = {
    project_name: contextProjectName,
    project_slug: contextProjectSlug,
    service: sanitizeValue(contextInput.service),
    city: sanitizeValue(contextInput.city),
    state: sanitizeValue(contextInput.state),
    material: sanitizeValue(contextInput.material),
    finish: sanitizeValue(contextInput.finish),
    room: sanitizeValue(contextInput.room),
    style: sanitizeValue(contextInput.style),
    year: sanitizeValue(contextInput.year),
    featured: sanitizeValue(contextInput.featured),
    caption: sanitizeValue(contextInput.caption),
    alt: sanitizeValue(contextInput.alt),
    gps_lat: sanitizeValue(contextInput.gps_lat),
    gps_lng: sanitizeValue(contextInput.gps_lng),
  };

  const context = toContextString(sanitizedContext);
  const tags = toTagsString(body.tags);

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { ok: false, error: "Cloudinary environment is not configured." },
      { status: 500 },
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign: Record<string, string | number> = { folder, timestamp };

  if (tags) {
    paramsToSign.tags = tags;
  }

  if (context) {
    paramsToSign.context = context;
  }

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return NextResponse.json({
    timestamp,
    signature,
    apiKey,
    cloudName,
    folder,
    tags,
    context,
  });
}
