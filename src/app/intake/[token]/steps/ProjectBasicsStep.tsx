"use client";

import type { IntakeServiceType } from "@prisma/client";
import type { IntakeFormData } from "../IntakeForm";

const SPACES = ["Kitchen", "Living Room", "Master Bedroom", "Dining Room", "Office", "Garage", "Other"];
const STYLES = ["Modern", "Rustic", "Industrial", "Traditional", "Farmhouse", "Transitional", "Custom/Not Sure"];
const TIMELINES = ["ASAP", "1–3 months", "3–6 months", "No rush"];

type Props = {
  serviceType: IntakeServiceType;
  data: IntakeFormData;
  onChange: (data: Partial<IntakeFormData>) => void;
  onNext: () => void;
  onBack: () => void;
};

function ToggleChip({ label, selected, onToggle }: { label: string; selected: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`px-4 py-2 rounded-full text-sm font-ui font-medium border transition-colors ${
        selected
          ? "bg-red text-white border-red"
          : "bg-white text-charcoal border-gray-warm hover:border-red"
      }`}
    >
      {label}
    </button>
  );
}

function ServiceSpecificFields({ serviceType, data, onChange }: { serviceType: IntakeServiceType; data: IntakeFormData; onChange: (data: Partial<IntakeFormData>) => void }) {
  const details = data.serviceDetails ?? {};
  const update = (key: string, value: unknown) =>
    onChange({ serviceDetails: { ...details, [key]: value } });

  const sel = (key: string) => details[key] as string | undefined;

  switch (serviceType) {
    case "BARN_DOORS":
      return (
        <div className="space-y-4">
          {[
            { key: "doorCount", label: "Single or double door?", opts: ["Single", "Double"] },
            { key: "doorType", label: "Bypass (slides past) or standard slide?", opts: ["Bypass", "Standard slide"] },
            { key: "hardware", label: "Hardware finish preference", opts: ["Black", "Brushed Nickel", "Bronze", "Not Sure"] },
          ].map(({ key, label, opts }) => (
            <div key={key}>
              <label className="block text-sm font-ui font-semibold text-charcoal mb-2">{label}</label>
              <div className="flex flex-wrap gap-2">
                {opts.map((o) => (
                  <ToggleChip key={o} label={o} selected={sel(key) === o} onToggle={() => update(key, o)} />
                ))}
              </div>
            </div>
          ))}
          <div>
            <label className="block text-sm font-ui font-semibold text-charcoal mb-2">Approximate opening size (W × H in feet)</label>
            <input
              type="text"
              placeholder="e.g. 6×8 — rough estimate is fine"
              value={(details.openingSize as string) ?? ""}
              onChange={(e) => update("openingSize", e.target.value)}
              className="w-full border border-gray-warm rounded-lg px-4 py-3 text-charcoal focus:outline-none focus:border-red"
            />
          </div>
        </div>
      );
    case "CABINETS":
      return (
        <div className="space-y-4">
          {[
            { key: "buildType", label: "New build or refacing existing?", opts: ["New build", "Refacing existing"] },
            { key: "cabinetLevel", label: "Upper, lower, or both?", opts: ["Upper only", "Lower only", "Both"] },
            { key: "doorStyle", label: "Door style preference", opts: ["Shaker", "Flat panel", "Raised panel", "Open shelving", "Not Sure"] },
          ].map(({ key, label, opts }) => (
            <div key={key}>
              <label className="block text-sm font-ui font-semibold text-charcoal mb-2">{label}</label>
              <div className="flex flex-wrap gap-2">
                {opts.map((o) => (
                  <ToggleChip key={o} label={o} selected={sel(key) === o} onToggle={() => update(key, o)} />
                ))}
              </div>
            </div>
          ))}
          <div>
            <label className="block text-sm font-ui font-semibold text-charcoal mb-2">Approximate linear feet of cabinetry</label>
            <input
              type="text"
              placeholder="e.g. 15 linear feet"
              value={(details.linearFeet as string) ?? ""}
              onChange={(e) => update("linearFeet", e.target.value)}
              className="w-full border border-gray-warm rounded-lg px-4 py-3 text-charcoal focus:outline-none focus:border-red"
            />
          </div>
        </div>
      );
    case "CUSTOM_CLOSETS":
      return (
        <div className="space-y-4">
          {[
            { key: "closetType", label: "Walk-in or reach-in?", opts: ["Walk-in", "Reach-in"] },
            { key: "storagePriority", label: "Storage priority", opts: ["Hanging space", "Drawer space", "Balanced"] },
          ].map(({ key, label, opts }) => (
            <div key={key}>
              <label className="block text-sm font-ui font-semibold text-charcoal mb-2">{label}</label>
              <div className="flex flex-wrap gap-2">
                {opts.map((o) => (
                  <ToggleChip key={o} label={o} selected={sel(key) === o} onToggle={() => update(key, o)} />
                ))}
              </div>
            </div>
          ))}
          <div>
            <label className="block text-sm font-ui font-semibold text-charcoal mb-2">Special storage needs? (optional)</label>
            <input
              type="text"
              placeholder="e.g. shoes, accessories, safe..."
              value={(details.specialStorage as string) ?? ""}
              onChange={(e) => update("specialStorage", e.target.value)}
              className="w-full border border-gray-warm rounded-lg px-4 py-3 text-charcoal focus:outline-none focus:border-red"
            />
          </div>
        </div>
      );
    case "FAUX_BEAMS":
      return (
        <div className="space-y-4">
          {[
            { key: "orientation", label: "Beam orientation", opts: ["Parallel runs", "Grid/coffers", "Single accent beam"] },
          ].map(({ key, label, opts }) => (
            <div key={key}>
              <label className="block text-sm font-ui font-semibold text-charcoal mb-2">{label}</label>
              <div className="flex flex-wrap gap-2">
                {opts.map((o) => (
                  <ToggleChip key={o} label={o} selected={sel(key) === o} onToggle={() => update(key, o)} />
                ))}
              </div>
            </div>
          ))}
          {[
            { key: "ceilingHeight", label: "Ceiling height (approx)", placeholder: "e.g. 9 feet" },
            { key: "beamCount", label: "How many beams? (rough count or \"not sure\")", placeholder: "e.g. 4" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-ui font-semibold text-charcoal mb-2">{label}</label>
              <input
                type="text"
                placeholder={placeholder}
                value={(details[key] as string) ?? ""}
                onChange={(e) => update(key, e.target.value)}
                className="w-full border border-gray-warm rounded-lg px-4 py-3 text-charcoal focus:outline-none focus:border-red"
              />
            </div>
          ))}
        </div>
      );
    case "FLOATING_SHELVES":
      return (
        <div className="space-y-4">
          {[
            { key: "use", label: "Decorative or functional storage?", opts: ["Decorative", "Functional storage", "Both"] },
          ].map(({ key, label, opts }) => (
            <div key={key}>
              <label className="block text-sm font-ui font-semibold text-charcoal mb-2">{label}</label>
              <div className="flex flex-wrap gap-2">
                {opts.map((o) => (
                  <ToggleChip key={o} label={o} selected={sel(key) === o} onToggle={() => update(key, o)} />
                ))}
              </div>
            </div>
          ))}
          {[
            { key: "shelfCount", label: "How many shelves?", placeholder: "e.g. 3" },
            { key: "shelfLength", label: "Approximate length per shelf", placeholder: "e.g. 5 feet" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-ui font-semibold text-charcoal mb-2">{label}</label>
              <input
                type="text"
                placeholder={placeholder}
                value={(details[key] as string) ?? ""}
                onChange={(e) => update(key, e.target.value)}
                className="w-full border border-gray-warm rounded-lg px-4 py-3 text-charcoal focus:outline-none focus:border-red"
              />
            </div>
          ))}
        </div>
      );
    case "MANTELS":
      return (
        <div className="space-y-4">
          {[
            { key: "fireplaceType", label: "Existing fireplace or new build?", opts: ["Existing", "New build"] },
            { key: "insertType", label: "Fireplace type", opts: ["Gas", "Wood-burning", "Electric insert"] },
            { key: "scope", label: "Scope", opts: ["Surround included", "Mantel shelf only"] },
          ].map(({ key, label, opts }) => (
            <div key={key}>
              <label className="block text-sm font-ui font-semibold text-charcoal mb-2">{label}</label>
              <div className="flex flex-wrap gap-2">
                {opts.map((o) => (
                  <ToggleChip key={o} label={o} selected={sel(key) === o} onToggle={() => update(key, o)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    case "TRIM_WORK": {
      const trimTypes = ["Crown molding", "Baseboard", "Casing", "Wainscoting", "Board & batten", "Coffered ceiling", "Other"];
      const selected = (details.trimTypes as string[]) ?? [];
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-ui font-semibold text-charcoal mb-2">Type needed (select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {trimTypes.map((t) => (
                <ToggleChip
                  key={t}
                  label={t}
                  selected={selected.includes(t)}
                  onToggle={() => {
                    const next = selected.includes(t)
                      ? selected.filter((x) => x !== t)
                      : [...selected, t];
                    update("trimTypes", next);
                  }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-ui font-semibold text-charcoal mb-2">Approximate square footage of space</label>
            <input
              type="text"
              placeholder="e.g. 400 sq ft"
              value={(details.sqft as string) ?? ""}
              onChange={(e) => update("sqft", e.target.value)}
              className="w-full border border-gray-warm rounded-lg px-4 py-3 text-charcoal focus:outline-none focus:border-red"
            />
          </div>
        </div>
      );
    }
    default:
      return null;
  }
}

export default function ProjectBasicsStep({ serviceType, data, onChange, onNext, onBack }: Props) {
  const canContinue = !!data.space && !!data.timeline;

  return (
    <div className="space-y-8">
      <div>
        <label className="block text-sm font-ui font-semibold text-charcoal mb-2">
          What&apos;s the space we&apos;re working in?
        </label>
        <select
          value={data.space ?? ""}
          onChange={(e) => onChange({ space: e.target.value })}
          className="w-full border border-gray-warm rounded-lg px-4 py-3 text-charcoal focus:outline-none focus:border-red bg-white"
        >
          <option value="">Select a space...</option>
          {SPACES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-ui font-semibold text-charcoal mb-3">
          How would you describe your style?
        </label>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <ToggleChip
              key={s}
              label={s}
              selected={(data.styles ?? []).includes(s)}
              onToggle={() => {
                const current = data.styles ?? [];
                const next = current.includes(s)
                  ? current.filter((x) => x !== s)
                  : [...current, s];
                onChange({ styles: next });
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-ui font-semibold text-charcoal mb-2">
          Budget range? <span className="font-normal text-gray-mid">(optional)</span>
        </label>
        <select
          value={data.budget ?? ""}
          onChange={(e) => onChange({ budget: e.target.value })}
          className="w-full border border-gray-warm rounded-lg px-4 py-3 text-charcoal focus:outline-none focus:border-red bg-white"
        >
          <option value="">Prefer not to say</option>
          <option value="Under $2,000">Under $2,000</option>
          <option value="$2,000–$5,000">$2,000–$5,000</option>
          <option value="$5,000–$10,000">$5,000–$10,000</option>
          <option value="$10,000–$20,000">$10,000–$20,000</option>
          <option value="$20,000+">$20,000+</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-ui font-semibold text-charcoal mb-2">
          When are you hoping to have this done?
        </label>
        <div className="flex flex-wrap gap-2">
          {TIMELINES.map((t) => (
            <ToggleChip
              key={t}
              label={t}
              selected={data.timeline === t}
              onToggle={() => onChange({ timeline: t })}
            />
          ))}
        </div>
      </div>

      {serviceType !== "MULTIPLE" && serviceType !== "OTHER" && (
        <div className="border-t border-gray-warm pt-6">
          <h3 className="text-sm font-ui font-semibold text-charcoal mb-4 uppercase tracking-wide">
            A few more details for your project
          </h3>
          <ServiceSpecificFields serviceType={serviceType} data={data} onChange={onChange} />
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-warm text-charcoal font-ui font-semibold py-4 rounded-lg hover:border-charcoal transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="flex-[2] bg-red text-white font-ui font-bold py-4 rounded-lg hover:bg-red-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
