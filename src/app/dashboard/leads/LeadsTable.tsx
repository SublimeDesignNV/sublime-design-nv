"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, MessageSquare, Trash2 } from "lucide-react";
import type { IntakeLeadStatus } from "@prisma/client";

const STATUS_LABELS: Record<IntakeLeadStatus, string> = {
  NEW: "New",
  INTAKE_SENT: "Intake Sent",
  INTAKE_STARTED: "Started",
  INTAKE_COMPLETE: "Complete",
  VISION_GENERATED: "Vision Ready",
  BID_READY: "Bid Ready",
  CONVERTED: "Converted",
  CLOSED: "Closed",
};

const STATUS_COLORS: Record<IntakeLeadStatus, string> = {
  NEW: "bg-gray-warm text-charcoal",
  INTAKE_SENT: "bg-blue-50 text-blue-700",
  INTAKE_STARTED: "bg-yellow-50 text-yellow-700",
  INTAKE_COMPLETE: "bg-indigo-50 text-indigo-700",
  VISION_GENERATED: "bg-purple-50 text-purple-700",
  BID_READY: "bg-green-50 text-green-700",
  CONVERTED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-500",
};

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

type Lead = {
  id: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  serviceType: string;
  status: IntakeLeadStatus;
  createdAt: Date;
  _count: { assets: number };
};

export default function LeadsTable({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function deleteLead(id: string) {
    const confirmed = window.confirm("Delete this lead? This cannot be undone.");
    if (!confirmed) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/intake-leads/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-16 text-gray-mid">
        <p className="text-xl mb-4">No leads yet.</p>
        <Link href="/dashboard/leads/new" className="text-red font-ui font-semibold hover:underline">
          Send your first intake link →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-warm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-warm bg-gray-warm/40">
            <th className="text-left px-5 py-3 text-xs font-ui font-semibold text-gray-mid uppercase tracking-wide">Name</th>
            <th className="text-left px-5 py-3 text-xs font-ui font-semibold text-gray-mid uppercase tracking-wide hidden sm:table-cell">Service</th>
            <th className="text-left px-5 py-3 text-xs font-ui font-semibold text-gray-mid uppercase tracking-wide">Status</th>
            <th className="text-left px-5 py-3 text-xs font-ui font-semibold text-gray-mid uppercase tracking-wide hidden md:table-cell">Created</th>
            <th className="text-left px-5 py-3 text-xs font-ui font-semibold text-gray-mid uppercase tracking-wide hidden md:table-cell">Assets</th>
            <th className="px-3 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-warm">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-warm/20 transition-colors relative">
              <td className="px-5 py-4">
                <Link
                  href={`/dashboard/leads/${lead.id}`}
                  className="font-ui font-semibold text-charcoal after:absolute after:inset-0"
                >
                  {lead.firstName} {lead.lastName ?? ""}
                </Link>
                {lead.phone && (
                  <p className="text-xs text-gray-mid mt-0.5">{lead.phone}</p>
                )}
              </td>
              <td className="px-5 py-4 hidden sm:table-cell">
                <span className="text-sm text-charcoal">{SERVICE_LABELS[lead.serviceType] ?? lead.serviceType}</span>
              </td>
              <td className="px-5 py-4">
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-ui font-semibold ${STATUS_COLORS[lead.status]}`}>
                  {STATUS_LABELS[lead.status]}
                </span>
              </td>
              <td className="px-5 py-4 hidden md:table-cell">
                <span className="text-sm text-gray-mid">
                  {lead.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </td>
              <td className="px-5 py-4 hidden md:table-cell">
                <span className="text-sm text-gray-mid">{lead._count.assets}</span>
              </td>
              <td className="px-3 py-4">
                <div className="relative z-10 flex items-center gap-1">
                  {lead.phone && (
                    <a
                      href={`tel:${lead.phone}`}
                      title="Call"
                      className="p-1.5 rounded-lg text-gray-mid hover:text-navy hover:bg-gray-warm transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  {lead.phone && (
                    <a
                      href={`sms:${lead.phone}`}
                      title="Text"
                      className="p-1.5 rounded-lg text-gray-mid hover:text-navy hover:bg-gray-warm transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => void deleteLead(lead.id)}
                    disabled={deletingId === lead.id}
                    title="Delete"
                    className="p-1.5 rounded-lg text-gray-mid hover:text-red hover:bg-red/10 transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
