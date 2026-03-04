"use client";

import { useEffect, useMemo, useState } from "react";

export default function BuildDebugBadge() {
  const [enabled, setEnabled] = useState(false);
  const sha = useMemo(() => process.env.NEXT_PUBLIC_BUILD_SHA || "unknown", []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEnabled(params.get("debug") === "1");
  }, []);

  if (!enabled) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 10,
        right: 10,
        zIndex: 9999,
        background: "#111827",
        color: "#fff",
        padding: "6px 10px",
        borderRadius: 8,
        fontSize: 12,
        fontFamily: "monospace",
      }}
    >
      build: {sha}
    </div>
  );
}
