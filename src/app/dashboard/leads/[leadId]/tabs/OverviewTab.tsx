"use client";

import { useState } from "react";
import type { IntakeLead, IntakeLeadStatus } from "@prisma/client";

const STATUS_OPTIONS: IntakeLeadStatus[] = [
  "NEW",
  "INTAKE_SENT",
  "INTAKE_STARTED",
  "INTAKE_COMPLETE",
  "VISION_GENERATED",
  "BID_READY",
  "CONVERTED",
  "CLOSED",
];

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

type IntakeData = {
  space?: string;
  styles?: string[];
  budget?: string;
  timeline?: string;
  finalNotes?: string;
  dontWant?: string;
  howHeard?: string;
};

type Props = {
  lead: IntakeLead;
  intakeUrl: string;
};

export default function OverviewTab({ lead, intakeUrl }: Props) {
  const [status, setStatus] = useState<IntakeLeadStatus>(lead.status);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const intake = (lead.intakeData ?? {}) as IntakeData;

  async function updateStatus(newStatus: IntakeLeadStatus) {
    setSaving(true);
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setStatus(newStatus);
    } finally {
      setSaving(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(intakeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const statusTimeline: IntakeLeadStatus[] = [
    "INTAKE_SENT",
    "INTAKE_STARTED",
    "INTAKE_COMPLETE",
    "VISION_GENERATED",
    "BID_READY",
  ];

  const currentIdx = statusTimeline.indexOf(status);

  return (
    <div className="space-y-8">
      {/* Status timeline */}
      <div className="bg-white rounded-xl border border-gray-warm p-6">
        <h3 className="text-sm font-ui font-semibold text-gray-mid uppercase tracking-wide mb-5">Progress</h3>
        <div className="flex items-center gap-0">
          {statusTimeline.map((s, i) => {
            const isComplete = statusTimeline.indexOf(status) >= i;
            const isActive = status === s;
            return (
              <div key={s} className="flex-1 flex flex-col items-center">
                <div className="flex items-center w-full">
                  <div
                    className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold transition-colors ${
                      isComplete ? "bg-red text-white" : "bg-gray-warm text-gray-mid"
                    }`}
                  >
                    {isComplete ? "✓" : i + 1}
                  </div>
                  {i < statusTimeline.length - 1 && (
                    <div className={`flex-1 h-0.5 ${statusTimeline.indexOf(status) > i ? "bg-red" : "bg-gray-warm"}`} />
                  )}
                </div>
                <span className={`text-xs mt-2 font-ui text-center leading-tight ${isActive ? "text-red font-semibold" : "text-gray-mid"}`}>
                  {STATUS_LABELS[s]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact info */}
        <div className="bg-white rounded-xl border border-gray-warm p-6 space-y-3">
          <h3 className="text-sm font-ui font-semibold text-gray-mid uppercase tracking-wide">Contact</h3>
          <div className="space-y-2">
            <p className="font-ui font-semibold text-charcoal text-lg">{lead.firstName} {lead.lastName}</p>
            {lead.phone && (
              <a href={`tel:${lead.phone}`} className="block text-red hover:underline text-sm">{lead.phone}</a>
            )}
            {lead.email && (
              <a href={`mailto:${lead.email}`} className="block text-red hover:underline text-sm">{lead.email}</a>
            )}
            <p className="text-sm text-gray-mid">
              Service: <span className="text-charcoal font-semibold">{SERVICE_LABELS[lead.serviceType] ?? lead.serviceType}</span>
            </p>
            <p className="text-sm text-gray-mid">
              Created: {lead.createdAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl border border-gray-warm p-6 space-y-4">
          <h3 className="text-sm font-ui font-semibold text-gray-mid uppercase tracking-wide">Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => void copyLink()}
              className="w-full border border-gray-warm text-charcoal font-ui font-semibold py-2.5 px-4 rounded-lg hover:border-red hover:text-red text-sm transition-colors text-left"
            >
              {copied ? "✓ Copied!" : "📋 Copy intake link"}
            </button>
            {lead.visionStatus === "COMPLETE" && (
              <a
                href={`/vision/${lead.id}`}
                target="_blank"
                className="block w-full border border-gray-warm text-charcoal font-ui font-semibold py-2.5 px-4 rounded-lg hover:border-red hover:text-red text-sm transition-colors"
              >
                👁 View vision result
              </a>
            )}
          </div>
          <div>
            <label className="block text-sm font-ui font-semibold text-charcoal mb-2">Update status</label>
            <select
              value={status}
              onChange={(e) => void updateStatus(e.target.value as IntakeLeadStatus)}
              disabled={saving}
              className="w-full border border-gray-warm rounded-lg px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-red bg-white disabled:opacity-60"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contractor notes */}
      {lead.projectNotes && (
        <div className="bg-white rounded-xl border border-gray-warm p-6">
          <h3 className="text-sm font-ui font-semibold text-gray-mid uppercase tracking-wide mb-3">Contractor Notes</h3>
          <p className="text-charcoal whitespace-pre-wrap">{lead.projectNotes}</p>
        </div>
      )}

      {/* Intake summary */}
      {(intake.space || intake.styles?.length) && (
        <div className="bg-white rounded-xl border border-gray-warm p-6">
          <h3 className="text-sm font-ui font-semibold text-gray-mid uppercase tracking-wide mb-4">Client Intake Summary</h3>
          <dl className="grid sm:grid-cols-2 gap-4">
            {[
              { key: "Space", value: intake.space },
              { key: "Style", value: intake.styles?.join(", ") },
              { key: "Budget", value: intake.budget },
              { key: "Timeline", value: intake.timeline },
            ]
              .filter((row) => row.value)
              .map((row) => (
                <div key={row.key}>
                  <dt className="text-xs font-ui font-semibold text-gray-mid uppercase tracking-wide mb-1">{row.key}</dt>
                  <dd className="text-charcoal">{row.value}</dd>
                </div>
              ))}
          </dl>
          {intake.finalNotes && (
            <div className="mt-4 pt-4 border-t border-gray-warm">
              <dt className="text-xs font-ui font-semibold text-gray-mid uppercase tracking-wide mb-1">Client Notes</dt>
              <dd className="text-charcoal whitespace-pre-wrap">{intake.finalNotes}</dd>
            </div>
          )}
          {intake.dontWant && (
            <div className="mt-4 pt-4 border-t border-gray-warm">
              <dt className="text-xs font-ui font-semibold text-gray-mid uppercase tracking-wide mb-1">Does NOT want</dt>
              <dd className="text-charcoal whitespace-pre-wrap">{intake.dontWant}</dd>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
