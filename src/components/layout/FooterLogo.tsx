"use client";

import Image from "next/image";
import { useState } from "react";
import { SITE } from "@/lib/constants";

export default function FooterLogo() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className="font-display text-2xl text-white">{SITE.name}</span>;
  }

  return (
    <Image
      src="/images/logo-dark.png"
      alt="Sublime Design NV"
      width={160}
      height={48}
      className="h-12 w-auto"
      onError={() => setFailed(true)}
    />
  );
}
