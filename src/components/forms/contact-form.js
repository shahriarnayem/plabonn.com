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
      if (!response.ok) throw new Error(result.message || "Unable to send your message.");
      form.reset();
      setState({ status: "success", message: "Thank you. Your project enquiry has been received." });
    } catch (error) {
      setState({ status: "error", message: error.message || "Something went wrong. Please try again." });
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex="-1" autoComplete="off" /></label></div>
      <div className="form-grid">
        <label><span>Full name *</span><input name="fullName" required minLength="2" /></label>
        <label><span>Email address *</span><input name="email" type="email" required /></label>
        <label><span>Phone</span><input name="phone" type="tel" /></label>
        <label><span>Company</span><input name="company" /></label>
        <label><span>Service</span><select name="service" defaultValue={defaultService}><option value="">Select a service</option>{services.map((service) => <option key={service.slug} value={service.title}>{service.title}</option>)}</select></label>
        <label><span>Budget range</span><select name="budget"><option value="">Select a range</option><option value="$500–$1,000">$500–$1,000</option><option value="$1,000–$2,500">$1,000–$2,500</option><option value="$2,500–$5,000">$2,500–$5,000</option><option value="$5,000+">$5,000+</option></select></label>
      </div>
      <label><span>Project message *</span><textarea name="message" rows="7" required minLength="20" placeholder="Tell me what you need, what already exists and any deadline you are working toward." /></label>
      <label className="checkbox-field"><input type="checkbox" name="consent" required /><span>I agree that my information can be used to respond to this enquiry.</span></label>
      <button className="button button-primary button-large" type="submit" disabled={state.status === "loading"}>{state.status === "loading" ? "Sending…" : "Send enquiry"}<Icon name="arrow" size={16} /></button>
      {state.message ? <p className={`form-status ${state.status}`} role="status">{state.message}</p> : null}
    </form>
  );
}
