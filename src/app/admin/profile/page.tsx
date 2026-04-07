import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/app/admin/_actions";
import { LogOut, User } from "lucide-react";

export const dynamic = "force-dynamic";

const BUSINESS = {
  name: "Sublime Design NV",
  phone: "702-847-9016",
  email: "info@sublimedesignnv.com",
  address: "6325 S Pecos Rd #14, Las Vegas NV 89120",
  licenses: "C3 #82320 / B2 #92234",
  website: "sublimedesignnv.com",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-warm bg-white">
      <div className="border-b border-gray-warm px-6 py-4">
        <h2 className="font-ui text-xs font-semibold uppercase tracking-[0.16em] text-gray-mid">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-4 py-1.5">
      <span className="w-28 shrink-0 font-ui text-xs text-gray-mid">{label}</span>
      <span className="font-ui text-sm text-charcoal">{value}</span>
    </div>
  );
}

export default async function AdminProfilePage() {
  const session = await requireAdmin("/admin/profile");
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = session!.user;

  const adminEmails = (process.env.ADMIN_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  return (
    <main className="bg-cream px-4 pb-16 pt-8 md:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mt-8 text-4xl text-charcoal">Profile</h1>

        <div className="mt-6 space-y-4">
          {/* Profile card */}
          <Section title="Your Account">
            <div className="flex items-center gap-4">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name ?? "Admin"}
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy/10">
                  <User className="h-7 w-7 text-navy/60" />
                </div>
              )}
              <div className="min-w-0">
                {user?.name ? (
                  <p className="font-ui text-base font-semibold text-charcoal">{user.name}</p>
                ) : null}
                {user?.email ? (
                  <p className="font-ui text-sm text-gray-mid">{user.email}</p>
                ) : null}
                <p className="mt-0.5 font-ui text-xs uppercase tracking-[0.14em] text-navy">Admin</p>
              </div>
            </div>
          </Section>

          {/* Business info */}
          <Section title="Business Info">
            <div className="divide-y divide-gray-warm/60">
              <Row label="Company" value={BUSINESS.name} />
              <Row label="Phone" value={BUSINESS.phone} />
              <Row label="Email" value={BUSINESS.email} />
              <Row label="Address" value={BUSINESS.address} />
              <Row label="License" value={BUSINESS.licenses} />
              <Row label="Website" value={BUSINESS.website} />
            </div>
            <div className="mt-4">
              <a
                href="#"
                className="inline-block rounded-sm border border-gray-warm px-4 py-2 font-ui text-xs text-gray-mid transition hover:border-navy hover:text-navy"
              >
                Edit Business Info
              </a>
            </div>
          </Section>

          {/* Notifications */}
          <Section title="Notifications">
            <div className="space-y-3">
              {[
                { id: "new-lead", label: "Email me when a new lead comes in", defaultChecked: true },
                { id: "stale-lead", label: "Email me when a lead goes stale (3+ days)", defaultChecked: true },
                { id: "daily-digest", label: "Daily digest of site activity", defaultChecked: false },
                { id: "weekly-analytics", label: "Weekly analytics summary", defaultChecked: false },
              ].map(({ id, label, defaultChecked }) => (
                <label key={id} className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    defaultChecked={defaultChecked}
                    className="h-4 w-4 rounded border-gray-warm accent-navy"
                  />
                  <span className="font-ui text-sm text-charcoal">{label}</span>
                </label>
              ))}
            </div>
            <p className="mt-3 font-ui text-xs text-gray-mid">Notification wiring coming soon — preferences saved locally for now.</p>
          </Section>

          {/* Admin access */}
          <Section title="Admin Access">
            <p className="mb-3 font-ui text-xs text-gray-mid">
              These emails are allowed to sign in to the admin panel. Managed via the{" "}
              <code className="rounded bg-gray-100 px-1 font-mono text-[11px]">ADMIN_ALLOWED_EMAILS</code>{" "}
              environment variable.
            </p>
            <div className="space-y-2">
              {adminEmails.map((email) => (
                <div key={email} className="flex items-center justify-between rounded-lg border border-gray-warm bg-gray-50 px-4 py-2.5">
                  <span className="font-ui text-sm text-charcoal">{email}</span>
                  {email === user?.email ? (
                    <span className="font-ui text-[10px] uppercase tracking-[0.14em] text-navy">you</span>
                  ) : (
                    <span className="font-ui text-xs text-gray-mid">admin</span>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-3 font-ui text-xs text-gray-mid">
              To add or remove admins, update <code className="rounded bg-gray-100 px-1 font-mono text-[11px]">ADMIN_ALLOWED_EMAILS</code> in your Railway environment variables.
            </p>
          </Section>

          {/* Danger zone */}
          <Section title="Danger Zone">
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-sm border border-red/30 px-4 py-2 font-ui text-sm text-red transition hover:border-red hover:bg-red/5"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </form>
          </Section>
        </div>
      </div>
    </main>
  );
}
