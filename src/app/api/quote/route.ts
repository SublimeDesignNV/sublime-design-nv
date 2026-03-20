import { NextResponse } from "next/server";
import { Resend } from "resend";
import { ACTIVE_SERVICES } from "@/content/services";
import { saveLead } from "@/lib/leads";
import {
  buildQuoteSubject,
  getQuoteSpamSignals,
  isValidBudget,
  isValidTimeline,
  normalizeQuoteRequestPayload,
  validateQuoteFields,
  type QuoteFieldErrors,
} from "@/lib/quoteForm";

// ─── Types ────────────────────────────────────────────────────────────────────

type QuotePayload = {
  [key: string]: unknown;
};

// ─── Validation helpers ───────────────────────────────────────────────────────

function serviceLabel(slug: string) {
  if (slug === "other") return "Other / Not sure";
  return ACTIVE_SERVICES.find((s) => s.slug === slug)?.shortTitle ?? slug;
}

function jsonValidationError(message: string, fieldErrors: QuoteFieldErrors, status = 400) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        type: "validation",
        message,
        fieldErrors,
      },
    },
    { status },
  );
}

function jsonServerError(message: string, status = 500) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        type: "server",
        message,
      },
    },
    { status },
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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
          <td style="padding:8px 12px;font-weight:600;color:#374151;white-space:nowrap;vertical-align:top;width:140px;">${escapeHtml(label)}</td>
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
                    <img src="${escapeHtml(url)}" alt="Lead photo ${i + 1}" width="160" height="120"
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
        ${escapeHtml(svcLabel)} — ${escapeHtml(fields.location)}
      </h1>
    </div>

    <!-- Body -->
    <div style="padding:28px;">

      <!-- Contact info -->
      <p style="margin:0 0 10px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;">Contact</p>
      <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
        <tbody>
          ${row("Name", escapeHtml(fields.name))}
          ${row("Email", `<a href="mailto:${escapeHtml(fields.email)}" style="color:#b91c1c;">${escapeHtml(fields.email)}</a>`)}
          ${row("Phone", `<a href="tel:${escapeHtml(fields.phone.replace(/\D/g, "").replace(/^(\d)/, "+1$1"))}" style="color:#b91c1c;">${escapeHtml(fields.phone)}</a>`)}
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
      <div style="background:#f9fafb;border-radius:8px;padding:14px 16px;color:#1f2937;line-height:1.6;white-space:pre-wrap;">${escapeHtml(fields.message)}</div>

      ${photosSection}

      ${(fields.projectTitle || fields.projectSlug || fields.sourceType || fields.sourcePath || fields.areaSlug || fields.ctaLabel)
        ? `<p style="margin:24px 0 10px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;">Source Context</p>
      <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
        <tbody>
          ${row("Project", fields.projectTitle ? escapeHtml(fields.projectTitle) : "")}
          ${row("Project Slug", fields.projectSlug ? escapeHtml(fields.projectSlug) : "")}
          ${row("Area", fields.areaSlug ? escapeHtml(fields.areaSlug) : "")}
          ${row("Source Type", fields.sourceType ? escapeHtml(fields.sourceType) : "")}
          ${row("Source Path", fields.sourcePath ? escapeHtml(fields.sourcePath) : "")}
          ${row("CTA", fields.ctaLabel ? escapeHtml(fields.ctaLabel) : "")}
        </tbody>
      </table>`
        : ""}

      ${(fields.utmSource || fields.utmMedium || fields.utmCampaign || fields.referrer)
        ? `<p style="margin:0 0 10px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;">Attribution</p>
      <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;overflow:hidden;">
        <tbody>
          ${row("UTM Source", fields.utmSource ? escapeHtml(fields.utmSource) : "")}
          ${row("UTM Medium", fields.utmMedium ? escapeHtml(fields.utmMedium) : "")}
          ${row("UTM Campaign", fields.utmCampaign ? escapeHtml(fields.utmCampaign) : "")}
          ${row("Referrer", fields.referrer ? escapeHtml(fields.referrer) : "")}
        </tbody>
      </table>`
        : ""}

      <!-- Actions -->
      <div style="margin-top:28px;display:flex;gap:12px;">
        <a href="mailto:${escapeHtml(fields.email)}?subject=Re: ${encodeURIComponent(`Your ${svcLabel} Quote Request`)}"
           style="display:inline-block;background:#b91c1c;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">
          Reply to ${escapeHtml(fields.name.split(" ")[0] || "Lead")}
        </a>
        <a href="tel:${escapeHtml(fields.phone.replace(/\D/g, "").replace(/^(\d)/, "+1$1"))}"
           style="display:inline-block;background:#1e3a5f;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">
          Call ${escapeHtml(fields.phone)}
        </a>
      </div>

      ${fields.leadId ? `<p style="margin-top:20px;font-size:11px;color:#9ca3af;">Lead ID: ${escapeHtml(fields.leadId)}</p>` : ""}
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
    const normalized = normalizeQuoteRequestPayload(body);
    const { fields } = normalized;
    const fieldErrors = validateQuoteFields(fields);

    if (fields.timeline && !isValidTimeline(fields.timeline)) {
      fieldErrors.timeline = "Please choose a valid timeline option.";
    }
    if (fields.budget && !isValidBudget(fields.budget)) {
      fieldErrors.budget = "Please choose a valid budget range.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return jsonValidationError("Please review the highlighted fields and try again.", fieldErrors);
    }

    const spamSignals = getQuoteSpamSignals(normalized);
    if (spamSignals.honeypotTriggered || spamSignals.submittedTooFast) {
      return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
    }

    // Persist lead (soft-fail)
    const leadId = await saveLead({
      name: fields.name,
      email: fields.email,
      phone: fields.phone,
      service: fields.service,
      location: fields.location,
      timeline: fields.timeline || undefined,
      budget: fields.budget || undefined,
      message: fields.message,
      photoUrls: normalized.photoUrls,
      sourceType: normalized.sourceType,
      sourcePath: normalized.sourcePath,
      projectTitle: normalized.projectTitle,
      projectSlug: normalized.projectSlug,
      areaSlug: normalized.areaSlug,
      utmSource: normalized.utmSource,
      utmMedium: normalized.utmMedium,
      utmCampaign: normalized.utmCampaign,
      referrer: normalized.referrer,
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
        { ok: false, error: { type: "server", message: "Email send failed. Please call us directly." } },
        { status: 500 },
      );
    }

    const resend = new Resend(resendApiKey);
    const from =
      (typeof process.env.LEADS_FROM_EMAIL === "string" ? process.env.LEADS_FROM_EMAIL.trim() : "") ||
      "Sublime Design NV <admin@sublimedesignnv.com>";

    const recipients = ["admin@sublimedesignnv.com"];
    const cc = typeof process.env.LEADS_CC_EMAIL === "string" ? process.env.LEADS_CC_EMAIL.trim() : "";
    if (cc) recipients.push(cc);

    const subject = buildQuoteSubject(
      {
        name: fields.name,
        service: fields.service,
        location: fields.location,
      },
      normalized.sourceType,
      normalized.projectTitle,
    );

    const emailFields = {
      name: fields.name,
      email: fields.email,
      phone: fields.phone,
      service: fields.service,
      location: fields.location,
      timeline: fields.timeline,
      budget: fields.budget,
      message: fields.message,
      photoUrls: normalized.photoUrls,
      leadId,
      utmSource: normalized.utmSource,
      utmMedium: normalized.utmMedium,
      utmCampaign: normalized.utmCampaign,
      referrer: normalized.referrer,
      sourceType: normalized.sourceType,
      sourcePath: normalized.sourcePath,
      projectTitle: normalized.projectTitle,
      projectSlug: normalized.projectSlug,
      areaSlug: normalized.areaSlug,
      ctaLabel: normalized.ctaLabel,
    };

    const { error: sendError } = await resend.emails.send({
      from,
      to: recipients,
      subject,
      replyTo: fields.email,
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
        { ok: false, error: { type: "server", message: "Email send failed. Please call us directly." } },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, leadId }, { status: 200 });
  } catch (error) {
    console.error("[quote-email] Unexpected error", error);
    return jsonServerError("We couldn’t submit your request right now. Please try again or call us directly.");
  }
}
