"use client";

import { useState } from "react";
import type { IntakeLead, IntakeLeadStatus, IntakeServiceType } from "@prisma/client";

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

type EditFields = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  serviceType: IntakeServiceType;
  projectNotes: string;
};

const SERVICE_TYPE_OPTIONS: IntakeServiceType[] = [
  "BARN_DOORS",
  "CABINETS",
  "CUSTOM_CLOSETS",
  "FAUX_BEAMS",
  "FLOATING_SHELVES",
  "MANTELS",
  "TRIM_WORK",
  "MULTIPLE",
  "OTHER",
];

export default function OverviewTab({ lead, intakeUrl }: Props) {
  const [status, setStatus] = useState<IntakeLeadStatus>(lead.status);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [archiveToast, setArchiveToast] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editFields, setEditFields] = useState<EditFields>({
    firstName: lead.firstName,
    lastName: lead.lastName ?? "",
    phone: lead.phone ?? "",
    email: lead.email ?? "",
    serviceType: lead.serviceType,
    projectNotes: lead.projectNotes ?? "",
  });
  const [displayFields, setDisplayFields] = useState<EditFields>({ ...editFields });
  const [editSaving, setEditSaving] = useState(false);

  const intake = (lead.intakeData ?? {}) as IntakeData;

  function cancelEdit() {
    setEditFields({ ...displayFields });
    setEditing(false);
  }

  async function saveEdit() {
    setEditSaving(true);
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: editFields.firstName,
          lastName: editFields.lastName || null,
          phone: editFields.phone || null,
          email: editFields.email || null,
          serviceType: editFields.serviceType,
          projectNotes: editFields.projectNotes || null,
        }),
      });
      setDisplayFields({ ...editFields });
      setEditing(false);
    } finally {
      setEditSaving(false);
    }
  }

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

  async function archiveLead() {
    setSaving(true);
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CLOSED" }),
      });
      setStatus("CLOSED");
      setArchiveToast(true);
      setTimeout(() => setArchiveToast(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  const statusTimeline: IntakeLeadStatus[] = [
    "INTAKE_SENT",
    "INTAKE_STARTED",
    "INTAKE_COMPLETE",
    "VISION_GENERATED",
    "BID_READY",
  ];

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
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-ui font-semibold text-gray-mid uppercase tracking-wide">Contact</h3>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs font-ui font-semibold text-gray-mid hover:text-red transition-colors"
              >
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-ui font-semibold text-gray-mid mb-1">First name</label>
                  <input
                    type="text"
                    value={editFields.firstName}
                    onChange={(e) => setEditFields((p) => ({ ...p, firstName: e.target.value }))}
                    className="w-full border border-gray-warm rounded-lg px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-red"
                  />
                </div>
                <div>
                  <label className="block text-xs font-ui font-semibold text-gray-mid mb-1">Last name</label>
                  <input
                    type="text"
                    value={editFields.lastName}
                    onChange={(e) => setEditFields((p) => ({ ...p, lastName: e.target.value }))}
                    className="w-full border border-gray-warm rounded-lg px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-red"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-ui font-semibold text-gray-mid mb-1">Phone</label>
                <input
                  type="tel"
                  value={editFields.phone}
                  onChange={(e) => setEditFields((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full border border-gray-warm rounded-lg px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-red"
                />
              </div>
              <div>
                <label className="block text-xs font-ui font-semibold text-gray-mid mb-1">Email</label>
                <input
                  type="email"
                  value={editFields.email}
                  onChange={(e) => setEditFields((p) => ({ ...p, email: e.target.value }))}
                  className="w-full border border-gray-warm rounded-lg px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-red"
                />
              </div>
              <div>
                <label className="block text-xs font-ui font-semibold text-gray-mid mb-1">Service type</label>
                <select
                  value={editFields.serviceType}
                  onChange={(e) => setEditFields((p) => ({ ...p, serviceType: e.target.value as IntakeServiceType }))}
                  className="w-full border border-gray-warm rounded-lg px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-red bg-white"
                >
                  {SERVICE_TYPE_OPTIONS.map((s) => (
                    <option key={s} value={s}>{SERVICE_LABELS[s] ?? s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-ui font-semibold text-gray-mid mb-1">Contractor notes</label>
                <textarea
                  value={editFields.projectNotes}
                  onChange={(e) => setEditFields((p) => ({ ...p, projectNotes: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-warm rounded-lg px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-red resize-none"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => void saveEdit()}
                  disabled={editSaving}
                  className="flex-1 bg-red text-white font-ui font-bold py-2 rounded-lg hover:bg-red-dark transition-colors disabled:opacity-40 text-sm"
                >
                  {editSaving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex-1 border border-gray-warm text-charcoal font-ui font-semibold py-2 rounded-lg hover:border-charcoal transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-ui font-semibold text-charcoal text-lg">{displayFields.firstName} {displayFields.lastName}</p>
              {displayFields.phone && (
                <a href={`tel:${displayFields.phone}`} className="block text-red hover:underline text-sm">{displayFields.phone}</a>
              )}
              {displayFields.email && (
                <a href={`mailto:${displayFields.email}`} className="block text-red hover:underline text-sm">{displayFields.email}</a>
              )}
              <p className="text-sm text-gray-mid">
                Service: <span className="text-charcoal font-semibold">{SERVICE_LABELS[displayFields.serviceType] ?? displayFields.serviceType}</span>
              </p>
              <p className="text-sm text-gray-mid">
                Created: {lead.createdAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl border border-gray-warm p-6 space-y-4">
          <h3 className="text-sm font-ui font-semibold text-gray-mid uppercase tracking-wide">Actions</h3>
          {archiveToast && (
            <div className="bg-charcoal text-white text-sm font-ui font-semibold px-4 py-2 rounded-lg text-center">
              Lead archived
            </div>
          )}
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
            {status !== "CLOSED" && (
              <button
                onClick={() => void archiveLead()}
                disabled={saving}
                className="w-full border border-gray-warm text-gray-mid font-ui font-semibold py-2.5 px-4 rounded-lg hover:border-charcoal hover:text-charcoal text-sm transition-colors text-left disabled:opacity-40"
              >
                🗄 Archive lead
              </button>
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
