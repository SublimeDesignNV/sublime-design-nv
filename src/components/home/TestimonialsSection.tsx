import Link from "next/link";
import type { TestimonialDef } from "@/content/testimonials";
import { findService } from "@/content/services";

const TRUST_ITEMS = [
  "Licensed Nevada contractor",
  "Custom measured and built",
  "Las Vegas Valley service area",
  "Quote-first, no pressure",
] as const;

function StarRating({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} out of 5 stars`} className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-red text-red" : "fill-gray-200 text-gray-200"}`}
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function TestimonialCard({ testimonial }: { testimonial: TestimonialDef }) {
  const primaryService = testimonial.serviceSlugs[0]
    ? findService(testimonial.serviceSlugs[0])
    : null;

  return (
    <figure className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {testimonial.rating ? (
        <StarRating rating={testimonial.rating} />
      ) : null}

      <blockquote className="mt-4 flex-1">
        <p className="text-base leading-7 text-charcoal/90">
          &ldquo;{testimonial.quote}&rdquo;
        </p>
      </blockquote>

      <figcaption className="mt-6 border-t border-gray-100 pt-5">
        <p className="font-ui text-sm font-semibold text-charcoal">{testimonial.name}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="font-ui text-xs text-gray-mid">{testimonial.location}</span>
          {testimonial.roleOrContext ? (
            <>
              <span className="text-gray-200" aria-hidden="true">·</span>
              <span className="font-ui text-xs text-gray-mid">{testimonial.roleOrContext}</span>
            </>
          ) : null}
        </div>
        {primaryService ? (
          <Link
            href={`/services/${primaryService.slug}`}
            className="font-ui mt-2 inline-block text-xs font-medium text-red hover:underline"
          >
            {primaryService.shortTitle} →
          </Link>
        ) : null}
      </figcaption>
    </figure>
  );
}

type Props = {
  testimonials: TestimonialDef[];
};

export default function TestimonialsSection({ testimonials }: Props) {
  if (!testimonials.length) return null;

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-ui text-sm uppercase tracking-widest text-red">Client Reviews</p>
            <h2 className="mt-3 text-4xl text-charcoal md:text-5xl">What Clients Say</h2>
          </div>
          <Link
            href="/projects"
            className="font-ui text-sm font-semibold text-navy transition-colors hover:text-red"
          >
            View Projects →
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.slice(0, 3).map((t) => (
            <TestimonialCard key={t.slug} testimonial={t} />
          ))}
        </div>

        {/* Trust row */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-gray-100 pt-8">
          {TRUST_ITEMS.map((item) => (
            <span key={item} className="flex items-center gap-2 font-ui text-sm text-gray-mid">
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red" aria-hidden="true" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
