"use client";

import type { IntakeLead } from "@prisma/client";

type TimelineEvent = {
  label: string;
  date: Date | null;
  icon: string;
};

type Props = {
  lead: IntakeLead;
};

export default function CommunicationTab({ lead }: Props) {
  const timeline: TimelineEvent[] = [
    { label: "Lead created", date: lead.createdAt, icon: "✦" },
    {
      label: "Intake link sent",
      date: lead.status !== "NEW" ? lead.createdAt : null,
      icon: "📤",
    },
    {
      label: "Client opened intake",
      date:
        lead.status === "INTAKE_STARTED" ||
        lead.status === "INTAKE_COMPLETE" ||
        lead.status === "VISION_GENERATED" ||
        lead.status === "BID_READY" ||
        lead.status === "CONVERTED"
          ? lead.updatedAt
          : null,
      icon: "👁",
    },
    {
      label: "Intake submitted",
      date:
        lead.status === "INTAKE_COMPLETE" ||
        lead.status === "VISION_GENERATED" ||
        lead.status === "BID_READY" ||
        lead.status === "CONVERTED"
          ? lead.updatedAt
          : null,
      icon: "✅",
    },
    {
      label: "Vision generated",
      date: lead.status === "VISION_GENERATED" || lead.status === "BID_READY" || lead.status === "CONVERTED"
        ? lead.updatedAt
        : null,
      icon: "🎨",
    },
    {
      label: "Bid requested",
      date: lead.status === "BID_READY" || lead.status === "CONVERTED" ? lead.updatedAt : null,
      icon: "💼",
    },
  ].filter((e) => e.date !== null);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-ui font-semibold text-gray-mid uppercase tracking-wide mb-5">Activity Timeline</h3>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-warm" />
          <ul className="space-y-6 relative">
            {timeline.map((event, i) => (
              <li key={i} className="flex gap-4 items-start pl-10 relative">
                <div className="absolute left-0 w-8 h-8 rounded-full bg-white border-2 border-gray-warm flex items-center justify-center text-sm">
                  {event.icon}
                </div>
                <div>
                  <p className="font-ui font-semibold text-charcoal text-sm">{event.label}</p>
                  {event.date && (
                    <p className="text-gray-mid text-xs mt-0.5">
                      {event.date.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Contact info quick links */}
      <div className="bg-white rounded-xl border border-gray-warm p-6">
        <h3 className="text-sm font-ui font-semibold text-gray-mid uppercase tracking-wide mb-4">Quick Contact</h3>
        <div className="flex flex-wrap gap-3">
          {lead.phone && (
            <a
              href={`sms:${lead.phone}`}
              className="flex items-center gap-2 border border-gray-warm text-charcoal font-ui font-semibold px-4 py-2.5 rounded-lg hover:border-red hover:text-red text-sm transition-colors"
            >
              📱 Text {lead.firstName}
            </a>
          )}
          {lead.phone && (
            <a
              href={`tel:${lead.phone}`}
              className="flex items-center gap-2 border border-gray-warm text-charcoal font-ui font-semibold px-4 py-2.5 rounded-lg hover:border-red hover:text-red text-sm transition-colors"
            >
              📞 Call {lead.firstName}
            </a>
          )}
          {lead.email && (
            <a
              href={`mailto:${lead.email}?subject=Your ${lead.serviceType.replace(/_/g, " ")} Project — Sublime Design NV`}
              className="flex items-center gap-2 border border-gray-warm text-charcoal font-ui font-semibold px-4 py-2.5 rounded-lg hover:border-red hover:text-red text-sm transition-colors"
            >
              ✉️ Email {lead.firstName}
            </a>
          )}
        </div>
      </div>

      {/* Lead metadata */}
      <div className="bg-white rounded-xl border border-gray-warm p-6">
        <h3 className="text-sm font-ui font-semibold text-gray-mid uppercase tracking-wide mb-4">Lead Details</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex gap-3">
            <dt className="text-gray-mid w-32 flex-shrink-0">Lead ID</dt>
            <dd className="text-charcoal font-mono text-xs">{lead.id}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="text-gray-mid w-32 flex-shrink-0">Token</dt>
            <dd className="text-charcoal font-mono text-xs">{lead.token}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="text-gray-mid w-32 flex-shrink-0">Vision Status</dt>
            <dd className="text-charcoal">{lead.visionStatus}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
