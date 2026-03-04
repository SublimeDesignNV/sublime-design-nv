import Link from "next/link";
import { Check, Play, Star } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import { SERVICES, SITE, VALUE_PROPS } from "@/lib/constants";
import { getPublishedAssets } from "@/lib/portfolio.server";

const REVIEWS = [
  {
    name: "Olga Hathaway",
    text: "BCW did an excellent job on our project. Easy to contact and schedule, punctual, project done in a timely manner. Highly recommend!",
  },
  {
    name: "Kimberly Garcia",
    text: "Brandon and his crew did such an amazing job with our built-in entertainment center. True craftsmanship — all of our expectations were met.",
  },
  {
    name: "Ron Ramsey",
    text: "The crown moulding is beautiful and very reasonably priced. They finished by cleaning everything up. I would highly recommend BCW to anyone.",
  },
] as const;

const TRUST_ITEMS = [
  "Free Estimates",
  "14+ Years Experience",
  "Las Vegas Based",
  "Residential & Commercial",
] as const;

function featuredLabel(asset: {
  tags: Array<{ slug: string; title: string }>;
}) {
  const first = asset.tags[0];
  if (!first) return "Featured";
  if (asset.tags.length === 1) return first.title;
  return `${first.title} +${asset.tags.length - 1}`;
}

export default async function HomePage() {
  const featuredAssets = (await getPublishedAssets()).slice(0, 6);

  return (
    <main className="pt-20">
      <section className="relative min-h-screen overflow-hidden bg-navy pt-20">
        <div className="pointer-events-none absolute inset-0">
          <SafeImage
            src="/images/hero-bg.jpg"
            alt=""
            className="h-full w-full opacity-25"
            imgClassName="h-full w-full object-cover"
          />
        </div>
        <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col items-center justify-center px-4 text-center md:px-8">
          <p className="font-ui text-sm uppercase tracking-widest text-red">
            Las Vegas, Nevada
          </p>
          <h1 className="mt-4 text-5xl leading-none text-white sm:text-6xl md:text-7xl">
            <span className="block">Custom Woodwork</span>
            <span className="block">Elevated.</span>
          </h1>
          <p className="mt-6 max-w-3xl text-base text-white/70 md:text-lg">
            From custom barn doors to full trim packages — we design and build
            woodwork that transforms your home into something unforgettable.
          </p>
          <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Link
              href="/get-a-quote"
              className="font-ui rounded-sm bg-red px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-dark"
            >
              Get a Free Estimate
            </Link>
            <Link
              href="/gallery"
              className="font-ui rounded-sm border border-white px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              View Our Work
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_ITEMS.map((item) => (
              <div key={item} className="flex items-center justify-center gap-2">
                <Check className="h-4 w-4 text-red" />
                <span className="font-ui text-sm text-white/80">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <p className="font-ui text-sm uppercase tracking-widest text-red">
            What We Do
          </p>
          <h2 className="mt-3 text-4xl text-charcoal md:text-5xl">
            Our Services
          </h2>
          <p className="mt-4 max-w-3xl text-base text-gray-mid">
            Every project is custom-built to your exact specifications. No
            templates. No shortcuts.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SERVICES.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-lg"
              >
                <div className="h-48 overflow-hidden">
                  <SafeImage
                    src={`/images/services/${service.slug}/1.jpg`}
                    alt={service.title}
                    className="h-full w-full"
                    imgClassName="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-3xl text-charcoal">{service.shortTitle}</h3>
                  <p className="mt-3 h-12 overflow-hidden text-sm leading-6 text-gray-mid">
                    {service.description}
                  </p>
                  <span className="font-ui mt-4 inline-block text-sm font-semibold text-red">
                    Learn More →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-ui text-sm uppercase tracking-widest text-red">
                Portfolio
              </p>
              <h2 className="mt-3 text-4xl text-charcoal md:text-5xl">
                Featured Work
              </h2>
            </div>
            <Link
              href="/gallery"
              className="font-ui text-sm font-semibold text-navy transition-colors hover:text-red"
            >
              View Full Gallery →
            </Link>
          </div>

          {featuredAssets.length === 0 ? (
            <div className="mt-10">
              <p className="font-ui text-sm text-gray-mid">Portfolio coming soon.</p>
              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="aspect-square rounded-lg bg-gray-warm" />
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
              {featuredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="group relative aspect-square overflow-hidden rounded-lg"
                >
                  {asset.kind === "IMAGE" ? (
                    <img
                      src={asset.secureUrl}
                      alt={asset.alt || featuredLabel(asset)}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <a
                      href={asset.secureUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-full w-full items-center justify-center bg-charcoal"
                    >
                      <Play className="h-12 w-12 text-white/80" />
                    </a>
                  )}
                  <div className="absolute inset-0 flex items-end bg-black/0 p-3 transition-colors duration-300 group-hover:bg-black/30">
                    <span className="font-ui rounded-sm bg-white/90 px-2 py-1 text-xs font-semibold text-charcoal opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {featuredLabel(asset)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-navy py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <p className="font-ui text-sm uppercase tracking-widest text-red">
            Why Sublime Design
          </p>
          <h2 className="mt-3 text-4xl md:text-5xl">
            The Difference Is In The Details
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_PROPS.map((item) => (
              <article
                key={item.number}
                className="rounded-lg border border-white/10 p-6 transition hover:border-red/50"
              >
                <p className="font-ui text-4xl font-bold text-red/40">{item.number}</p>
                <h3 className="mt-4 text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/60">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-warm py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <p className="font-ui text-sm uppercase tracking-widest text-red">
            Testimonials
          </p>
          <h2 className="mt-3 text-4xl text-charcoal md:text-5xl">
            What Our Clients Say
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {REVIEWS.map((review) => (
              <article key={review.name} className="rounded-lg bg-white p-6 shadow-sm">
                <div className="flex items-center gap-1 text-red">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm italic leading-6 text-gray-mid">
                  &ldquo;{review.text}&rdquo;
                </p>
                <p className="font-ui mt-5 text-sm font-bold text-charcoal">
                  {review.name}
                </p>
                <p className="font-ui mt-1 text-xs text-gray-mid">Google Review</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-red py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-8">
          <h2 className="text-4xl md:text-5xl">Ready to Start Your Project?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/90">
            Call us today or fill out our quick quote form. We&apos;ll get back to
            you within 24 hours.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={SITE.phoneHref}
              className="font-ui rounded-sm border border-white px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Call {SITE.phone}
            </a>
            <Link
              href="/get-a-quote"
              className="font-ui rounded-sm bg-white px-6 py-3 text-sm font-semibold text-red transition-colors hover:opacity-90"
            >
              Get a Free Quote
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
