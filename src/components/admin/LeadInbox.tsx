"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ACTIVE_SERVICES } from "@/content/services";
import type { LeadRecord, LeadSummary } from "@/lib/leads";

type LeadStatus = "NEW" | "REVIEWED" | "CONTACTED" | "ARCHIVED";

type LeadInboxProps = {
  initialLeads: LeadRecord[];
  initialSummary: LeadSummary;
};

type LeadResponse = {
  ok: boolean;
  leads: LeadRecord[];
  summary: LeadSummary;
};

const STATUS_OPTIONS: Array<{ value: LeadStatus | "ACTIVE" | "ALL"; label: string }> = [
  { value: "ACTIVE", label: "Active" },
  { value: "NEW", label: "New" },
  { value: "REVIEWED", label: "Reviewed" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "ARCHIVED", label: "Archived" },
  { value: "ALL", label: "All" },
];

const SOURCE_LABELS: Record<string, string> = {
  "homepage-hero": "Homepage Hero",
  "homepage-spotlight": "Homepage Spotlight",
  "homepage-card": "Homepage Card",
  "project-page": "Project Page",
  "projects-card": "Projects Card",
  "gallery-card": "Gallery Card",
  "area-card": "Area Card",
  "service-page": "Service Page",
  "service-card": "Service Card",
  "direct-quote": "Direct Quote",
};

function formatDate(value: string | Date) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClass(status: LeadStatus) {
  switch (status) {
    case "NEW":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "REVIEWED":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "CONTACTED":
      return "border-green-200 bg-green-50 text-green-700";
    case "ARCHIVED":
      return "border-gray-200 bg-gray-100 text-gray-600";
    default:
      return "border-gray-200 bg-gray-100 text-gray-600";
  }
}

function messagePreview(message: string) {
  return message.length > 180 ? `${message.slice(0, 177)}...` : message;
}

function buildPublicProjectHref(lead: LeadRecord) {
  return lead.projectSlug ? `/projects/${lead.projectSlug}` : null;
}

function buildServiceHref(lead: LeadRecord) {
  return lead.service && lead.service !== "other" ? `/services/${lead.service}` : null;
}

function buildAreaHref(lead: LeadRecord) {
  return lead.areaSlug ? `/areas/${lead.areaSlug}` : null;
}

export default function LeadInbox({ initialLeads, initialSummary }: LeadInboxProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [summary, setSummary] = useState(initialSummary);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(initialLeads[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<LeadStatus | "ACTIVE" | "ALL">("ACTIVE");
  const [sourceType, setSourceType] = useState("");
  const [service, setService] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [showArchivedOnly, setShowArchivedOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingLeadId, setSavingLeadId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notesDrafts, setNotesDrafts] = useState<Record<string, string>>(
    Object.fromEntries(initialLeads.map((lead) => [lead.id, lead.internalNotes ?? ""])),
  );

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedLeadId) ?? null,
    [leads, selectedLeadId],
  );

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (status) params.set("status", status);
    if (sourceType) params.set("sourceType", sourceType);
    if (service) params.set("service", service);
    if (timeframe) params.set("timeframe", timeframe);
    if (showArchivedOnly) params.set("archived", "true");

    setLoading(true);
    setError("");

    fetch(`/api/admin/leads?${params.toString()}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const data = (await response.json()) as LeadResponse | { ok: false; error?: string };
        if (!response.ok || !("ok" in data) || !data.ok) {
          throw new Error("Unable to load leads.");
        }
        setLeads(data.leads);
        setSummary(data.summary);
        setSelectedLeadId((current) =>
          current && data.leads.some((lead) => lead.id === current)
            ? current
            : data.leads[0]?.id ?? null,
        );
        setNotesDrafts((prev) => ({
          ...prev,
          ...Object.fromEntries(data.leads.map((lead) => [lead.id, lead.internalNotes ?? ""])),
        }));
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unable to load leads.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [query, service, showArchivedOnly, sourceType, status, timeframe]);

  async function updateLead(id: string, payload: { status?: LeadStatus; internalNotes?: string }) {
    setSavingLeadId(id);
    setError("");
    try {
      const response = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as
        | { ok: true; lead: LeadRecord }
        | { ok: false; error?: string };

      if (!response.ok || !data.ok) {
        throw new Error(("error" in data && data.error) || "Unable to update lead.");
      }

      setLeads((prev) => prev.map((lead) => (lead.id === id ? data.lead : lead)));
      setNotesDrafts((prev) => ({ ...prev, [id]: data.lead.internalNotes ?? "" }));
      setSummary((prev) => {
        const current = leads.find((lead) => lead.id === id);
        if (!current || current.status === data.lead.status) return prev;
        const next = { ...prev };
        const decrement = (key: keyof LeadSummary) => {
          next[key] = Math.max(0, next[key] - 1);
        };
        const increment = (key: keyof LeadSummary) => {
          next[key] += 1;
        };
        if (current.status !== "ARCHIVED") decrement("totalActive");
        if (data.lead.status !== "ARCHIVED") increment("totalActive");
        if (current.status === "NEW") decrement("newCount");
        if (current.status === "REVIEWED") decrement("reviewedCount");
        if (current.status === "CONTACTED") decrement("contactedCount");
        if (current.status === "ARCHIVED") decrement("archivedCount");
        if (data.lead.status === "NEW") increment("newCount");
        if (data.lead.status === "REVIEWED") increment("reviewedCount");
        if (data.lead.status === "CONTACTED") increment("contactedCount");
        if (data.lead.status === "ARCHIVED") increment("archivedCount");
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update lead.");
    } finally {
      setSavingLeadId(null);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {[
          ["Active", summary.totalActive],
          ["New", summary.newCount],
          ["Reviewed", summary.reviewedCount],
          ["Contacted", summary.contactedCount],
          ["Archived", summary.archivedCount],
          ["This Week", summary.thisWeekCount],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="font-ui text-[10px] uppercase tracking-[0.18em] text-gray-mid">{label}</p>
            <p className="mt-2 text-2xl text-charcoal">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, phone, project, message"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-charcoal"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as LeadStatus | "ACTIVE" | "ALL")}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-charcoal"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={sourceType}
            onChange={(event) => setSourceType(event.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-charcoal"
          >
            <option value="">All sources</option>
            {Object.entries(SOURCE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={service}
            onChange={(event) => setService(event.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-charcoal"
          >
            <option value="">All services</option>
            {ACTIVE_SERVICES.map((entry) => (
              <option key={entry.slug} value={entry.slug}>
                {entry.shortTitle}
              </option>
            ))}
            <option value="other">Other / Not sure</option>
          </select>
          <select
            value={timeframe}
            onChange={(event) => setTimeframe(event.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-charcoal"
          >
            <option value="">Any time</option>
            <option value="today">Today</option>
            <option value="week">This week</option>
          </select>
          <label className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-charcoal">
            <input
              type="checkbox"
              checked={showArchivedOnly}
              onChange={(event) => setShowArchivedOnly(event.target.checked)}
              className="h-4 w-4 accent-red"
            />
            Archived only
          </label>
        </div>
        {error ? (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          <p className="font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">
            {loading ? "Refreshing leads..." : `${leads.length} leads`}
          </p>
          {leads.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-mid shadow-sm">
              No leads match the current filters.
            </div>
          ) : (
            leads.map((lead) => (
              <button
                key={lead.id}
                type="button"
                onClick={() => setSelectedLeadId(lead.id)}
                className={`w-full rounded-xl border p-5 text-left shadow-sm transition ${
                  selectedLeadId === lead.id
                    ? "border-red bg-red/5"
                    : "border-gray-200 bg-white hover:border-red/40"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-charcoal">{lead.name}</p>
                    <p className="mt-1 text-sm text-gray-mid">
                      {lead.email} · {lead.phone}
                    </p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 font-ui text-xs ${statusClass(lead.status as LeadStatus)}`}>
                    {lead.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-mid">
                  <span>{lead.service === "other" ? "Other / Not sure" : lead.service}</span>
                  <span>{lead.location}</span>
                  {lead.sourceType ? <span>{SOURCE_LABELS[lead.sourceType] ?? lead.sourceType}</span> : null}
                  <span>{formatDate(lead.createdAt)}</span>
                </div>
                {lead.projectTitle ? (
                  <p className="mt-3 text-sm font-medium text-charcoal">{lead.projectTitle}</p>
                ) : null}
                <p className="mt-2 text-sm leading-6 text-charcoal/80">{messagePreview(lead.message)}</p>
              </button>
            ))
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          {selectedLead ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-2xl text-charcoal">{selectedLead.name}</p>
                  <p className="mt-1 text-sm text-gray-mid">{formatDate(selectedLead.createdAt)}</p>
                </div>
                <span className={`rounded-full border px-2.5 py-1 font-ui text-xs ${statusClass(selectedLead.status as LeadStatus)}`}>
                  {selectedLead.status}
                </span>
              </div>

              <div className="grid gap-3 text-sm text-charcoal sm:grid-cols-2">
                <a href={`mailto:${selectedLead.email}`} className="rounded-lg border border-gray-200 bg-cream px-3 py-3">
                  <span className="font-ui text-[10px] uppercase tracking-[0.18em] text-gray-mid">Email</span>
                  <span className="mt-1 block break-all">{selectedLead.email}</span>
                </a>
                <a href={`tel:${selectedLead.phone.replace(/\D/g, "")}`} className="rounded-lg border border-gray-200 bg-cream px-3 py-3">
                  <span className="font-ui text-[10px] uppercase tracking-[0.18em] text-gray-mid">Phone</span>
                  <span className="mt-1 block">{selectedLead.phone}</span>
                </a>
                <div className="rounded-lg border border-gray-200 bg-cream px-3 py-3">
                  <span className="font-ui text-[10px] uppercase tracking-[0.18em] text-gray-mid">Service</span>
                  <span className="mt-1 block">{selectedLead.service === "other" ? "Other / Not sure" : selectedLead.service}</span>
                </div>
                <div className="rounded-lg border border-gray-200 bg-cream px-3 py-3">
                  <span className="font-ui text-[10px] uppercase tracking-[0.18em] text-gray-mid">Location</span>
                  <span className="mt-1 block">{selectedLead.location}</span>
                </div>
              </div>

              <div>
                <p className="font-ui text-[10px] uppercase tracking-[0.18em] text-gray-mid">Message</p>
                <div className="mt-2 rounded-lg border border-gray-200 bg-cream px-4 py-4 text-sm leading-6 text-charcoal whitespace-pre-wrap">
                  {selectedLead.message}
                </div>
              </div>

              <div className="space-y-2 text-sm text-charcoal">
                <p className="font-ui text-[10px] uppercase tracking-[0.18em] text-gray-mid">Source Context</p>
                <div className="rounded-lg border border-gray-200 bg-cream px-4 py-4 space-y-1">
                  <p><span className="font-medium">Source:</span> {selectedLead.sourceType ? SOURCE_LABELS[selectedLead.sourceType] ?? selectedLead.sourceType : "Direct quote"}</p>
                  {selectedLead.sourcePath ? <p><span className="font-medium">Path:</span> {selectedLead.sourcePath}</p> : null}
                  {selectedLead.projectTitle ? <p><span className="font-medium">Project:</span> {selectedLead.projectTitle}</p> : null}
                  {selectedLead.projectSlug ? <p><span className="font-medium">Project Slug:</span> {selectedLead.projectSlug}</p> : null}
                  {selectedLead.areaSlug ? <p><span className="font-medium">Area:</span> {selectedLead.areaSlug}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {buildPublicProjectHref(selectedLead) ? (
                    <Link href={buildPublicProjectHref(selectedLead)!} className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-charcoal hover:border-red hover:text-red">
                      Public project
                    </Link>
                  ) : null}
                  {buildServiceHref(selectedLead) ? (
                    <Link href={buildServiceHref(selectedLead)!} className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-charcoal hover:border-red hover:text-red">
                      Service page
                    </Link>
                  ) : null}
                  {buildAreaHref(selectedLead) ? (
                    <Link href={buildAreaHref(selectedLead)!} className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-charcoal hover:border-red hover:text-red">
                      Area page
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-ui text-[10px] uppercase tracking-[0.18em] text-gray-mid">Triage</p>
                <div className="flex flex-wrap gap-2">
                  {(["NEW", "REVIEWED", "CONTACTED", "ARCHIVED"] as LeadStatus[]).map((nextStatus) => (
                    <button
                      key={nextStatus}
                      type="button"
                      onClick={() => updateLead(selectedLead.id, { status: nextStatus })}
                      disabled={savingLeadId === selectedLead.id}
                      className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-charcoal transition hover:border-red hover:text-red disabled:opacity-50"
                    >
                      Mark {nextStatus.toLowerCase()}
                    </button>
                  ))}
                </div>
                <textarea
                  value={notesDrafts[selectedLead.id] ?? ""}
                  onChange={(event) =>
                    setNotesDrafts((prev) => ({ ...prev, [selectedLead.id]: event.target.value }))
                  }
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm text-charcoal"
                  placeholder="Internal notes for follow-up, scheduling, or callback context."
                />
                <button
                  type="button"
                  onClick={() =>
                    updateLead(selectedLead.id, {
                      internalNotes: notesDrafts[selectedLead.id] ?? "",
                    })
                  }
                  disabled={savingLeadId === selectedLead.id}
                  className="rounded-sm bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  Save notes
                </button>
              </div>

              {selectedLead.photoUrls.length > 0 ? (
                <div>
                  <p className="font-ui text-[10px] uppercase tracking-[0.18em] text-gray-mid">
                    Photos ({selectedLead.photoUrls.length})
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedLead.photoUrls.map((url, index) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="block overflow-hidden rounded-lg border border-gray-200"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Lead photo ${index + 1}`} className="h-20 w-28 object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-mid">Select a lead to review details.</div>
          )}
        </div>
      </div>
    </div>
  );
}
