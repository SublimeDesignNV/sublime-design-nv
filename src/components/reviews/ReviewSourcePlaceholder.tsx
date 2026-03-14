import Link from "next/link";
import { REVIEW_SOURCE } from "@/lib/reviews.config";

type ReviewSourcePlaceholderProps = {
  className?: string;
  compact?: boolean;
};

export default function ReviewSourcePlaceholder({
  className = "",
  compact = false,
}: ReviewSourcePlaceholderProps) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-cream ${compact ? "p-4" : "p-5"} ${className}`}>
      <p className="font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">
        Reviews
      </p>
      <p className={`mt-2 text-sm text-charcoal ${compact ? "" : "max-w-2xl leading-6"}`}>
        {REVIEW_SOURCE.placeholderCopy}
      </p>
      {REVIEW_SOURCE.platformLabel ? (
        <Link
          href="/quote"
          className="font-ui mt-3 inline-block text-xs font-semibold text-red hover:underline"
        >
          {REVIEW_SOURCE.platformLabel} proof coming soon
        </Link>
      ) : null}
    </div>
  );
}
