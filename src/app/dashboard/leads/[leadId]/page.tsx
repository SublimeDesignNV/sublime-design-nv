import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { SITE } from "@/lib/constants";
import LeadDetailClient from "./LeadDetailClient";

export const dynamic = "force-dynamic";

const SERVICE_LABELS: Record<string, string> = {
  BARN_DOORS: "Barn Doors",
  CABINETS: "Cabinets",
  CUSTOM_CLOSETS: "Custom Closets",
  FAUX_BEAMS: "Faux Beams",
  FLOATING_SHELVES: "Floating Shelves",
  MANTELS: "Mantels",
  TRIM_WORK: "Trim Work",
  MULTIPLE: "Multiple",
  OTHER: "Other",
};

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-gray-warm text-charcoal",
  INTAKE_SENT: "bg-blue-50 text-blue-700",
  INTAKE_STARTED: "bg-yellow-50 text-yellow-700",
  INTAKE_COMPLETE: "bg-indigo-50 text-indigo-700",
  VISION_GENERATED: "bg-purple-50 text-purple-700",
  BID_READY: "bg-green-50 text-green-700",
  CONVERTED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  INTAKE_SENT: "Intake Sent",
  INTAKE_STARTED: "Started",
  INTAKE_COMPLETE: "Complete",
  VISION_GENERATED: "Vision Ready",
  BID_READY: "Bid Ready",
  CONVERTED: "Converted",
  CLOSED: "Closed",
};

type Props = {
  params: Promise<{ leadId: string }>;
};

export default async function LeadDetailPage({ params }: Props) {
  await requireAdmin("/dashboard/leads");

  const { leadId } = await params;

  const lead = await db.intakeLead.findUnique({
    where: { id: leadId },
    include: { assets: { orderBy: { createdAt: "asc" } } },
  });

  if (!lead) notFound();

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    SITE.url;
  const intakeUrl = `${baseUrl}/intake/${lead.token}`;

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-navy text-white px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/dashboard/leads" className="text-white/60 hover:text-white text-sm">
              ← All Leads
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div>
              <h1 className="font-display text-3xl">
                {lead.firstName} {lead.lastName ?? ""}
              </h1>
              <p className="text-white/70 text-sm mt-1">
                {SERVICE_LABELS[lead.serviceType] ?? lead.serviceType}
                {lead.phone && ` · ${lead.phone}`}
              </p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-sm font-ui font-semibold ${STATUS_COLORS[lead.status] ?? "bg-gray-warm text-charcoal"}`}>
              {STATUS_LABELS[lead.status] ?? lead.status}
            </span>
          </div>
        </div>
      </div>

      <LeadDetailClient lead={lead} intakeUrl={intakeUrl} />
    </div>
  );
}
