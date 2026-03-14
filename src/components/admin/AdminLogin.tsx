"use client";

import { FormEvent, useState } from "react";

export default function AdminLogin() {
  const [token, setToken] = useState("");
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
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        setError("Invalid admin token.");
        return;
      }

      window.location.reload();
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
        Enter your admin token to access portfolio uploads, leads, content audit, and launch audit.
      </p>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="font-ui text-sm font-semibold text-charcoal">Token</span>
          <input
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            className="mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy"
            required
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
