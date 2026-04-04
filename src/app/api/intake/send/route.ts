import { NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { sendSMS, buildIntakeSMSBody } from "@/lib/twilio/sendSMS";
import { SITE } from "@/lib/constants";
import type { IntakeServiceType } from "@prisma/client";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildIntakeEmailHtml(firstName: string, intakeUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#CC2027;padding:24px 28px;">
      <p style="margin:0;color:rgba(255,255,255,0.82);font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Sublime Design NV</p>
      <h1 style="margin:8px 0 0;color:#fff;font-size:24px;font-weight:700;">Your Project Vision Awaits</h1>
    </div>
    <div style="padding:28px;">
      <p style="margin:0 0 14px;color:#111827;font-size:16px;">Hi ${escapeHtml(firstName)},</p>
      <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.7;">
        Tyler at Sublime Design NV here. Tap the button below to share your project details and inspiration —
        we'll use it to show you a <strong>visual concept of your project</strong> before we ever start measuring.
        Takes about 5 minutes.
      </p>
      <a href="${escapeHtml(intakeUrl)}"
         style="display:inline-block;background:#CC2027;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;">
        Share Your Vision →
      </a>
      <p style="margin:24px 0 0;color:#6b7280;font-size:13px;">
        Or copy this link: <a href="${escapeHtml(intakeUrl)}" style="color:#CC2027;">${escapeHtml(intakeUrl)}</a>
      </p>
    </div>
    <div style="padding:16px 28px;border-top:1px solid #e5e7eb;background:#f9fafb;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">${escapeHtml(SITE.name)} · ${escapeHtml(SITE.phone)}</p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(request: Request) {
  const session = await requireAdminApiSession();
  if (!session) return unauthorizedResponse();

  const body = (await request.json()) as {
    firstName: string;
    lastName?: string;
    phone?: string;
    email?: string;
    serviceType: IntakeServiceType;
    projectNotes?: string;
    sendVia: "sms" | "email";
  };

  if (!body.firstName || !body.serviceType || !body.sendVia) {
    return NextResponse.json(
      { ok: false, error: "firstName, serviceType, and sendVia are required" },
      { status: 400 },
    );
  }

  if (body.sendVia === "sms" && !body.phone) {
    return NextResponse.json(
      { ok: false, error: "phone is required for SMS" },
      { status: 400 },
    );
  }

  if (body.sendVia === "email" && !body.email) {
    return NextResponse.json(
      { ok: false, error: "email is required for email delivery" },
      { status: 400 },
    );
  }

  const lead = await db.intakeLead.create({
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      email: body.email,
      serviceType: body.serviceType,
      projectNotes: body.projectNotes,
      status: "INTAKE_SENT",
    },
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    SITE.url;
  const intakeUrl = `${baseUrl}/intake/${lead.token}`;

  if (body.sendVia === "sms" && body.phone) {
    await sendSMS(body.phone, buildIntakeSMSBody(body.firstName, intakeUrl));
  } else if (body.sendVia === "email" && body.email) {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json(
        { ok: false, error: "Email not configured (missing RESEND_API_KEY)" },
        { status: 500 },
      );
    }
    const resend = new Resend(resendApiKey);
    const from =
      (process.env.LEADS_FROM_EMAIL ?? "").trim() ||
      `${SITE.name} <admin@sublimedesignnv.com>`;
    await resend.emails.send({
      from,
      to: body.email,
      subject: `Your Sublime Design Project — Share Your Vision`,
      html: buildIntakeEmailHtml(body.firstName, intakeUrl),
      text: buildIntakeSMSBody(body.firstName, intakeUrl),
    });
  }

  return NextResponse.json({
    ok: true,
    leadId: lead.id,
    token: lead.token,
    intakeUrl,
  });
}
