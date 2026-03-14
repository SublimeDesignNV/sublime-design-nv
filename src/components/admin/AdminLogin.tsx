"use client";

import { FormEvent, useState } from "react";

type AdminLoginProps = {
  nextPath?: string;
};

export default function AdminLogin({ nextPath = "/admin" }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, nextPath }),
      });

      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        redirectTo?: string;
      };

      if (!response.ok) {
        setError(body.error || "Invalid admin password.");
        return;
      }

      window.location.assign(body.redirectTo || nextPath);
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto mt-28 max-w-md rounded-lg border border-gray-warm bg-white p-6 shadow-sm">
      <h1 className="text-3xl text-charcoal">Admin Login</h1>
      <p className="font-ui mt-2 text-sm text-gray-mid">
        Sign in with the admin password to access uploads, leads, content audit, and launch audit.
      </p>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="font-ui text-sm font-semibold text-charcoal">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy"
            required
            autoComplete="current-password"
          />
        </label>

        {error ? <p className="font-ui text-sm text-red">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="font-ui rounded-sm bg-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
