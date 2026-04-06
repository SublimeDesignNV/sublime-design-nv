"use client";

import { useCallback, useEffect, useState } from "react";
import type { FinishCategory, ProjectFinish } from "@/types/project";
import { FINISH_CATEGORY_ICONS, FINISH_CATEGORY_LABELS } from "@/types/project";

const CATEGORIES = Object.entries(FINISH_CATEGORY_LABELS) as [FinishCategory, string][];

const EMPTY_FORM: Omit<ProjectFinish, "id"> = {
  category: "wood",
  name: "",
  code: "",
  supplier: "",
  url: "",
  notes: "",
  color: "",
};

function randomId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

type Props = { projectId: string };

export default function ProjectFinishesEditor({ projectId }: Props) {
  const [finishes, setFinishes] = useState<ProjectFinish[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<Omit<ProjectFinish, "id">>(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/finishes`);
      const data = (await res.json()) as { ok: boolean; finishes?: ProjectFinish[] };
      setFinishes(data.finishes ?? []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function persist(next: ProjectFinish[]) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/finishes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finishes: next }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) { setError(data.error ?? "Failed to save."); return; }
      setFinishes(next);
    } catch {
      setError("Failed to save finishes.");
    } finally {
      setSaving(false);
    }
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditingId("new");
  }

  function openEdit(finish: ProjectFinish) {
    const { id, ...rest } = finish;
    setForm({ ...EMPTY_FORM, ...rest });
    setEditingId(id);
  }

  function closeForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    let next: ProjectFinish[];
    if (editingId === "new") {
      next = [...finishes, { id: randomId(), ...form }];
    } else {
      next = finishes.map((f) => f.id === editingId ? { ...f, ...form } : f);
    }
    await persist(next);
    closeForm();
  }

  async function handleDelete(id: string) {
    await persist(finishes.filter((f) => f.id !== id));
  }

  const showColorPicker = form.category === "paint" || form.category === "stain";

  return (
    <div className="mt-6 border-t border-gray-warm pt-6">
      <div className="flex items-center justify-between">
        <p className="font-ui text-sm font-semibold text-charcoal">Finishes &amp; Materials</p>
        <button
          type="button"
          onClick={openAdd}
          className="font-ui rounded-sm border border-gray-warm px-3 py-1.5 text-xs text-charcoal transition hover:border-red hover:text-red"
        >
          + Add Finish
        </button>
      </div>

      {loading ? (
        <p className="mt-3 font-ui text-xs text-gray-mid">Loading...</p>
      ) : null}

      {!loading && finishes.length === 0 ? (
        <p className="mt-3 font-ui text-xs text-gray-mid">No finishes recorded yet.</p>
      ) : null}

      {finishes.length > 0 ? (
        <div className="mt-3 space-y-2">
          {finishes.map((finish) => (
            <div key={finish.id} className="rounded-lg border border-gray-warm bg-cream/40 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-ui text-[10px] uppercase tracking-[0.16em] text-gray-mid">
                      {FINISH_CATEGORY_ICONS[finish.category]} {FINISH_CATEGORY_LABELS[finish.category]}
                    </span>
                    {finish.color ? (
                      <span
                        className="inline-block h-3.5 w-3.5 rounded-full border border-gray-200"
                        style={{ backgroundColor: finish.color }}
                        title={finish.color}
                      />
                    ) : null}
                  </div>
                  <p className="mt-1 font-ui text-sm font-semibold text-charcoal">
                    {finish.name}
                    {finish.code ? <span className="ml-1.5 font-normal text-gray-mid">{finish.code}</span> : null}
                  </p>
                  {finish.supplier ? (
                    <p className="mt-0.5 text-xs text-gray-mid">Supplier: {finish.supplier}</p>
                  ) : null}
                  {finish.notes ? (
                    <p className="mt-0.5 text-xs text-gray-mid">{finish.notes}</p>
                  ) : null}
                  {finish.url ? (
                    <a
                      href={finish.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 block text-xs text-red underline"
                    >
                      Product link ↗
                    </a>
                  ) : null}
                </div>
                <div className="flex flex-shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(finish)}
                    className="rounded-sm border border-gray-warm px-2 py-1 font-ui text-xs text-charcoal transition hover:border-navy hover:text-navy"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(finish.id)}
                    disabled={saving}
                    className="rounded-sm border border-red/30 px-2 py-1 font-ui text-xs text-red transition hover:border-red disabled:opacity-60"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {error ? <p className="mt-2 font-ui text-xs text-red">{error}</p> : null}

      {editingId !== null ? (
        <div className="mt-4 rounded-xl border border-navy/20 bg-white p-4 shadow-sm">
          <p className="font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">
            {editingId === "new" ? "Add Finish" : "Edit Finish"}
          </p>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="font-ui text-xs font-semibold text-charcoal">
                Name <span className="text-red">*</span>
              </span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy"
                placeholder="Sherwin Williams Alabaster"
              />
            </label>

            <label className="block">
              <span className="font-ui text-xs font-semibold text-charcoal">Category</span>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as FinishCategory }))}
                className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy"
              >
                {CATEGORIES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {FINISH_CATEGORY_ICONS[value]} {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="font-ui text-xs font-semibold text-charcoal">Code / SKU</span>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy"
                placeholder="SW 7008"
              />
            </label>

            <label className="block">
              <span className="font-ui text-xs font-semibold text-charcoal">Supplier</span>
              <input
                type="text"
                value={form.supplier}
                onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))}
                className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy"
                placeholder="Home Depot, Wurth, Rockler"
              />
            </label>

            {showColorPicker ? (
              <label className="block">
                <span className="font-ui text-xs font-semibold text-charcoal">Color</span>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={form.color || "#ffffff"}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    className="h-9 w-12 cursor-pointer rounded-sm border border-gray-warm"
                  />
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    className="w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy"
                    placeholder="#F2EFE4"
                    maxLength={7}
                  />
                </div>
              </label>
            ) : null}

            <label className="block sm:col-span-2">
              <span className="font-ui text-xs font-semibold text-charcoal">Product URL</span>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy"
                placeholder="https://..."
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="font-ui text-xs font-semibold text-charcoal">Notes</span>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="mt-1 min-h-[64px] w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy"
                placeholder="Used on trim only, 2 coats"
              />
            </label>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-sm border border-gray-warm px-4 py-2 font-ui text-sm text-charcoal transition hover:border-gray-mid"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || !form.name.trim()}
              className="rounded-sm bg-red px-4 py-2 font-ui text-sm font-semibold text-white transition hover:bg-red-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Finish"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
