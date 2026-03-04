"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { SERVICES, SITE } from "@/lib/constants";

function FooterLogo() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className="font-display text-2xl text-white">{SITE.name}</span>;
  }

  return (
    <img
      src="/images/logo-dark.png"
      alt="Sublime Design NV"
      className="h-12 w-auto"
      onError={() => setFailed(true)}
    />
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-charcoal text-white">
      <div className="bg-red">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-8">
          <p className="font-ui text-xl font-semibold md:text-2xl">
            Ready to transform your space?
          </p>
          <Link
            href="/get-a-quote"
            className="font-ui inline-flex w-fit rounded-sm bg-white px-4 py-2 text-sm font-semibold text-red transition-opacity hover:opacity-90"
          >
            GET A FREE QUOTE
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-16 md:grid-cols-3 md:px-8">
        <div className="space-y-4">
          <Link href="/" aria-label={SITE.name} className="inline-block">
            <FooterLogo />
          </Link>
          <p className="font-ui text-sm text-white/80">{SITE.tagline}</p>
          <p className="font-ui text-sm text-white/80">Las Vegas, NV</p>
        </div>

        <div>
          <h3 className="font-ui text-base font-semibold text-white">Services</h3>
          <ul className="mt-4 space-y-2">
            {SERVICES.map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  className="font-ui text-sm text-white/80 transition-colors hover:text-white"
                >
                  {service.shortTitle}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-ui text-base font-semibold text-white">Contact</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-white/80" />
              <a
                href={SITE.phoneHref}
                className="font-ui text-sm text-white/80 transition-colors hover:text-white"
              >
                {SITE.phone}
              </a>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/80" />
              <a
                href={SITE.emailHref}
                className="font-ui text-sm text-white/80 transition-colors hover:text-white"
              >
                {SITE.email}
              </a>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/80" />
              <a
                href={SITE.addressHref}
                className="font-ui text-sm text-white/80 transition-colors hover:text-white"
              >
                {SITE.address}
              </a>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-white/80" />
              <div className="font-ui text-sm text-white/80">
                <p>{SITE.hours.weekdays}</p>
                <p>{SITE.hours.weekend}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
          <p className="font-ui text-center text-sm text-white/70 md:text-left">
            &copy; {year} {SITE.name}. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
