"use client";

import Link, { type LinkProps } from "next/link";
import type { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

type TrackedLinkProps = LinkProps & {
  children: ReactNode;
  className?: string;
  eventName?: string;
  eventParams?: Record<string, unknown>;
};

export default function TrackedLink({
  children,
  className,
  eventName,
  eventParams,
  ...linkProps
}: TrackedLinkProps) {
  return (
    <Link
      {...linkProps}
      className={className}
      onClick={() => {
        if (eventName) {
          trackEvent(eventName, eventParams);
        }
      }}
    >
      {children}
    </Link>
  );
}
