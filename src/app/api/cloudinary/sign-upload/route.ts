import { type NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { GALLERY_SECTIONS } from "@/lib/gallery.config";

const MAX_FILES_PER_REQUEST = 20;
const ALLOWED_FOLDERS = new Set(GALLERY_SECTIONS.map((section) => section.folder));

type SignUploadBody = {
  folder?: string;
  fileCount?: number;
};

function isAdminTokenAuthorized(request: NextRequest) {
  const expected = process.env.ADMIN_UPLOAD_TOKEN;
  const received = request.headers.get("x-admin-token");
  return Boolean(expected && received && received === expected);
}

function isVercelProtectionAuthorized(request: NextRequest) {
  const expected =
    process.env.VERCEL_AUTOMATION_BYPASS_SECRET ??
    process.env.VERCEL_PROTECTION_BYPASS;
  const received = request.headers.get("x-vercel-protection-bypass");
  return Boolean(expected && received && received === expected);
}

function isAuthorized(request: NextRequest) {
  if (isAdminTokenAuthorized(request)) return true;
  if (isVercelProtectionAuthorized(request)) return true;
  return false;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as SignUploadBody;
  const folder = body.folder?.trim();

  if (!folder) {
    return NextResponse.json(
      { ok: false, error: "folder is required" },
      { status: 400 },
    );
  }

  if (!ALLOWED_FOLDERS.has(folder)) {
    return NextResponse.json(
      { ok: false, error: "folder is not allowed" },
      { status: 400 },
    );
  }

  if (typeof body.fileCount === "number") {
    if (!Number.isInteger(body.fileCount) || body.fileCount < 1) {
      return NextResponse.json(
        { ok: false, error: "fileCount must be a positive integer" },
        { status: 400 },
      );
    }

    if (body.fileCount > MAX_FILES_PER_REQUEST) {
      return NextResponse.json(
        {
          ok: false,
          error: `Too many files. Maximum is ${MAX_FILES_PER_REQUEST} per request.`,
        },
        { status: 400 },
      );
    }
  }

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
  const paramsToSign = { folder, timestamp };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return NextResponse.json({
    timestamp,
    signature,
    apiKey,
    cloudName,
    folder,
  });
}
