"use client";

import type { IntakeFormData } from "../IntakeForm";

type Props = {
  data: IntakeFormData;
  onChange: (data: Partial<IntakeFormData>) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function FinalNotesStep({ data, onChange, onNext, onBack }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl text-charcoal mb-2">Almost there.</h2>
        <p className="text-gray-mid">A few final questions to complete your vision profile.</p>
      </div>

      <div>
        <label className="block text-sm font-ui font-semibold text-charcoal mb-2">
          Anything else we should know?
        </label>
        <textarea
          rows={4}
          value={data.finalNotes ?? ""}
          onChange={(e) => onChange({ finalNotes: e.target.value })}
          placeholder="Describe your dream outcome, specific materials you want, anything discussed on the call..."
          className="w-full border border-gray-warm rounded-lg px-4 py-3 text-charcoal focus:outline-none focus:border-red resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-ui font-semibold text-charcoal mb-2">
          Is there anything you&apos;ve seen that you absolutely <em>don&apos;t</em> want?{" "}
          <span className="font-normal text-gray-mid">(optional, but very helpful)</span>
        </label>
        <textarea
          rows={3}
          value={data.dontWant ?? ""}
          onChange={(e) => onChange({ dontWant: e.target.value })}
          placeholder="e.g. I don't want anything too rustic, no open shelves in the kitchen..."
          className="w-full border border-gray-warm rounded-lg px-4 py-3 text-charcoal focus:outline-none focus:border-red resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-ui font-semibold text-charcoal mb-2">
          How did you hear about Sublime Design NV?{" "}
          <span className="font-normal text-gray-mid">(optional)</span>
        </label>
        <input
          type="text"
          value={data.howHeard ?? ""}
          onChange={(e) => onChange({ howHeard: e.target.value })}
          placeholder="Google, referral, Instagram..."
          className="w-full border border-gray-warm rounded-lg px-4 py-3 text-charcoal focus:outline-none focus:border-red"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-warm text-charcoal font-ui font-semibold py-4 rounded-lg hover:border-charcoal transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex-[2] bg-red text-white font-ui font-bold py-4 rounded-lg hover:bg-red-dark transition-colors"
        >
          Review & Submit →
        </button>
      </div>
    </div>
  );
}
