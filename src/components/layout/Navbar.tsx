"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { SITE } from "@/lib/constants";
import { ACTIVE_SERVICES } from "@/content/services";

function Logo() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className="font-display text-2xl text-navy">{SITE.name}</span>;
  }

  return (
    <img
      src="/images/logo-light.png"
      alt="Sublime Design NV"
      className="h-12 w-auto"
      onError={() => setFailed(true)}
    />
  );
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setServicesOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const closeMenus = () => {
    setMobileOpen(false);
    setServicesOpen(false);
  };

  return (
    <header
      className={`fixed top-0 z-50 h-16 w-full bg-white transition-shadow ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4 md:px-8">
        <Link href="/" aria-label={SITE.name} className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          <Link
            href="/"
            className="font-ui text-sm font-semibold tracking-wide text-charcoal transition-colors hover:text-red"
          >
            HOME
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button
              type="button"
              className="font-ui inline-flex items-center gap-1 text-sm font-semibold tracking-wide text-charcoal transition-colors hover:text-red"
              aria-haspopup="menu"
              aria-expanded={servicesOpen}
              onClick={() => setServicesOpen((prev) => !prev)}
            >
              SERVICES
              <ChevronDown className="h-4 w-4" />
            </button>

            {servicesOpen ? (
              <div className="absolute left-1/2 top-full mt-3 w-[28rem] -translate-x-1/2 rounded-sm border border-gray-warm bg-white p-4 shadow-lg">
                <div className="grid grid-cols-2 gap-2">
                  {ACTIVE_SERVICES.map((service) => (
                    <Link
                      key={service.slug}
                      href={`/services/${service.slug}`}
                      className="font-ui rounded-sm px-2 py-1 text-sm text-charcoal transition-colors hover:bg-gray-warm hover:text-red"
                      onClick={() => setServicesOpen(false)}
                    >
                      {service.shortTitle}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <Link
            href="/gallery"
            className="font-ui text-sm font-semibold tracking-wide text-charcoal transition-colors hover:text-red"
          >
            OUR WORK
          </Link>
          <Link
            href="/about"
            className="font-ui text-sm font-semibold tracking-wide text-charcoal transition-colors hover:text-red"
          >
            ABOUT
          </Link>
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <a
            href={SITE.phoneHref}
            className="font-ui text-sm font-semibold text-charcoal transition-colors hover:text-red"
          >
            {SITE.phone}
          </a>
          <Link
            href="/quote"
            className="font-ui rounded-sm bg-[#CC2027] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#A01820]"
          >
            GET A FREE QUOTE
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-sm p-2 text-charcoal lg:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="absolute left-0 top-16 w-full border-t border-gray-warm bg-white shadow-md lg:hidden">
          <nav className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 md:px-8">
            <Link
              href="/"
              className="font-ui text-sm font-semibold tracking-wide text-charcoal"
              onClick={closeMenus}
            >
              HOME
            </Link>

            <div className="space-y-2">
              <p className="font-ui text-sm font-semibold tracking-wide text-charcoal">
                SERVICES
              </p>
              <div className="flex flex-col gap-2 pl-4">
                {ACTIVE_SERVICES.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/services/${service.slug}`}
                    className="font-ui text-sm text-charcoal transition-colors hover:text-red"
                    onClick={closeMenus}
                  >
                    {service.shortTitle}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/gallery"
              className="font-ui text-sm font-semibold tracking-wide text-charcoal"
              onClick={closeMenus}
            >
              OUR WORK
            </Link>
            <Link
              href="/about"
              className="font-ui text-sm font-semibold tracking-wide text-charcoal"
              onClick={closeMenus}
            >
              ABOUT
            </Link>

            <div className="mt-2 flex flex-col gap-3 border-t border-gray-warm pt-4">
              <a
                href={SITE.phoneHref}
                className="font-ui text-sm font-semibold text-charcoal"
                onClick={closeMenus}
              >
                {SITE.phone}
              </a>
              <Link
                href="/quote"
                className="font-ui inline-flex w-fit rounded-sm bg-[#CC2027] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#A01820]"
                onClick={closeMenus}
              >
                GET A FREE QUOTE
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
