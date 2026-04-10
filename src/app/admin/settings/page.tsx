"use client";

import { useCallback, useEffect, useState } from "react";
import LicensesManager from "@/components/admin/LicensesManager";

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
  primaryTrade: string | null;
  secondaryTrade: string | null;
  brandPrimary: string;
  brandSecondary: string;
  heroHeadline: string | null;
  heroSubheadline: string | null;
  heroCtaLabel: string | null;
  cloudinaryFolder: string;
  cloudinaryQuality: string;
  cloudinaryMaxSizeMB: number;
  emailFromName: string;
  emailFromAddress: string;
  emailReplyTo: string;
  emailNotifyAddresses: string[];
  notifyNewLead: boolean;
  notifyStaleLead: boolean;
  notifyIntakeComplete: boolean;
  notifyKioskSubmit: boolean;
  notifyDailyDigest: boolean;
  notifyWeeklyDigest: boolean;
  notifySmsIntakeLink: boolean;
  notifySmsKiosk: boolean;
  showAddress: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showHours: boolean;
  showLicenseNumbers: boolean;
  showServiceArea: boolean;
  showSocialLinks: boolean;
};

type Tab = "business" | "hours" | "social" | "appearance" | "integrations";

const TABS: { id: Tab; label: string }[] = [
  { id: "business", label: "Business Info" },
  { id: "hours", label: "Hours & Service Area" },
  { id: "social", label: "Social Accounts" },
  { id: "appearance", label: "Appearance" },
  { id: "integrations", label: "Integrations" },
];

const COMMUNITIES = [
  "Las Vegas", "Henderson", "Summerlin", "North Las Vegas",
  "Lake Las Vegas", "Green Valley Ranch", "Anthem", "Rhodes Ranch",
  "Seven Hills", "Aliante", "Centennial Hills", "Silverado Ranch",
];

const TRADE_OPTIONS = [
  "Finish Carpentry",
  "Custom Woodwork",
  "General Contractor",
  "Framing",
  "Cabinet Installation",
  "Roofing",
  "Plumbing",
  "Electrical",
  "HVAC",
  "Flooring",
  "Tile",
  "Painting",
  "Landscaping",
  "Concrete",
  "Other",
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

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-1 block font-ui text-xs text-gray-mid">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-lg border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none focus:border-navy resize-none"
      />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 font-ui text-xs font-semibold uppercase tracking-[0.16em] text-gray-mid">{children}</p>;
}

function Toggle({
  checked,
  onChange,
  title,
}: {
  checked: boolean;
  onChange: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      title={title ?? (checked ? "Visible on site" : "Hidden from site")}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none ${
        checked ? "bg-green-500" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function VisibilityHint({ visible }: { visible: boolean }) {
  if (visible) return null;
  return (
    <p className="mt-1 font-ui text-xs text-amber-600">
      ⚠ Hidden — not shown on the public website
    </p>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
  children,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <Toggle checked={checked} onChange={onChange} />
        <span className="font-ui text-xs text-gray-mid">{label}</span>
      </div>
      <div className="mt-2 pl-12">{children}</div>
      <div className="pl-12">
        <VisibilityHint visible={checked} />
      </div>
    </div>
  );
}


function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block font-ui text-xs text-gray-mid">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded border border-gray-warm bg-white p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#CC2027"
          className="w-32 rounded-lg border border-gray-warm bg-white px-3 py-2 font-mono text-sm text-charcoal outline-none focus:border-navy"
        />
        <span className="h-7 w-7 rounded border border-gray-warm" style={{ backgroundColor: value }} />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("business");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testEmailStatus, setTestEmailStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [newNotifyAddr, setNewNotifyAddr] = useState("");

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
        <div className="mt-6 flex gap-1 overflow-x-auto border-b border-gray-warm">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`shrink-0 px-4 py-2.5 font-ui text-sm transition-colors ${tab === id ? "border-b-2 border-navy text-navy -mb-px" : "text-gray-mid hover:text-charcoal"}`}
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
              <ToggleRow label="Show phone on site" checked={settings.showPhone} onChange={() => set("showPhone", !settings.showPhone)}>
                <Field label="Phone" value={str(settings.phone)} onChange={(v) => set("phone", v)} type="tel" placeholder="702-847-9016" />
              </ToggleRow>
              <ToggleRow label="Show email on site" checked={settings.showEmail} onChange={() => set("showEmail", !settings.showEmail)}>
                <Field label="Email" value={str(settings.email)} onChange={(v) => set("email", v)} type="email" />
              </ToggleRow>
              <Field label="Website" value={str(settings.website)} onChange={(v) => set("website", v)} placeholder="https://sublimedesignnv.com" />
            </div>

            <div className="rounded-xl border border-gray-warm bg-white p-5 space-y-4">
              <SectionTitle>Trade / Service Type</SectionTitle>
              <div>
                <label className="mb-1 block font-ui text-xs text-gray-mid">Primary Trade</label>
                <input
                  list="trade-options"
                  value={str(settings.primaryTrade)}
                  onChange={(e) => set("primaryTrade", e.target.value)}
                  placeholder="Finish Carpentry"
                  className="w-full rounded-lg border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none focus:border-navy"
                />
                <datalist id="trade-options">
                  {TRADE_OPTIONS.map((t) => <option key={t} value={t} />)}
                </datalist>
              </div>
              <div>
                <label className="mb-1 block font-ui text-xs text-gray-mid">Secondary Trade (optional)</label>
                <input
                  list="trade-options"
                  value={str(settings.secondaryTrade)}
                  onChange={(e) => set("secondaryTrade", e.target.value)}
                  placeholder="Cabinet Installation"
                  className="w-full rounded-lg border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none focus:border-navy"
                />
              </div>
              <p className="font-ui text-xs text-gray-mid">Used to tailor AI caption generation and schema type.</p>
            </div>

            <div className="rounded-xl border border-gray-warm bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <SectionTitle>Address</SectionTitle>
                <div className="mb-3 flex items-center gap-2">
                  <Toggle checked={settings.showAddress} onChange={() => set("showAddress", !settings.showAddress)} />
                  <span className="font-ui text-xs text-gray-mid">Show on site</span>
                </div>
              </div>
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
              <VisibilityHint visible={settings.showAddress} />
            </div>

            <LicensesManager
              showLicensesOnSite={settings.showLicenseNumbers}
              onToggleSection={() => set("showLicenseNumbers", !settings.showLicenseNumbers)}
            />

            <button type="button" onClick={() => void save()} disabled={isSaving} className="rounded-lg bg-navy px-6 py-2.5 font-ui text-sm text-white transition hover:bg-navy/90 disabled:opacity-50">
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        )}

        {/* ── Hours & Service Area ──────────────────────── */}
        {tab === "hours" && (
          <div className="mt-6 space-y-6">
            <div className="rounded-xl border border-gray-warm bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <SectionTitle>Business Hours</SectionTitle>
                <div className="mb-3 flex items-center gap-2">
                  <Toggle checked={settings.showHours} onChange={() => set("showHours", !settings.showHours)} />
                  <span className="font-ui text-xs text-gray-mid">Show on site</span>
                </div>
              </div>
              <Field label="Monday – Friday" value={str(settings.hoursMonFri)} onChange={(v) => set("hoursMonFri", v)} placeholder="7:00 AM – 6:00 PM" />
              <Field label="Saturday" value={str(settings.hoursSat)} onChange={(v) => set("hoursSat", v)} placeholder="By Appointment" />
              <Field label="Sunday" value={str(settings.hoursSun)} onChange={(v) => set("hoursSun", v)} placeholder="Closed" />
              <VisibilityHint visible={settings.showHours} />
            </div>

            <div className="rounded-xl border border-gray-warm bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <SectionTitle>Service Area</SectionTitle>
                <div className="mb-3 flex items-center gap-2">
                  <Toggle checked={settings.showServiceArea} onChange={() => set("showServiceArea", !settings.showServiceArea)} />
                  <span className="font-ui text-xs text-gray-mid">Show on site</span>
                </div>
              </div>
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
              <VisibilityHint visible={settings.showServiceArea} />
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
              <div className="flex items-center justify-between">
                <SectionTitle>Social Profile URLs</SectionTitle>
                <div className="mb-3 flex items-center gap-2">
                  <Toggle checked={settings.showSocialLinks} onChange={() => set("showSocialLinks", !settings.showSocialLinks)} />
                  <span className="font-ui text-xs text-gray-mid">Show on site</span>
                </div>
              </div>
              <Field label="Instagram Handle" value={str(settings.instagramHandle)} onChange={(v) => set("instagramHandle", v)} placeholder="@sublimedesignnv" />
              <Field label="Facebook URL" value={str(settings.facebookUrl)} onChange={(v) => set("facebookUrl", v)} placeholder="https://facebook.com/sublimedesignnv" />
              <Field label="Pinterest URL" value={str(settings.pinterestUrl)} onChange={(v) => set("pinterestUrl", v)} placeholder="https://pinterest.com/sublimedesignnv" />
              <Field label="YouTube URL" value={str(settings.youtubeUrl)} onChange={(v) => set("youtubeUrl", v)} placeholder="https://youtube.com/@sublimedesignnv" />
              <VisibilityHint visible={settings.showSocialLinks} />
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

        {/* ── Appearance ───────────────────────────────── */}
        {tab === "appearance" && (
          <div className="mt-6 space-y-6">
            <div className="rounded-xl border border-gray-warm bg-white p-5 space-y-5">
              <SectionTitle>Hero Section</SectionTitle>
              <Field
                label="Headline"
                value={str(settings.heroHeadline)}
                onChange={(v) => set("heroHeadline", v)}
                placeholder="Premium Finish Carpentry for the Signature Spaces"
              />
              <TextArea
                label="Subheadline"
                value={str(settings.heroSubheadline)}
                onChange={(v) => set("heroSubheadline", v)}
                placeholder="Floating shelves, media walls, faux beams, barn doors, mantels, cabinets, and trim upgrades designed, built, and installed in Las Vegas Valley."
                rows={3}
              />
              <Field
                label="CTA Button Label"
                value={str(settings.heroCtaLabel)}
                onChange={(v) => set("heroCtaLabel", v)}
                placeholder="Start with a Quote"
              />
              <p className="font-ui text-xs text-gray-mid">Changes take effect immediately — no redeploy needed.</p>
            </div>

            <div className="rounded-xl border border-gray-warm bg-white p-5 space-y-5">
              <SectionTitle>Brand Colors</SectionTitle>
              <ColorField
                label="Primary (buttons, accents)"
                value={settings.brandPrimary}
                onChange={(v) => set("brandPrimary", v)}
              />
              <ColorField
                label="Secondary (navy, headers)"
                value={settings.brandSecondary}
                onChange={(v) => set("brandSecondary", v)}
              />
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="font-ui text-xs text-amber-700">
                  ⚠ Brand color changes are stored in the database and will be applied after the next deploy. Redeploy in Railway to activate new colors.
                </p>
              </div>
            </div>

            <button type="button" onClick={() => void save()} disabled={isSaving} className="rounded-lg bg-navy px-6 py-2.5 font-ui text-sm text-white transition hover:bg-navy/90 disabled:opacity-50">
              {isSaving ? "Saving…" : "Save Appearance"}
            </button>
          </div>
        )}

        {/* ── Integrations ─────────────────────────────── */}
        {tab === "integrations" && (
          <div className="mt-6 space-y-8">

            {/* ── Cloudinary ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <SectionTitle>Media Storage (Cloudinary)</SectionTitle>
                <span className={`rounded-full border px-2.5 py-0.5 font-ui text-[10px] uppercase tracking-[0.14em] ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME ? "border-green-200 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-400"}`}>
                  {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME ? "✓ Configured" : "Not configured"}
                </span>
              </div>

              <div className="rounded-xl border border-gray-warm bg-white p-5 space-y-4">
                {(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME) && (
                  <div className="flex items-center gap-6 border-b border-gray-warm pb-4">
                    <div>
                      <p className="font-ui text-xs text-gray-mid">Cloud</p>
                      <p className="font-ui text-sm font-medium text-charcoal">{process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME}</p>
                    </div>
                  </div>
                )}
                <SectionTitle>Upload Settings</SectionTitle>
                <Field label="Default Folder" value={str(settings.cloudinaryFolder)} onChange={(v) => set("cloudinaryFolder", v)} placeholder="Sublime/Portfolio/" />
                <div>
                  <label className="mb-1 block font-ui text-xs text-gray-mid">Image Quality</label>
                  <select
                    value={settings.cloudinaryQuality}
                    onChange={(e) => set("cloudinaryQuality", e.target.value)}
                    className="w-full rounded-lg border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none focus:border-navy"
                  >
                    <option value="auto">Auto (recommended)</option>
                    <option value="auto:best">Auto: Best</option>
                    <option value="auto:good">Auto: Good</option>
                    <option value="80">80 (High)</option>
                    <option value="60">60 (Medium)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-ui text-xs text-gray-mid">Max Upload Size</label>
                  <select
                    value={settings.cloudinaryMaxSizeMB}
                    onChange={(e) => set("cloudinaryMaxSizeMB", parseInt(e.target.value))}
                    className="w-full rounded-lg border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none focus:border-navy"
                  >
                    {[5, 10, 15, 25, 50, 100].map((n) => (
                      <option key={n} value={n}>{n} MB</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-gray-warm bg-white p-5">
                <SectionTitle>Quick Links</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Open Media Library", href: "https://console.cloudinary.com/pm/media-library" },
                    { label: "View Usage", href: "https://console.cloudinary.com/pm/developer-dashboard" },
                    { label: "API Credentials", href: "https://console.cloudinary.com/pm/settings/api-keys" },
                    { label: "Documentation", href: "https://cloudinary.com/documentation" },
                  ].map(({ label, href }) => (
                    <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-gray-warm px-3 py-1.5 font-ui text-xs text-navy hover:border-navy">
                      {label} →
                    </a>
                  ))}
                </div>
                <p className="mt-3 font-ui text-xs text-gray-mid">API credentials are managed via Railway environment variables and are never exposed here.</p>
              </div>
            </div>

            {/* ── Resend ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <SectionTitle>Transactional Email (Resend)</SectionTitle>
                <span className={`rounded-full border px-2.5 py-0.5 font-ui text-[10px] uppercase tracking-[0.14em] ${process.env.RESEND_API_KEY ? "border-green-200 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-400"}`}>
                  {process.env.RESEND_API_KEY ? "✓ Configured" : "Not configured"}
                </span>
              </div>

              <div className="rounded-xl border border-gray-warm bg-white p-5 space-y-4">
                <SectionTitle>Email Settings</SectionTitle>
                <Field label="From Name" value={str(settings.emailFromName)} onChange={(v) => set("emailFromName", v)} placeholder="Sublime Design NV" />
                <Field label="From Email" value={str(settings.emailFromAddress)} onChange={(v) => set("emailFromAddress", v)} type="email" placeholder="info@sublimedesignnv.com" />
                <Field label="Reply-To" value={str(settings.emailReplyTo)} onChange={(v) => set("emailReplyTo", v)} type="email" placeholder="info@sublimedesignnv.com" />
              </div>

              <div className="rounded-xl border border-gray-warm bg-white p-5 space-y-4">
                <SectionTitle>Lead Notification Recipients</SectionTitle>
                <div className="space-y-2">
                  {settings.emailNotifyAddresses.map((addr, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="flex-1 rounded-lg border border-gray-warm bg-gray-50 px-3 py-2 font-ui text-sm text-charcoal">{addr}</span>
                      <button
                        type="button"
                        onClick={() => set("emailNotifyAddresses", settings.emailNotifyAddresses.filter((_, j) => j !== i))}
                        className="font-ui text-xs text-gray-mid hover:text-red-500"
                        disabled={settings.emailNotifyAddresses.length <= 1}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newNotifyAddr}
                    onChange={(e) => setNewNotifyAddr(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newNotifyAddr.includes("@")) {
                        set("emailNotifyAddresses", [...settings.emailNotifyAddresses, newNotifyAddr.trim()]);
                        setNewNotifyAddr("");
                      }
                    }}
                    placeholder="Add email address"
                    className="flex-1 rounded-lg border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none focus:border-navy"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newNotifyAddr.includes("@")) {
                        set("emailNotifyAddresses", [...settings.emailNotifyAddresses, newNotifyAddr.trim()]);
                        setNewNotifyAddr("");
                      }
                    }}
                    className="rounded-lg border border-gray-warm px-3 py-2 font-ui text-xs text-charcoal hover:border-navy"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-gray-warm bg-white p-5 space-y-3">
                <SectionTitle>Notification Events</SectionTitle>
                {([
                  { key: "notifyNewLead", label: "New quote request received" },
                  { key: "notifyStaleLead", label: "Lead marked as stale (3+ days no contact)" },
                  { key: "notifyIntakeComplete", label: "Client intake completed" },
                  { key: "notifyKioskSubmit", label: "Kiosk form submitted" },
                  { key: "notifyDailyDigest", label: "Daily lead summary" },
                  { key: "notifyWeeklyDigest", label: "Weekly analytics digest" },
                ] as { key: keyof Settings; label: string }[]).map(({ key, label }) => (
                  <label key={key} className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings[key] as boolean}
                      onChange={() => set(key, !settings[key])}
                      className="h-4 w-4 rounded border-gray-warm accent-navy"
                    />
                    <span className="font-ui text-sm text-charcoal">{label}</span>
                  </label>
                ))}
              </div>

              <div className="rounded-xl border border-gray-warm bg-white p-5 space-y-3">
                <SectionTitle>Quick Links</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Email Dashboard", href: "https://resend.com/emails" },
                    { label: "Domain Settings", href: "https://resend.com/domains" },
                    { label: "API Keys", href: "https://resend.com/api-keys" },
                    { label: "Analytics", href: "https://resend.com/analytics" },
                  ].map(({ label, href }) => (
                    <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-gray-warm px-3 py-1.5 font-ui text-xs text-navy hover:border-navy">
                      {label} →
                    </a>
                  ))}
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={testEmailStatus === "sending" || !process.env.RESEND_API_KEY}
                    onClick={async () => {
                      setTestEmailStatus("sending");
                      try {
                        const res = await fetch("/api/admin/settings/test-email", { method: "POST" });
                        setTestEmailStatus(res.ok ? "ok" : "error");
                        setTimeout(() => setTestEmailStatus("idle"), 4000);
                      } catch { setTestEmailStatus("error"); setTimeout(() => setTestEmailStatus("idle"), 4000); }
                    }}
                    className="rounded-lg border border-gray-warm px-4 py-2 font-ui text-sm text-charcoal hover:border-navy disabled:opacity-40"
                  >
                    {testEmailStatus === "sending" ? "Sending…" : testEmailStatus === "ok" ? "✓ Sent!" : testEmailStatus === "error" ? "✗ Failed" : "Send Test Email"}
                  </button>
                  {!process.env.RESEND_API_KEY && <p className="mt-1.5 font-ui text-xs text-gray-mid">Set RESEND_API_KEY in Railway to enable.</p>}
                </div>
              </div>
            </div>

            {/* ── Twilio ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <SectionTitle>SMS (Twilio)</SectionTitle>
                <span className={`rounded-full border px-2.5 py-0.5 font-ui text-[10px] uppercase tracking-[0.14em] ${process.env.TWILIO_ACCOUNT_SID ? "border-green-200 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-400"}`}>
                  {process.env.TWILIO_ACCOUNT_SID ? "✓ Configured" : "Not configured"}
                </span>
              </div>

              <div className="rounded-xl border border-gray-warm bg-white p-5 space-y-3">
                {process.env.TWILIO_PHONE_NUMBER && (
                  <div className="flex items-center gap-6 border-b border-gray-warm pb-4">
                    <div>
                      <p className="font-ui text-xs text-gray-mid">From Number</p>
                      <p className="font-ui text-sm font-medium text-charcoal">{process.env.TWILIO_PHONE_NUMBER}</p>
                    </div>
                  </div>
                )}
                <SectionTitle>Send SMS For</SectionTitle>
                {([
                  { key: "notifySmsIntakeLink", label: "New intake form link (send to client)" },
                  { key: "notifySmsKiosk", label: "Kiosk form completion" },
                ] as { key: keyof Settings; label: string }[]).map(({ key, label }) => (
                  <label key={key} className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings[key] as boolean}
                      onChange={() => set(key, !settings[key])}
                      className="h-4 w-4 rounded border-gray-warm accent-navy"
                    />
                    <span className="font-ui text-sm text-charcoal">{label}</span>
                  </label>
                ))}
              </div>

              <div className="rounded-xl border border-gray-warm bg-white p-5 space-y-3">
                <SectionTitle>Quick Links</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Twilio Console", href: "https://console.twilio.com" },
                    { label: "Message Logs", href: "https://console.twilio.com/us1/monitor/logs/sms" },
                    { label: "API Credentials", href: "https://console.twilio.com/us1/account/keys-credentials/api-keys" },
                  ].map(({ label, href }) => (
                    <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-gray-warm px-3 py-1.5 font-ui text-xs text-navy hover:border-navy">
                      {label} →
                    </a>
                  ))}
                </div>
                <p className="font-ui text-xs text-gray-mid">Credentials managed via Railway. <a href="https://railway.app" target="_blank" rel="noopener noreferrer" className="text-navy hover:underline">Open Railway →</a></p>
              </div>
            </div>

            {/* ── Google ── */}
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

              {[
                { label: "Google Analytics", configured: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, value: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? `Measurement ID: ${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}` : undefined, placeholder: "Set NEXT_PUBLIC_GA_MEASUREMENT_ID in Railway", links: [{ label: "Analytics Dashboard", href: "https://analytics.google.com" }] },
                { label: "Google Search Console", configured: false, placeholder: "Connect via Google OAuth to see keyword data", links: [{ label: "Search Console", href: "https://search.google.com/search-console" }] },
                { label: "Google Calendar", configured: false, placeholder: "Connect to send booking links to leads", links: [{ label: "Google Calendar", href: "https://calendar.google.com" }] },
              ].map(({ label, configured, value, placeholder, links }) => (
                <div key={label} className="rounded-lg border border-gray-warm bg-white px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-ui text-sm font-medium text-charcoal">{label}</p>
                      {value ? <p className="font-ui text-xs text-gray-mid">{value}</p> : placeholder ? <p className="font-ui text-xs text-gray-mid">{placeholder}</p> : null}
                    </div>
                    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 font-ui text-[10px] uppercase tracking-[0.14em] ${configured ? "border-green-200 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-400"}`}>
                      {configured ? "✓ Configured" : "Not configured"}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {links.map(({ label: ll, href }) => (
                      <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="font-ui text-xs text-navy hover:underline">{ll} →</a>
                    ))}
                  </div>
                </div>
              ))}
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
