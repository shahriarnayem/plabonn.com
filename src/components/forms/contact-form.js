"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";

export function ContactForm({ services = [], defaultService = "" }) {
  const [state, setState] = useState({ status: "idle", message: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    setState({ status: "loading", message: "Sending your message…" });

    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.consent = payload.consent === "on";

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Unable to send your message.");
      }
      form.reset();
      setState({
        status: "success",
        message: "Thank you. Your project enquiry has been received.",
      });
    } catch (error) {
      setState({
        status: "error",
        message: error.message || "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex="-1" autoComplete="off" />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">
            Full name *
          </span>
          <input
            className="w-full rounded-[8px] bg-[var(--card-soft)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            name="fullName"
            required
            minLength="2"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">
            Email address *
          </span>
          <input
            className="w-full rounded-[8px] bg-[var(--card-soft)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            name="email"
            type="email"
            required
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">
            Phone
          </span>
          <input
            className="w-full rounded-[8px] bg-[var(--card-soft)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            name="phone"
            type="tel"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">
            Company
          </span>
          <input
            className="w-full rounded-[8px] bg-[var(--card-soft)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            name="company"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">
            Service
          </span>
          <select
            className="w-full cursor-pointer appearance-none rounded-[8px] bg-[var(--card-soft)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            name="service"
            defaultValue={defaultService}
          >
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service.slug} value={service.title}>
                {service.title}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">
            Budget range
          </span>
          <select
            className="w-full cursor-pointer appearance-none rounded-[8px] bg-[var(--card-soft)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            name="budget"
          >
            <option value="">Select a range</option>
            <option value="$500–$1,000">$500–$1,000</option>
            <option value="$1,000–$2,500">$1,000–$2,500</option>
            <option value="$2,500–$5,000">$2,500–$5,000</option>
            <option value="$5,000+">$5,000+</option>
          </select>
        </label>
      </div>

      <label className="grid gap-1.5">
        <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">
          Project message *
        </span>
        <textarea
          className="w-full resize-y rounded-[8px] bg-[var(--card-soft)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          name="message"
          rows="7"
          required
          minLength="20"
          placeholder="Tell me what you need, what already exists and any deadline you are working toward."
        />
      </label>

      <label className="flex items-start gap-2.5 text-sm text-[var(--text-soft)]">
        <input
          className="mt-1 h-4 w-4 shrink-0 accent-[#9a000f]"
          type="checkbox"
          name="consent"
          required
        />
        <span>I agree that my information can be used to respond to this enquiry.</span>
      </label>

      <button
        className="inline-flex min-h-[46px] w-fit cursor-pointer items-center justify-center gap-2.5 rounded-[7px] bg-[var(--accent)] px-5 py-2 text-xs font-bold uppercase tracking-[0.015em] text-white transition-colors duration-150 hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-55"
        type="submit"
        disabled={state.status === "loading"}
      >
        {state.status === "loading" ? "Sending…" : "Send enquiry"}
        <Icon name="arrow" size={16} />
      </button>

      {state.message ? (
        <p
          className={`rounded-[8px] px-3.5 py-3 text-xs ${
            state.status === "success"
              ? "bg-[var(--card-soft)] text-[var(--success)]"
              : state.status === "error"
                ? "bg-[var(--card-soft)] text-[var(--danger)]"
                : "bg-[var(--card-soft)] text-[var(--text-soft)]"
          }`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
