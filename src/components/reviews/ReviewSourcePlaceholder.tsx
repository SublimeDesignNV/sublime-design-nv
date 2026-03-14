import Link from "next/link";
import type { ReviewDef } from "@/content/reviews";
import { REVIEW_SOURCE } from "@/lib/reviews.config";

type ReviewSourcePlaceholderProps = {
  reviews?: ReviewDef[];
  className?: string;
  compact?: boolean;
  eyebrow?: string;
  title?: string;
  subheading?: string;
  emptyBehavior?: "hide" | "placeholder";
  ctaHref?: string;
  ctaLabel?: string;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          className={`h-4 w-4 ${index < rating ? "fill-red text-red" : "fill-gray-200 text-gray-200"}`}
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({
  review,
  compact,
}: {
  review: ReviewDef;
  compact: boolean;
}) {
  return (
    <article className={`rounded-xl border border-gray-200 bg-white shadow-sm ${compact ? "p-5" : "p-6"}`}>
      <StarRating rating={review.rating} />
      <p className={`mt-4 text-charcoal/90 ${compact ? "text-sm leading-6" : "text-base leading-7"}`}>
        &ldquo;{review.quote}&rdquo;
      </p>
      <div className="mt-5 border-t border-gray-100 pt-4">
        <p className="font-ui text-sm font-semibold text-charcoal">{review.name}</p>
        <p className="font-ui mt-1 text-xs text-gray-mid">
          {review.location}
          {review.sourceLabel ? ` · ${review.sourceLabel}` : ""}
        </p>
      </div>
    </article>
  );
}

export default function ReviewSourcePlaceholder({
  reviews = [],
  className = "",
  compact = false,
  eyebrow,
  title,
  subheading,
  emptyBehavior = "placeholder",
  ctaHref = "/quote",
  ctaLabel = "Start with a Quote",
}: ReviewSourcePlaceholderProps) {
  if (!reviews.length && emptyBehavior === "hide") {
    return null;
  }

  if (!reviews.length) {
    return (
      <div className={`rounded-xl border border-gray-200 bg-cream ${compact ? "p-4" : "p-5"} ${className}`}>
        <p className="font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">
          {eyebrow ?? REVIEW_SOURCE.heading}
        </p>
        <p className={`mt-2 text-sm text-charcoal ${compact ? "" : "max-w-2xl leading-6"}`}>
          {REVIEW_SOURCE.futureIntegrationNote}
        </p>
      </div>
    );
  }

  return (
    <section className={className}>
      <div className={compact ? "" : "flex flex-col gap-4 md:flex-row md:items-end md:justify-between"}>
        <div>
          <p className="font-ui text-sm uppercase tracking-widest text-red">
            {eyebrow ?? REVIEW_SOURCE.heading}
          </p>
          <h2 className={`mt-3 text-charcoal ${compact ? "text-2xl md:text-3xl" : "text-4xl md:text-5xl"}`}>
            {title ?? "Trusted by Homeowners Across the Valley"}
          </h2>
          <p className={`mt-3 max-w-3xl text-gray-mid ${compact ? "text-sm leading-6" : "text-base"}`}>
            {subheading ?? REVIEW_SOURCE.subheading}
          </p>
        </div>
        {!compact ? (
          <Link
            href={ctaHref}
            className="font-ui text-sm font-semibold text-navy transition-colors hover:text-red"
          >
            {ctaLabel}
          </Link>
        ) : null}
      </div>

      <div className={`mt-8 grid grid-cols-1 gap-6 ${compact ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
        {reviews.slice(0, compact ? 2 : 3).map((review) => (
          <ReviewCard key={review.slug} review={review} compact={compact} />
        ))}
      </div>
    </section>
  );
}
