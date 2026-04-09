"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff, Pencil, Plus, Trash2, X } from "lucide-react";

type License = {
  id: string;
  licenseType: string;
  licenseNumber: string;
  issuingState: string | null;
  expiresAt: string | null;
  showOnSite: boolean;
  position: number;
};

const LICENSE_TYPE_OPTIONS = [
  "C3 Carpentry",
  "B2 General Contractor",
  "B General Building",
  "C-5 Framing & Rough Carpentry",
  "C-6 Cabinet, Millwork & Finish Carpentry",
  "ROC (Arizona)",
  "CSLB (California)",
  "General Liability Insurance",
  "Workers Comp Insurance",
  "Bonded",
  "Other",
];

type EditForm = {
  licenseType: string;
  licenseNumber: string;
  issuingState: string;
  expiresAt: string;
};

const BLANK_FORM: EditForm = {
  licenseType: "",
  licenseNumber: "",
  issuingState: "NV",
  expiresAt: "",
};

export default function LicensesManager({
  showLicensesOnSite,
  onToggleSection,
}: {
  showLicensesOnSite: boolean;
  onToggleSection: () => void;
}) {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [form, setForm] = useState<EditForm>(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/licenses");
    if (res.ok) setLicenses((await res.json()) as License[]);
  }, []);

  useEffect(() => { void load(); }, [load]);

  function startEdit(lic: License) {
    setAddingNew(false);
    setEditingId(lic.id);
    setForm({
      licenseType: lic.licenseType,
      licenseNumber: lic.licenseNumber,
      issuingState: lic.issuingState ?? "NV",
      expiresAt: lic.expiresAt ? lic.expiresAt.slice(0, 7) : "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setAddingNew(false);
    setForm(BLANK_FORM);
    setError(null);
  }

  async function saveEdit() {
    if (!form.licenseType.trim() || !form.licenseNumber.trim()) {
      setError("License type and number are required.");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      licenseType: form.licenseType,
      licenseNumber: form.licenseNumber,
      issuingState: form.issuingState || "NV",
      expiresAt: form.expiresAt ? `${form.expiresAt}-01` : null,
    };

    if (addingNew) {
      const res = await fetch("/api/admin/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSaving(false);
      if (!res.ok) { setError("Failed to create license."); return; }
    } else {
      const res = await fetch(`/api/admin/licenses/${editingId!}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSaving(false);
      if (!res.ok) { setError("Failed to save license."); return; }
    }
    cancelEdit();
    void load();
  }

  async function toggleVisibility(lic: License) {
    await fetch(`/api/admin/licenses/${lic.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showOnSite: !lic.showOnSite }),
    });
    void load();
  }

  async function deleteLicense(lic: License) {
    if (!window.confirm(`Delete "${lic.licenseType} ${lic.licenseNumber}"?`)) return;
    await fetch(`/api/admin/licenses/${lic.id}`, { method: "DELETE" });
    void load();
  }

  async function move(index: number, dir: -1 | 1) {
    const next = [...licenses];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap]!, next[index]!];
    setLicenses(next);
    await fetch("/api/admin/licenses/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((l) => l.id) }),
    });
  }

  const inputClass = "w-full rounded-lg border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none focus:border-navy";
  const selectClass = `${inputClass} appearance-none`;

  return (
    <div className="rounded-xl border border-gray-warm bg-white p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="font-ui text-xs font-semibold uppercase tracking-[0.16em] text-gray-mid">License Numbers</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSection}
            title={showLicensesOnSite ? "Visible on site" : "Hidden from site"}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors ${showLicensesOnSite ? "bg-green-500" : "bg-gray-200"}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${showLicensesOnSite ? "translate-x-4" : "translate-x-0"}`} />
          </button>
          <span className="font-ui text-xs text-gray-mid">Show on site</span>
        </div>
      </div>

      {!showLicensesOnSite && (
        <p className="font-ui text-xs text-amber-600">⚠ Hidden — not shown on the public website</p>
      )}

      {error && <p className="font-ui text-xs text-red-600">{error}</p>}

      {/* License rows */}
      <div className="space-y-2">
        {licenses.map((lic, i) => (
          <div key={lic.id}>
            {editingId === lic.id ? (
              <LicenseForm
                form={form}
                onChange={setForm}
                onSave={() => void saveEdit()}
                onCancel={cancelEdit}
                saving={saving}
              />
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-gray-warm bg-gray-50 px-3 py-2.5">
                {/* Reorder */}
                <div className="flex flex-col gap-0.5">
                  <button type="button" onClick={() => void move(i, -1)} disabled={i === 0} className="text-gray-300 hover:text-gray-500 disabled:opacity-20">
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button type="button" onClick={() => void move(i, 1)} disabled={i === licenses.length - 1} className="text-gray-300 hover:text-gray-500 disabled:opacity-20">
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <span className="font-ui text-sm font-medium text-charcoal">{lic.licenseType}</span>
                  <span className="ml-2 font-ui text-sm text-gray-mid">{lic.licenseNumber}</span>
                  {lic.issuingState && <span className="ml-2 font-ui text-xs text-gray-400">{lic.issuingState}</span>}
                  {!lic.showOnSite && <span className="ml-2 font-ui text-[10px] uppercase text-amber-500">Hidden</span>}
                </div>

                {/* Actions */}
                <button type="button" onClick={() => void toggleVisibility(lic)} title={lic.showOnSite ? "Hide from site" : "Show on site"} className="text-gray-400 hover:text-charcoal">
                  {lic.showOnSite ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button type="button" onClick={() => startEdit(lic)} className="text-gray-400 hover:text-navy">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => void deleteLicense(lic)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}

        {licenses.length === 0 && !addingNew && (
          <p className="font-ui text-xs text-gray-mid">No licenses yet. Add one below.</p>
        )}
      </div>

      {/* Inline add form */}
      {addingNew && (
        <LicenseForm
          form={form}
          onChange={setForm}
          onSave={() => void saveEdit()}
          onCancel={cancelEdit}
          saving={saving}
        />
      )}

      {/* Add button */}
      {!addingNew && editingId === null && (
        <button
          type="button"
          onClick={() => { setAddingNew(true); setForm(BLANK_FORM); setEditingId(null); }}
          className="flex items-center gap-1.5 font-ui text-xs text-navy hover:text-navy/80"
        >
          <Plus className="h-3.5 w-3.5" /> Add License
        </button>
      )}
    </div>
  );
}

function LicenseForm({
  form,
  onChange,
  onSave,
  onCancel,
  saving,
}: {
  form: EditForm;
  onChange: (f: EditForm) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const inputClass = "w-full rounded-lg border border-gray-warm bg-white px-3 py-2 font-ui text-sm text-charcoal outline-none focus:border-navy";

  return (
    <div className="rounded-lg border border-navy/20 bg-navy/5 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block font-ui text-xs text-gray-mid">License Type</label>
          <input
            list="license-type-options"
            value={form.licenseType}
            onChange={(e) => onChange({ ...form, licenseType: e.target.value })}
            placeholder="C3 Carpentry"
            className={inputClass}
          />
          <datalist id="license-type-options">
            {["C3 Carpentry","B2 General Contractor","B General Building","C-5 Framing & Rough Carpentry","C-6 Cabinet, Millwork & Finish Carpentry","ROC (Arizona)","CSLB (California)","General Liability Insurance","Workers Comp Insurance","Bonded","Other"].map((opt) => (
              <option key={opt} value={opt} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="mb-1 block font-ui text-xs text-gray-mid">License #</label>
          <input
            value={form.licenseNumber}
            onChange={(e) => onChange({ ...form, licenseNumber: e.target.value })}
            placeholder="#82320"
            className={inputClass}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block font-ui text-xs text-gray-mid">State</label>
          <input
            value={form.issuingState}
            onChange={(e) => onChange({ ...form, issuingState: e.target.value })}
            placeholder="NV"
            maxLength={4}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block font-ui text-xs text-gray-mid">Expires (MM/YYYY, optional)</label>
          <input
            type="month"
            value={form.expiresAt}
            onChange={(e) => onChange({ ...form, expiresAt: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex items-center gap-1 rounded-lg border border-gray-warm px-3 py-1.5 font-ui text-xs text-gray-mid hover:text-charcoal">
          <X className="h-3 w-3" /> Cancel
        </button>
        <button type="button" onClick={onSave} disabled={saving} className="rounded-lg bg-navy px-4 py-1.5 font-ui text-xs text-white hover:bg-navy/90 disabled:opacity-50">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
