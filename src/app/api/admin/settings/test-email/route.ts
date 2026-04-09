import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { getBusinessSettings } from "@/lib/settings";
import { Resend } from "resend";

export async function POST() {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return Response.json({ ok: false, error: "RESEND_API_KEY not configured" }, { status: 400 });
  }

  const settings = await getBusinessSettings();
  const resend = new Resend(resendApiKey);

  const { error } = await resend.emails.send({
    from: `${settings.emailFromName} <${settings.emailFromAddress}>`,
    to: settings.emailFromAddress,
    replyTo: settings.emailReplyTo,
    subject: `Test email from ${settings.companyName} admin`,
    html: `<p style="font-family:sans-serif;color:#111827;">Your email settings are working correctly.</p>
           <p style="font-family:sans-serif;color:#6b7280;font-size:13px;">From: ${settings.emailFromName} &lt;${settings.emailFromAddress}&gt;<br>Reply-To: ${settings.emailReplyTo}</p>`,
    text: `Your email settings are working correctly.\n\nFrom: ${settings.emailFromName} <${settings.emailFromAddress}>\nReply-To: ${settings.emailReplyTo}`,
  });

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
