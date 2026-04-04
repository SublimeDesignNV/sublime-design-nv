"use client";

type Props = {
  firstName: string;
  onNext: () => void;
};

export default function WelcomeStep({ firstName, onNext }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
      <div className="mb-8">
        <div className="w-16 h-1 bg-red mx-auto mb-8" />
        <h1 className="font-display text-4xl md:text-5xl text-charcoal mb-4">
          Hi {firstName},<br />let&apos;s bring your vision to life.
        </h1>
        <p className="text-gray-mid text-lg max-w-md mx-auto leading-relaxed">
          We&apos;re going to ask a few questions, then have you share photos and
          inspiration. At the end, we&apos;ll show you an <strong className="text-charcoal">AI concept of your
          project</strong> — so you know exactly what you want before a bid is ever written.
        </p>
      </div>
      <button
        onClick={onNext}
        className="bg-red text-white font-ui font-bold text-lg px-10 py-4 rounded-lg hover:bg-red-dark transition-colors"
      >
        Let&apos;s Go →
      </button>
      <p className="text-gray-mid text-sm mt-4">Takes about 5 minutes</p>
    </div>
  );
}
