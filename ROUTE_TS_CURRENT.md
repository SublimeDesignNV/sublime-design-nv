import { NextResponse } from "next/server";
import { Resend } from "resend";

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

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QuotePayload;

    const name = normalize(body.name);
    const email = normalize(body.email);
    const phone = normalize(body.phone);
    const projectType = normalize(body.projectType);
    const message = normalize(body.message);

    if (!name || !email || !projectType || !message) {
      return NextResponse.json(
        { success: false, ok: false, error: "Missing required fields: name, email, projectType, message" },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, ok: false, error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("[quote-email] Missing RESEND_API_KEY");
      return NextResponse.json(
        { success: false, ok: false, error: "Email send failed" },
        { status: 500 },
      );
    }

    const resend = new Resend(resendApiKey);

    const recipients = ["admin@sublimedesignnv.com"];
    const backupRecipient = normalize(process.env.LEADS_CC_EMAIL);
    if (backupRecipient) {
      recipients.push(backupRecipient);
    }

    const from = normalize(process.env.LEADS_FROM_EMAIL) || "Sublime Design NV <admin@sublimedesignnv.com>";
    const safePhone = phone || "Not provided";

    const { error } = await resend.emails.send({
      from,
      to: recipients,
      subject: `New Quote Request: ${projectType}`,
      replyTo: email,
      text: [
        "New quote request received:",
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${safePhone}`,
        `Project Type: ${projectType}`,
        "",
        "Message:",
        message,
      ].join("\n"),
    });

    if (error) {
      console.error("[quote-email] Resend send failed", error);
      return NextResponse.json(
        { success: false, ok: false, error: "Email send failed" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, ok: true }, { status: 200 });
  } catch (error) {
    console.error("[quote-email] Invalid request", error);
    return NextResponse.json(
      { success: false, ok: false, error: "Invalid request." },
      { status: 400 },
    );
  }
}
