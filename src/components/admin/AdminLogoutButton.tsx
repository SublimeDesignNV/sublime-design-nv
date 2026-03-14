"use client";

import { useState } from "react";

export default function AdminLogoutButton() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      window.location.assign("/admin/login");
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isSubmitting}
      className="rounded-full border border-gray-200 bg-white px-4 py-1.5 font-ui text-xs font-medium text-charcoal transition hover:border-red hover:text-red disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isSubmitting ? "Signing Out..." : "Logout"}
    </button>
  );
}
