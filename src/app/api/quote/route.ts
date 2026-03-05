import { NextResponse } from "next/server";

type QuotePayload = {
  name?: string;
  email?: string;
  phone?: string;
  projectType?: string;
  message?: string;
};

function normalize(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QuotePayload;

    const name = normalize(body.name);
    const email = normalize(body.email);
    const phone = normalize(body.phone);
    const projectType = normalize(body.projectType);
    const message = normalize(body.message);

    if (!name || !email || !phone || !projectType || !message) {
      return NextResponse.json(
        { ok: false, error: "Please complete all required fields." },
        { status: 400 },
      );
    }

    console.log("[quote-submission]", {
      name,
      email,
      phone,
      projectType,
      message,
      receivedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
}
