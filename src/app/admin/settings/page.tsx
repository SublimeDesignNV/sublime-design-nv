"use client";

import { useCallback, useEffect, useState } from "react";

type Settings = {
  id: string;
  companyName: string;
  tagline: string | null;
  phone: string;
  email: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  licenseC3: string | null;
  licenseB2: string | null;
  website: string | null;
  instagramHandle: string | null;
  facebookUrl: string | null;
  pinterestUrl: string | null;
  youtubeUrl: string | null;
  googlePlaceId: string | null;
  gbpLocationId: string | null;
  hoursMonFri: string | null;
  hoursSat: string | null;
  hoursSun: string | null;
  serviceRadius: number | null;
};

type Tab = "business" | "hours" | "social" | "integrations";

const TABS: { id: Tab; label: string }[] = [
  { id: "business", label: "Business Info" },
  { id: "hours", label: "Hours & Service Area" },
  { id: "social", label: "Social Accounts" },
  { id: "integrations", label: "Integrations" },
];

const COMMUNITIES = [
  "Las Vegas", "Henderson", "Summerlin", "North Las Vegas",
  "Lake Las Vegas", "Green Valley Ranch", "Anthem", "Rhodes Ranch",
  "Seven Hills", "Aliante", "Centennial Hills", "Silverado Ranch",
];

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block font-ui text-xs text-gray-mid">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none focus:border-navy"
      />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 font-ui text-xs font-semibold uppercase tracking-[0.16em] text-gray-mid">{children}</p>;
}

function IntegrationRow({
  label,
  status,
  value,
  placeholder,
}: {
  label: string;
  status: "configured" | "not-configured";
  value?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-warm bg-white px-4 py-3">
      <div>
        <p className="font-ui text-sm font-medium text-charcoal">{label}</p>
        {value ? <p className="font-ui text-xs text-gray-mid">{value}</p> : placeholder ? <p className="font-ui text-xs text-gray-mid">{placeholder}</p> : null}
      </div>
      <span className={`shrink-0 rounded-full border px-2.5 py-0.5 font-ui text-[10px] uppercase tracking-[0.14em] ${status === "configured" ? "border-green-200 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-400"}`}>
        {status === "configured" ? "✓ Configured" : "Not configured"}
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("business");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/settings");
    if (!res.ok) return;
    const data = (await res.json()) as Settings;
    setSettings(data);
  }, []);

  useEffect(() => { void load(); }, [load]);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => prev ? { ...prev, [key]: value } : prev);
  }

  async function save() {
    if (!settings) return;
    setIsSaving(true);
    setError(null);
    setSaveMsg(null);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setIsSaving(false);
    if (!res.ok) { setError("Failed to save settings."); return; }
    setSaveMsg("Settings saved.");
    setTimeout(() => setSaveMsg(null), 3000);
  }

  if (!settings) {
    return <main className="bg-cream px-4 pt-8 md:px-8"><p className="mt-8 font-ui text-sm text-gray-mid">Loading…</p></main>;
  }

  const str = (v: string | null | undefined) => v ?? "";

  return (
    <main className="bg-cream px-4 pb-16 pt-8 md:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mt-8 text-4xl text-charcoal">Settings</h1>

        {/* Tab bar */}
        <div className="mt-6 flex gap-1 border-b border-gray-warm">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`px-4 py-2.5 font-ui text-sm transition-colors ${tab === id ? "border-b-2 border-navy text-navy -mb-px" : "text-gray-mid hover:text-charcoal"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {error ? <p className="mt-4 font-ui text-sm text-red">{error}</p> : null}
        {saveMsg ? <p className="mt-4 font-ui text-sm text-green-700">{saveMsg}</p> : null}

        {/* ── Business Info ───────────────────────────────── */}
        {tab === "business" && (
          <div className="mt-6 space-y-6">
            <div className="rounded-xl border border-gray-warm bg-white p-5 space-y-4">
              <SectionTitle>Company Details</SectionTitle>
              <Field label="Company Name" value={str(settings.companyName)} onChange={(v) => set("companyName", v)} />
              <Field label="Tagline" value={str(settings.tagline)} onChange={(v) => set("tagline", v)} placeholder="Custom Woodwork. Elevated." />
              <Field label="Phone" value={str(settings.phone)} onChange={(v) => set("phone", v)} type="tel" placeholder="702-847-9016" />
              <Field label="Email" value={str(settings.email)} onChange={(v) => set("email", v)} type="email" />
              <Field label="Website" value={str(settings.website)} onChange={(v) => set("website", v)} placeholder="https://sublimedesignnv.com" />
            </div>

            <div className="rounded-xl border border-gray-warm bg-white p-5 space-y-4">
              <SectionTitle>Address</SectionTitle>
              <Field label="Street Address" value={str(settings.address)} onChange={(v) => set("address", v)} placeholder="6325 S Pecos Rd #14" />
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <Field label="City" value={str(settings.city)} onChange={(v) => set("city", v)} placeholder="Las Vegas" />
                </div>
                <div>
                  <Field label="State" value={str(settings.state)} onChange={(v) => set("state", v)} placeholder="NV" />
                </div>
                <div>
                  <Field label="ZIP" value={str(settings.zip)} onChange={(v) => set("zip", v)} placeholder="89120" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-warm bg-white p-5 space-y-4">
              <SectionTitle>License Numbers</SectionTitle>
              <Field label="C3 License" value={str(settings.licenseC3)} onChange={(v) => set("licenseC3", v)} placeholder="C3 #82320" />
              <Field label="B2 License" value={str(settings.licenseB2)} onChange={(v) => set("licenseB2", v)} placeholder="B2 #92234" />
            </div>

            <button type="button" onClick={() => void save()} disabled={isSaving} className="rounded-lg bg-navy px-6 py-2.5 font-ui text-sm text-white transition hover:bg-navy/90 disabled:opacity-50">
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        )}

        {/* ── Hours & Service Area ──────────────────────── */}
        {tab === "hours" && (
          <div className="mt-6 space-y-6">
            <div className="rounded-xl border border-gray-warm bg-white p-5 space-y-4">
              <SectionTitle>Business Hours</SectionTitle>
              <Field label="Monday – Friday" value={str(settings.hoursMonFri)} onChange={(v) => set("hoursMonFri", v)} placeholder="7:00 AM – 6:00 PM" />
              <Field label="Saturday" value={str(settings.hoursSat)} onChange={(v) => set("hoursSat", v)} placeholder="By Appointment" />
              <Field label="Sunday" value={str(settings.hoursSun)} onChange={(v) => set("hoursSun", v)} placeholder="Closed" />
            </div>

            <div className="rounded-xl border border-gray-warm bg-white p-5 space-y-4">
              <SectionTitle>Service Area</SectionTitle>
              <div>
                <label className="mb-1 block font-ui text-xs text-gray-mid">Radius from Las Vegas (miles)</label>
                <input
                  type="number"
                  value={settings.serviceRadius ?? 50}
                  onChange={(e) => set("serviceRadius", parseInt(e.target.value) || 50)}
                  className="w-24 rounded-lg border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none focus:border-navy"
                />
              </div>
              <div>
                <p className="mb-2 font-ui text-xs text-gray-mid">Served Communities</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {COMMUNITIES.map((community) => (
                    <label key={community} className="flex cursor-pointer items-center gap-2">
                      <input type="checkbox" defaultChecked className="accent-navy" />
                      <span className="font-ui text-sm text-charcoal">{community}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button type="button" onClick={() => void save()} disabled={isSaving} className="rounded-lg bg-navy px-6 py-2.5 font-ui text-sm text-white transition hover:bg-navy/90 disabled:opacity-50">
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        )}

        {/* ── Social Accounts ──────────────────────────── */}
        {tab === "social" && (
          <div className="mt-6 space-y-6">
            <div className="rounded-xl border border-gray-warm bg-white p-5 space-y-4">
              <SectionTitle>Social Profile URLs</SectionTitle>
              <Field label="Instagram Handle" value={str(settings.instagramHandle)} onChange={(v) => set("instagramHandle", v)} placeholder="@sublimedesignnv" />
              <Field label="Facebook URL" value={str(settings.facebookUrl)} onChange={(v) => set("facebookUrl", v)} placeholder="https://facebook.com/sublimedesignnv" />
              <Field label="Pinterest URL" value={str(settings.pinterestUrl)} onChange={(v) => set("pinterestUrl", v)} placeholder="https://pinterest.com/sublimedesignnv" />
              <Field label="YouTube URL" value={str(settings.youtubeUrl)} onChange={(v) => set("youtubeUrl", v)} placeholder="https://youtube.com/@sublimedesignnv" />
            </div>

            <div className="rounded-xl border border-gray-warm bg-white p-5">
              <SectionTitle>API Connections</SectionTitle>
              <p className="mb-3 font-ui text-xs text-gray-mid">Connect accounts to enable posting. Managed in <a href="/admin/social?tab=settings" className="text-navy hover:text-red">Social → Settings</a>.</p>
              <div className="space-y-2">
                {[
                  { label: "Instagram", platform: "instagram" },
                  { label: "Facebook", platform: "facebook" },
                  { label: "Pinterest", platform: "pinterest" },
                  { label: "YouTube", platform: "youtube" },
                ].map(({ label, platform }) => (
                  <div key={platform} className="flex items-center justify-between rounded-lg border border-gray-warm px-4 py-3">
                    <span className="font-ui text-sm text-charcoal">{label}</span>
                    <a href="/admin/social?tab=settings" className="font-ui text-xs text-navy hover:text-red">Manage →</a>
                  </div>
                ))}
              </div>
            </div>

            <button type="button" onClick={() => void save()} disabled={isSaving} className="rounded-lg bg-navy px-6 py-2.5 font-ui text-sm text-white transition hover:bg-navy/90 disabled:opacity-50">
              {isSaving ? "Saving…" : "Save Profile URLs"}
            </button>
          </div>
        )}

        {/* ── Integrations ─────────────────────────────── */}
        {tab === "integrations" && (
          <div className="mt-6 space-y-6">
            <div className="space-y-3">
              <SectionTitle>Google</SectionTitle>
              <div className="rounded-xl border border-gray-warm bg-white p-5 space-y-4">
                <div>
                  <label className="mb-1 block font-ui text-xs text-gray-mid">Google Business Profile Location ID</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={str(settings.gbpLocationId)}
                      onChange={(e) => set("gbpLocationId", e.target.value)}
                      placeholder="accounts/123456789/locations/987654321"
                      className="flex-1 rounded-lg border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none focus:border-navy"
                    />
                    <button type="button" onClick={() => void save()} className="shrink-0 rounded-lg border border-gray-warm px-3 py-2 font-ui text-xs text-charcoal hover:border-navy">Save</button>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block font-ui text-xs text-gray-mid">Google Place ID (for reviews widget)</label>
                  <input
                    type="text"
                    value={str(settings.googlePlaceId)}
                    onChange={(e) => set("googlePlaceId", e.target.value)}
                    placeholder="ChIJ..."
                    className="w-full rounded-lg border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none focus:border-navy"
                  />
                </div>
              </div>

              <IntegrationRow
                label="Google Analytics"
                status={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? "configured" : "not-configured"}
                value={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? `Measurement ID: ${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-???"}` : undefined}
                placeholder="Set NEXT_PUBLIC_GA_MEASUREMENT_ID in Railway"
              />
              <IntegrationRow
                label="Google Search Console"
                status="not-configured"
                placeholder="Connect via Google OAuth to see keyword data"
              />
              <IntegrationRow
                label="Google Calendar"
                status="not-configured"
                placeholder="Connect to send booking links to leads"
              />
            </div>

            <div className="space-y-3">
              <SectionTitle>Email</SectionTitle>
              <IntegrationRow
                label="Resend (Transactional Email)"
                status={process.env.RESEND_API_KEY ? "configured" : "not-configured"}
                value={process.env.RESEND_API_KEY ? "API key set" : undefined}
                placeholder="Set RESEND_API_KEY in Railway"
              />
            </div>

            <div className="space-y-3">
              <SectionTitle>Media</SectionTitle>
              <IntegrationRow
                label="Cloudinary"
                status={process.env.CLOUDINARY_CLOUD_NAME ? "configured" : "not-configured"}
                value={process.env.CLOUDINARY_CLOUD_NAME ? `Cloud: ${process.env.CLOUDINARY_CLOUD_NAME}` : undefined}
                placeholder="Set CLOUDINARY_CLOUD_NAME in Railway"
              />
            </div>

            <button type="button" onClick={() => void save()} disabled={isSaving} className="rounded-lg bg-navy px-6 py-2.5 font-ui text-sm text-white transition hover:bg-navy/90 disabled:opacity-50">
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
