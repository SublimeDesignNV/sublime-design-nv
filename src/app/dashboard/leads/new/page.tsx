"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { IntakeServiceType } from "@prisma/client";

const SERVICE_OPTIONS: { value: IntakeServiceType; label: string }[] = [
  { value: "BARN_DOORS", label: "Barn Doors" },
  { value: "CABINETS", label: "Cabinets" },
  { value: "CUSTOM_CLOSETS", label: "Custom Closets" },
  { value: "FAUX_BEAMS", label: "Faux Beams" },
  { value: "FLOATING_SHELVES", label: "Floating Shelves" },
  { value: "MANTELS", label: "Mantels" },
  { value: "TRIM_WORK", label: "Trim Work" },
  { value: "MULTIPLE", label: "Multiple / Unsure" },
  { value: "OTHER", label: "Other" },
];

export default function NewLeadPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    serviceType: "" as IntakeServiceType | "",
    projectNotes: "",
    sendVia: "sms" as "sms" | "email",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.firstName || !form.serviceType) {
      setError("First name and service type are required.");
      return;
    }
    if (form.sendVia === "sms" && !form.phone) {
      setError("Phone number is required for SMS.");
      return;
    }
    if (form.sendVia === "email" && !form.email) {
      setError("Email address is required for email delivery.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/intake/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName || undefined,
          phone: form.phone || undefined,
          email: form.email || undefined,
          serviceType: form.serviceType,
          projectNotes: form.projectNotes || undefined,
          sendVia: form.sendVia,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to send intake link");
      }

      const data = (await res.json()) as { leadId: string; intakeUrl: string };
      router.push(`/dashboard/leads/${data.leadId}?sent=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-navy text-white px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <a href="/dashboard/leads" className="text-white/60 hover:text-white text-sm">← Back</a>
          <h1 className="font-display text-2xl">New Client Intake</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <p className="text-gray-mid mb-8">
          Fill this out right after hanging up. We&apos;ll send the client a link to complete
          their intake and generate a visual concept.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-ui font-semibold text-charcoal mb-1.5">
                First Name <span className="text-red">*</span>
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                className="w-full border border-gray-warm rounded-lg px-4 py-3 text-charcoal focus:outline-none focus:border-red bg-white"
                placeholder="Jessica"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-ui font-semibold text-charcoal mb-1.5">Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                className="w-full border border-gray-warm rounded-lg px-4 py-3 text-charcoal focus:outline-none focus:border-red bg-white"
                placeholder="Martinez"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-ui font-semibold text-charcoal mb-1.5">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="w-full border border-gray-warm rounded-lg px-4 py-3 text-charcoal focus:outline-none focus:border-red bg-white"
                placeholder="(702) 555-0100"
              />
            </div>
            <div>
              <label className="block text-sm font-ui font-semibold text-charcoal mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full border border-gray-warm rounded-lg px-4 py-3 text-charcoal focus:outline-none focus:border-red bg-white"
                placeholder="jessica@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-ui font-semibold text-charcoal mb-1.5">
              Service Type <span className="text-red">*</span>
            </label>
            <select
              value={form.serviceType}
              onChange={(e) => update("serviceType", e.target.value)}
              className="w-full border border-gray-warm rounded-lg px-4 py-3 text-charcoal focus:outline-none focus:border-red bg-white"
              required
            >
              <option value="">Select a service...</option>
              {SERVICE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-ui font-semibold text-charcoal mb-1.5">
              Quick Notes <span className="font-normal text-gray-mid">(anything from the call)</span>
            </label>
            <textarea
              rows={3}
              value={form.projectNotes}
              onChange={(e) => update("projectNotes", e.target.value)}
              className="w-full border border-gray-warm rounded-lg px-4 py-3 text-charcoal focus:outline-none focus:border-red bg-white resize-none"
              placeholder="Wants walnut stain, 10-ft ceilings, has a tight budget..."
            />
          </div>

          <div>
            <label className="block text-sm font-ui font-semibold text-charcoal mb-3">
              Send via <span className="text-red">*</span>
            </label>
            <div className="flex gap-3">
              {(["sms", "email"] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => update("sendVia", method)}
                  className={`flex-1 py-3 rounded-lg border font-ui font-semibold text-sm transition-colors ${
                    form.sendVia === method
                      ? "border-red bg-red text-white"
                      : "border-gray-warm text-charcoal hover:border-red"
                  }`}
                >
                  {method === "sms" ? "📱 Text Message" : "✉️ Email"}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red/10 border border-red/30 text-red rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-red text-white font-ui font-bold py-4 rounded-lg hover:bg-red-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-lg"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </span>
            ) : (
              "Send Intake Link →"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
