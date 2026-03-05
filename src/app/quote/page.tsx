"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type FormState = {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  message: string;
};

const DEFAULT_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  projectType: "floating-shelves",
  message: "",
};

export default function QuotePage() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Unable to submit form.");
      }

      setStatus("success");
      setForm(DEFAULT_FORM);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Unable to submit form.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bg-cream pt-28 pb-20">
      <div className="mx-auto max-w-3xl px-4 md:px-8">
        <p className="font-ui text-sm uppercase tracking-[0.18em] text-red">Get a Free Quote</p>
        <h1 className="mt-3 text-4xl text-charcoal md:text-5xl">Tell Us About Your Project</h1>
        <p className="mt-4 max-w-2xl text-gray-mid">
          Share a few details and we will follow up with next steps and a clear estimate.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-sm text-charcoal">
              Name*
              <input
                required
                type="text"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </label>

            <label className="text-sm text-charcoal">
              Email*
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-sm text-charcoal">
              Phone*
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </label>

            <label className="text-sm text-charcoal">
              Project Type*
              <select
                required
                value={form.projectType}
                onChange={(event) => setForm((prev) => ({ ...prev, projectType: event.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="floating-shelves">Floating Shelves</option>
                <option value="built-ins">Built-ins</option>
                <option value="pantry-pullouts">Pantry Pullouts</option>
                <option value="closet-systems">Closet Systems</option>
                <option value="other">Other Finish Carpentry</option>
              </select>
            </label>
          </div>

          <label className="block text-sm text-charcoal">
            Project Details*
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Room, scope, timeline, and anything else helpful."
            />
          </label>

          <div className="rounded-md border border-dashed border-gray-300 bg-cream p-3 text-sm text-gray-mid">
            Optional photo upload is coming next.
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="font-ui rounded-sm bg-red px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-dark disabled:opacity-60"
          >
            {isSubmitting ? "Sending..." : "Submit Quote Request"}
          </button>

          {status === "success" ? (
            <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              Thanks, your request was sent. Expect a response within one business day.
            </div>
          ) : null}

          {status === "error" ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}
        </form>

        <p className="mt-6 text-sm text-gray-mid">
          Prefer to call? <a href="tel:+17028479016" className="font-semibold text-red">(702) 847-9016</a>
          {" "}or go back to <Link href="/" className="font-semibold text-red">home</Link>.
        </p>
      </div>
    </main>
  );
}
