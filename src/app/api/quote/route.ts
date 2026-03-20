import { NextResponse } from "next/server";
import { Resend } from "resend";
import { ACTIVE_SERVICES } from "@/content/services";
import { saveLead } from "@/lib/leads";

// ─── Types ────────────────────────────────────────────────────────────────────

type QuotePayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  service?: unknown;
  location?: unknown;
  timeline?: unknown;
  budget?: unknown;
  message?: unknown;
  photoUrls?: unknown;
  consent?: unknown;
  utmSource?: unknown;
  utmMedium?: unknown;
  utmCampaign?: unknown;
  referrer?: unknown;
  sourceType?: unknown;
  sourcePath?: unknown;
  projectTitle?: unknown;
  projectSlug?: unknown;
  areaSlug?: unknown;
  ctaLabel?: unknown;
};

// ─── Validation helpers ───────────────────────────────────────────────────────

const ACTIVE_SERVICE_SLUGS = new Set(ACTIVE_SERVICES.map((s) => s.slug));

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function strArr(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function isValidService(v: string) {
  return ACTIVE_SERVICE_SLUGS.has(v) || v === "other";
}

function serviceLabel(slug: string) {
  if (slug === "other") return "Other / Not sure";
  return ACTIVE_SERVICES.find((s) => s.slug === slug)?.shortTitle ?? slug;
}

function sanitizeSlug(v: string) {
  return /^[a-z0-9-]{1,80}$/.test(v) ? v : "";
}

function sanitizeShort(v: string, max = 120) {
  return v.slice(0, max);
}

function sanitizePath(v: string) {
  return /^\/[a-z0-9\-/_?=&]*$/i.test(v) ? v.slice(0, 200) : "";
}

// ─── Email HTML builder ───────────────────────────────────────────────────────

function buildHtmlEmail(fields: {
  name: string;
  email: string;
  phone: string;
  service: string;
  location: string;
  timeline: string;
  budget: string;
  message: string;
  photoUrls: string[];
  leadId: string | null;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
  sourceType?: string;
  sourcePath?: string;
  projectTitle?: string;
  projectSlug?: string;
  areaSlug?: string;
  ctaLabel?: string;
}) {
  const svcLabel = serviceLabel(fields.service);

  const row = (label: string, value: string) =>
    value
      ? `<tr>
          <td style="padding:8px 12px;font-weight:600;color:#374151;white-space:nowrap;vertical-align:top;width:140px;">${label}</td>
          <td style="padding:8px 12px;color:#1f2937;">${value}</td>
        </tr>`
      : "";

  const photosSection =
    fields.photoUrls.length > 0
      ? `<div style="margin-top:24px;">
          <p style="margin:0 0 10px;font-weight:600;color:#374151;">Photos (${fields.photoUrls.length})</p>
          <div style="display:flex;flex-wrap:wrap;gap:10px;">
            ${fields.photoUrls
              .map(
                (url, i) =>
                  `<a href="${url}" style="display:inline-block;text-decoration:none;">
                    <img src="${url}" alt="Lead photo ${i + 1}" width="160" height="120"
                         style="border-radius:6px;object-fit:cover;border:1px solid #e5e7eb;" />
                  </a>`,
              )
              .join("")}
          </div>
        </div>`
      : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:#b91c1c;padding:24px 28px;">
      <p style="margin:0;color:rgba(255,255,255,0.8);font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">New Quote Request</p>
      <h1 style="margin:6px 0 0;color:#ffffff;font-size:22px;font-weight:700;">
        ${svcLabel} — ${fields.location}
      </h1>
    </div>

    <!-- Body -->
    <div style="padding:28px;">

      <!-- Contact info -->
      <p style="margin:0 0 10px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;">Contact</p>
      <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
        <tbody>
          ${row("Name", fields.name)}
          ${row("Email", `<a href="mailto:${fields.email}" style="color:#b91c1c;">${fields.email}</a>`)}
          ${row("Phone", `<a href="tel:${fields.phone.replace(/\D/g, "").replace(/^(\d)/, "+1$1")}" style="color:#b91c1c;">${fields.phone}</a>`)}
        </tbody>
      </table>

      <!-- Project details -->
      <p style="margin:0 0 10px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;">Project</p>
      <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
        <tbody>
          ${row("Service", svcLabel)}
          ${row("Location", fields.location)}
          ${row("Timeline", fields.timeline || "—")}
          ${row("Budget", fields.budget || "—")}
        </tbody>
      </table>

      <!-- Message -->
      <p style="margin:0 0 10px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;">Details</p>
      <div style="background:#f9fafb;border-radius:8px;padding:14px 16px;color:#1f2937;line-height:1.6;white-space:pre-wrap;">${fields.message}</div>

      ${photosSection}

      <!-- Actions -->
      <div style="margin-top:28px;display:flex;gap:12px;">
        <a href="mailto:${fields.email}?subject=Re: ${encodeURIComponent(`Your ${svcLabel} Quote Request`)}"
           style="display:inline-block;background:#b91c1c;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">
          Reply to ${fields.name.split(" ")[0]}
        </a>
        <a href="tel:${fields.phone.replace(/\D/g, "").replace(/^(\d)/, "+1$1")}"
           style="display:inline-block;background:#1e3a5f;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">
          Call ${fields.phone}
        </a>
      </div>

      ${fields.leadId ? `<p style="margin-top:20px;font-size:11px;color:#9ca3af;">Lead ID: ${fields.leadId}</p>` : ""}
      ${(fields.utmSource || fields.utmMedium || fields.utmCampaign || fields.referrer)
        ? `<p style="margin-top:8px;font-size:11px;color:#9ca3af;">
            Source: ${[fields.utmSource, fields.utmMedium, fields.utmCampaign].filter(Boolean).join(" / ") || "—"}
            ${fields.referrer ? ` · Referrer: ${fields.referrer}` : ""}
           </p>`
        : ""}
      ${(fields.sourceType || fields.sourcePath || fields.projectSlug || fields.areaSlug)
        ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;">
            ${fields.sourceType ? `<div>Lead Source: ${fields.sourceType}</div>` : ""}
            ${fields.sourcePath ? `<div>Source Path: ${fields.sourcePath}</div>` : ""}
            ${fields.projectTitle ? `<div>Project: ${fields.projectTitle}</div>` : ""}
            ${fields.projectSlug ? `<div>Project Slug: ${fields.projectSlug}</div>` : ""}
            ${fields.areaSlug ? `<div>Area Slug: ${fields.areaSlug}</div>` : ""}
            ${fields.ctaLabel ? `<div>CTA Label: ${fields.ctaLabel}</div>` : ""}
          </div>`
        : ""}
    </div>
  </div>
</body>
</html>`;
}

function buildTextEmail(fields: {
  name: string;
  email: string;
  phone: string;
  service: string;
  location: string;
  timeline: string;
  budget: string;
  message: string;
  photoUrls: string[];
  sourceType?: string;
  sourcePath?: string;
  projectTitle?: string;
  projectSlug?: string;
  areaSlug?: string;
  ctaLabel?: string;
}) {
  const svcLabel = serviceLabel(fields.service);
  const lines = [
    `NEW QUOTE REQUEST — ${svcLabel.toUpperCase()} — ${fields.location.toUpperCase()}`,
    "─".repeat(50),
    "",
    "CONTACT",
    `Name:     ${fields.name}`,
    `Email:    ${fields.email}`,
    `Phone:    ${fields.phone}`,
    "",
    "PROJECT",
    `Service:  ${svcLabel}`,
    `Location: ${fields.location}`,
    `Timeline: ${fields.timeline || "Not specified"}`,
    `Budget:   ${fields.budget || "Not specified"}`,
    "",
    "DETAILS",
    fields.message,
  ];

  if (fields.photoUrls.length > 0) {
    lines.push("", "PHOTOS");
    fields.photoUrls.forEach((url, i) => lines.push(`${i + 1}. ${url}`));
  }

  if (fields.sourceType || fields.sourcePath || fields.projectSlug || fields.areaSlug) {
    lines.push("", "SOURCE");
    if (fields.sourceType) lines.push(`Source Type: ${fields.sourceType}`);
    if (fields.sourcePath) lines.push(`Source Path: ${fields.sourcePath}`);
    if (fields.projectTitle) lines.push(`Project: ${fields.projectTitle}`);
    if (fields.projectSlug) lines.push(`Project Slug: ${fields.projectSlug}`);
    if (fields.areaSlug) lines.push(`Area Slug: ${fields.areaSlug}`);
    if (fields.ctaLabel) lines.push(`CTA Label: ${fields.ctaLabel}`);
  }

  return lines.join("\n");
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QuotePayload;

    const name = str(body.name);
    const email = str(body.email);
    const phone = str(body.phone);
    const service = str(body.service);
    const location = str(body.location);
    const timeline = str(body.timeline);
    const budget = str(body.budget);
    const message = str(body.message);
    const photoUrls = strArr(body.photoUrls);
    const consent = body.consent === true;
    const utmSource = str(body.utmSource);
    const utmMedium = str(body.utmMedium);
    const utmCampaign = str(body.utmCampaign);
    const referrer = str(body.referrer);
    const sourceType = sanitizeShort(str(body.sourceType), 40);
    const sourcePath = sanitizePath(str(body.sourcePath));
    const projectTitle = sanitizeShort(str(body.projectTitle), 120);
    const projectSlug = sanitizeSlug(str(body.projectSlug));
    const areaSlug = sanitizeSlug(str(body.areaSlug));
    const ctaLabel = sanitizeShort(str(body.ctaLabel), 60);

    // Required field validation
    const missing: string[] = [];
    if (!name) missing.push("name");
    if (!email) missing.push("email");
    if (!phone) missing.push("phone");
    if (!service) missing.push("service");
    if (!location) missing.push("location");
    if (!message) missing.push("message");
    if (!consent) missing.push("consent");

    if (missing.length > 0) {
      return NextResponse.json(
        { ok: false, error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    if (!isValidService(service)) {
      return NextResponse.json(
        { ok: false, error: "Please select a valid service." },
        { status: 400 },
      );
    }

    // Persist lead (soft-fail)
    const leadId = await saveLead({
      name,
      email,
      phone,
      service,
      location,
      timeline: timeline || undefined,
      budget: budget || undefined,
      message,
      photoUrls,
      utmSource: utmSource || undefined,
      utmMedium: utmMedium || undefined,
      utmCampaign: utmCampaign || undefined,
      referrer: referrer || undefined,
    });

    // Send email
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("[quote-email] Missing RESEND_API_KEY");
      // Still return success if we at least persisted the lead
      if (leadId) {
        return NextResponse.json({ ok: true, leadId }, { status: 200 });
      }
      return NextResponse.json(
        { ok: false, error: "Email send failed. Please call us directly." },
        { status: 500 },
      );
    }

    const resend = new Resend(resendApiKey);
    const from =
      str(process.env.LEADS_FROM_EMAIL) || "Sublime Design NV <admin@sublimedesignnv.com>";

    const recipients = ["admin@sublimedesignnv.com"];
    const cc = str(process.env.LEADS_CC_EMAIL);
    if (cc) recipients.push(cc);

    const svcLabel = serviceLabel(service);
    const subject = `New Quote Request — ${svcLabel} — ${location}`;

    const emailFields = {
      name, email, phone, service, location, timeline, budget, message, photoUrls, leadId,
      utmSource: utmSource || undefined,
      utmMedium: utmMedium || undefined,
      utmCampaign: utmCampaign || undefined,
      referrer: referrer || undefined,
      sourceType: sourceType || undefined,
      sourcePath: sourcePath || undefined,
      projectTitle: projectTitle || undefined,
      projectSlug: projectSlug || undefined,
      areaSlug: areaSlug || undefined,
      ctaLabel: ctaLabel || undefined,
    };

    const { error: sendError } = await resend.emails.send({
      from,
      to: recipients,
      subject,
      replyTo: email,
      html: buildHtmlEmail(emailFields),
      text: buildTextEmail(emailFields),
    });

    if (sendError) {
      console.error("[quote-email] Resend send failed", sendError);
      if (leadId) {
        // Lead was saved; email failed — still OK from user perspective
        return NextResponse.json({ ok: true, leadId }, { status: 200 });
      }
      return NextResponse.json(
        { ok: false, error: "Email send failed. Please call us directly." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, leadId }, { status: 200 });
  } catch (error) {
    console.error("[quote-email] Unexpected error", error);
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
}
