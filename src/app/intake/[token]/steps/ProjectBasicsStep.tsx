"use client";

import type { IntakeServiceType } from "@prisma/client";
import type { IntakeFormData } from "../IntakeForm";

const SPACES = ["Kitchen", "Living Room", "Master Bedroom", "Dining Room", "Office", "Garage", "Other"];
const STYLES = ["Modern", "Rustic", "Industrial", "Traditional", "Farmhouse", "Transitional", "Custom/Not Sure"];
const TIMELINES = ["ASAP", "1–3 months", "3–6 months", "No rush"];

// Fix 2 — consistent prominent label style across all questions
const Q = "block text-lg font-bold text-charcoal mb-3";

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

// Fix 6 — service context cards
type ContextItem = { label: string; body: string };
type ServiceContext = { title: string; items: ContextItem[] | null; prose?: string };

const SERVICE_CONTEXT: Record<IntakeServiceType, ServiceContext> = {
  FAUX_BEAMS: {
    title: "A few things to know about faux beams",
    items: [
      { label: "Realistic timelines", body: "Most faux beam projects take 1–3 days for installation depending on room size and beam count. Material lead time is typically 2–4 weeks if custom ordered." },
      { label: "Material options", body: "Polyurethane foam beams are lightweight and budget-friendly. Hollow wood-wrap beams look the most authentic and accept stain beautifully. Solid wood is the premium option for maximum realism." },
      { label: "Sizing your beams", body: "As a rule of thumb, beam width should be roughly 1 inch per foot of ceiling height (a 9ft ceiling = ~9 inch wide beam). Depth is typically 50–75% of the width. Beams that are too small disappear visually; too large can feel heavy." },
      { label: "Vault and ceiling shape", body: "Vaulted, cathedral, and coffered ceilings all require different mounting strategies. Angled ceilings need custom-cut end caps. We account for all of this in the design." },
    ],
  },
  BARN_DOORS: {
    title: "A few things to know about barn doors",
    items: [
      { label: "Realistic timelines", body: "Custom barn doors typically take 2–4 weeks from order to install. Hardware ships separately and lead times vary." },
      { label: "Bypass vs. single slide", body: "Bypass doors (two panels that slide past each other) work well when wall space is limited on one side. Single slide doors need clear wall space equal to the door width plus a few inches." },
      { label: "Sizing", body: "The door should overlap the opening by 1–2 inches on each side. We measure the rough opening and size accordingly." },
      { label: "Wood and finish options", body: "Popular choices include knotty alder (rustic), clear pine (paintable), and reclaimed wood (character-rich). Each takes stain and paint differently." },
    ],
  },
  CABINETS: {
    title: "A few things to know about custom cabinets",
    items: [
      { label: "Realistic timelines", body: "Custom cabinets are typically a 6–10 week build-to-install process. Semi-custom can be 3–5 weeks." },
      { label: "Face frame vs. frameless", body: "Face frame cabinets have a traditional look with visible front frame. Frameless (Euro-style) are sleek and modern with full-access interiors." },
      { label: "Wood species matter", body: "Maple is smooth and consistent — great for paint. Alder has natural character — great for stain. Oak has strong grain — bold and traditional." },
      { label: "Measuring", body: "We measure linear feet of upper and lower runs separately. Island and pantry cabinets are quoted independently." },
    ],
  },
  CUSTOM_CLOSETS: {
    title: "A few things to know about custom closets",
    items: [
      { label: "Realistic timelines", body: "Most closet systems are designed, built, and installed within 3–5 weeks." },
      { label: "The zones approach", body: "Great closets are divided into zones — long hang, double hang, folded items, drawers, and shoe storage. Telling us your wardrobe split helps us design the right layout." },
      { label: "Lighting", body: "Built-in LED lighting dramatically improves usability and is easier to add during build than after." },
      { label: "Material choices", body: "Melamine is durable and budget-conscious. Painted wood gives a furniture-quality look. Open wood shelving adds warmth." },
    ],
  },
  FLOATING_SHELVES: {
    title: "A few things to know about floating shelves",
    items: [
      { label: "Realistic timelines", body: "Floating shelf projects are typically completed in 1–2 days." },
      { label: "Weight capacity", body: "The mounting system matters more than the shelf itself. We use heavy-duty hidden brackets rated for 50–100lbs per shelf depending on span." },
      { label: "Depth and span", body: "Standard depth is 10–12 inches for decor, 12–16 inches for books or storage. Spans over 48 inches need a center support or thicker shelf stock to prevent sag." },
      { label: "Wood options", body: "Solid hardwood (walnut, oak, maple) is premium and durable. Pine with a stain finish is a great value option. Live edge slabs add natural character." },
    ],
  },
  MANTELS: {
    title: "A few things to know about custom mantels",
    items: [
      { label: "Realistic timelines", body: "Mantel projects typically take 2–4 weeks from design to installation." },
      { label: "Clearance requirements", body: "Building code requires specific clearances between the firebox opening and combustible materials. We always design to code." },
      { label: "Surround vs. shelf only", body: "A full surround (legs + header + shelf) makes a dramatic statement. A shelf-only mantel is simpler and works well on a flat surround or shiplap feature wall." },
      { label: "Material choices", body: "Painted MDF gives a clean, traditional look. Stained wood adds warmth. Stone or tile surrounds paired with a wood mantel shelf are a popular combination." },
    ],
  },
  TRIM_WORK: {
    title: "A few things to know about trim work",
    items: [
      { label: "Realistic timelines", body: "Single-room trim projects typically take 1–3 days. Whole-home trim can be 1–2 weeks." },
      { label: "Profile selection", body: "Crown molding profiles range from simple 2-piece to elaborate 5-piece built-up assemblies. Larger rooms and higher ceilings can handle larger profiles." },
      { label: "Paint grade vs. stain grade", body: "Most trim is paint grade (MDF or poplar) for a clean, crisp finish. Stain-grade trim (oak, alder) is used when matching existing wood floors or cabinetry." },
      { label: "Board and batten sizing", body: "Panel width is typically 8–12 inches. Batten width is 2–3 inches. The ratio of panel to batten creates very different visual effects." },
    ],
  },
  MULTIPLE: {
    title: "Tell us about your project",
    items: null,
    prose: "We work on a wide range of custom woodwork projects. The more detail you share below, the better we can design something that fits your space and vision perfectly.",
  },
  OTHER: {
    title: "Tell us about your project",
    items: null,
    prose: "We work on a wide range of custom woodwork projects. The more detail you share below, the better we can design something that fits your space and vision perfectly.",
  },
};

function ServiceContextBlock({ serviceType }: { serviceType: IntakeServiceType }) {
  const ctx = SERVICE_CONTEXT[serviceType];
  return (
    <div className="rounded-xl bg-navy/[0.06] border border-navy/15 p-5">
      <h3 className="font-ui font-bold text-navy text-base mb-3">{ctx.title}</h3>
      {ctx.prose ? (
        <p className="text-charcoal text-sm leading-relaxed">{ctx.prose}</p>
      ) : (
        <ul className="space-y-2.5">
          {ctx.items?.map((item) => (
            <li key={item.label} className="flex gap-2 text-sm leading-relaxed">
              <span className="text-red flex-shrink-0 mt-0.5">✦</span>
              <span className="text-charcoal">
                <strong className="font-semibold">{item.label}:</strong> {item.body}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
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
        <div className="space-y-5">
          {[
            { key: "doorCount", label: "Single or double door?", opts: ["Single", "Double"] },
            { key: "doorType", label: "Bypass (slides past) or standard slide?", opts: ["Bypass", "Standard slide"] },
            { key: "hardware", label: "Hardware finish preference", opts: ["Black", "Brushed Nickel", "Bronze", "Not Sure"] },
          ].map(({ key, label, opts }) => (
            <div key={key}>
              <label className={Q}>{label}</label>
              <div className="flex flex-wrap gap-2">
                {opts.map((o) => (
                  <ToggleChip key={o} label={o} selected={sel(key) === o} onToggle={() => update(key, o)} />
                ))}
              </div>
            </div>
          ))}
          <div>
            <label className={Q}>Approximate opening size (W × H in feet)</label>
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
        <div className="space-y-5">
          {[
            { key: "buildType", label: "New build or refacing existing?", opts: ["New build", "Refacing existing"] },
            { key: "cabinetLevel", label: "Upper, lower, or both?", opts: ["Upper only", "Lower only", "Both"] },
            { key: "doorStyle", label: "Door style preference", opts: ["Shaker", "Flat panel", "Raised panel", "Open shelving", "Not Sure"] },
          ].map(({ key, label, opts }) => (
            <div key={key}>
              <label className={Q}>{label}</label>
              <div className="flex flex-wrap gap-2">
                {opts.map((o) => (
                  <ToggleChip key={o} label={o} selected={sel(key) === o} onToggle={() => update(key, o)} />
                ))}
              </div>
            </div>
          ))}
          <div>
            <label className={Q}>Approximate linear feet of cabinetry</label>
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
        <div className="space-y-5">
          {[
            { key: "closetType", label: "Walk-in or reach-in?", opts: ["Walk-in", "Reach-in"] },
            { key: "storagePriority", label: "Storage priority", opts: ["Hanging space", "Drawer space", "Balanced"] },
          ].map(({ key, label, opts }) => (
            <div key={key}>
              <label className={Q}>{label}</label>
              <div className="flex flex-wrap gap-2">
                {opts.map((o) => (
                  <ToggleChip key={o} label={o} selected={sel(key) === o} onToggle={() => update(key, o)} />
                ))}
              </div>
            </div>
          ))}
          <div>
            <label className={Q}>Special storage needs? <span className="font-normal text-gray-mid text-base">(optional)</span></label>
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
        <div className="space-y-5">
          <div>
            <label className={Q}>Beam orientation</label>
            <div className="flex flex-wrap gap-2">
              {["Parallel runs", "Grid/coffers", "Single accent beam"].map((o) => (
                <ToggleChip key={o} label={o} selected={sel("orientation") === o} onToggle={() => update("orientation", o)} />
              ))}
            </div>
          </div>
          {[
            { key: "ceilingHeight", label: "Ceiling height (approx)", placeholder: "e.g. 9 feet" },
            { key: "beamCount", label: "How many beams?", placeholder: "rough count or \"not sure\"" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className={Q}>{label}</label>
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
        <div className="space-y-5">
          <div>
            <label className={Q}>Decorative or functional storage?</label>
            <div className="flex flex-wrap gap-2">
              {["Decorative", "Functional storage", "Both"].map((o) => (
                <ToggleChip key={o} label={o} selected={sel("use") === o} onToggle={() => update("use", o)} />
              ))}
            </div>
          </div>
          {[
            { key: "shelfCount", label: "How many shelves?", placeholder: "e.g. 3" },
            { key: "shelfLength", label: "Approximate length per shelf", placeholder: "e.g. 5 feet" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className={Q}>{label}</label>
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
        <div className="space-y-5">
          {[
            { key: "fireplaceType", label: "Existing fireplace or new build?", opts: ["Existing", "New build"] },
            { key: "insertType", label: "Fireplace type", opts: ["Gas", "Wood-burning", "Electric insert"] },
            { key: "scope", label: "Scope", opts: ["Surround included", "Mantel shelf only"] },
          ].map(({ key, label, opts }) => (
            <div key={key}>
              <label className={Q}>{label}</label>
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
        <div className="space-y-5">
          <div>
            <label className={Q}>Type needed <span className="font-normal text-gray-mid text-base">(select all that apply)</span></label>
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
            <label className={Q}>Approximate square footage of space</label>
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
  const showOtherSpace = data.space === "Other";
  const showCustomStyle = (data.styles ?? []).includes("Custom/Not Sure");
  const showAsapDate = data.timeline === "ASAP";
  const hasServiceFields = serviceType !== "MULTIPLE" && serviceType !== "OTHER";

  return (
    <div className="space-y-8">

      {/* Fix 1 — Space selection + conditional "Other" input */}
      <div>
        <label className={Q}>
          What&apos;s the space we&apos;re working in?
        </label>
        <select
          value={data.space ?? ""}
          onChange={(e) => onChange({ space: e.target.value, spaceOther: undefined })}
          className="w-full border border-gray-warm rounded-lg px-4 py-3 text-charcoal focus:outline-none focus:border-red bg-white"
        >
          <option value="">Select a space...</option>
          {SPACES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {showOtherSpace && (
          <input
            type="text"
            placeholder="What space are you working in?"
            value={data.spaceOther ?? ""}
            onChange={(e) => onChange({ spaceOther: e.target.value })}
            className="mt-3 w-full border border-gray-warm rounded-lg px-4 py-3 text-charcoal focus:outline-none focus:border-red"
            autoFocus
          />
        )}
      </div>

      {/* Fix 4 — Style chips + "Custom/Not Sure" freeform */}
      <div>
        <label className={Q}>
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
        {showCustomStyle && (
          <input
            type="text"
            placeholder="Describe your style in your own words"
            value={data.styleCustomNote ?? ""}
            onChange={(e) => onChange({ styleCustomNote: e.target.value })}
            className="mt-3 w-full border border-gray-warm rounded-lg px-4 py-3 text-charcoal focus:outline-none focus:border-red"
          />
        )}
      </div>

      {/* Budget */}
      <div>
        <label className={Q}>
          Budget range? <span className="font-normal text-gray-mid text-base">(optional)</span>
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

      {/* Fix 5 — Timeline + conditional ASAP date */}
      <div>
        <label className={Q}>
          When are you hoping to have this done?
        </label>
        <div className="flex flex-wrap gap-2">
          {TIMELINES.map((t) => (
            <ToggleChip
              key={t}
              label={t}
              selected={data.timeline === t}
              onToggle={() => onChange({ timeline: t, asapDate: undefined })}
            />
          ))}
        </div>
        {showAsapDate && (
          <div className="mt-3">
            <label className="block text-sm font-ui font-semibold text-gray-mid mb-1.5">
              Do you have a specific date in mind? <span className="font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={data.asapDate ?? ""}
              onChange={(e) => onChange({ asapDate: e.target.value })}
              className="w-full border border-gray-warm rounded-lg px-4 py-3 text-charcoal focus:outline-none focus:border-red bg-white"
            />
          </div>
        )}
      </div>

      {/* Fix 6 — Service context block + service-specific fields */}
      <div className="border-t border-gray-warm pt-6 space-y-6">
        <ServiceContextBlock serviceType={serviceType} />
        {hasServiceFields && (
          <ServiceSpecificFields serviceType={serviceType} data={data} onChange={onChange} />
        )}
      </div>

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
