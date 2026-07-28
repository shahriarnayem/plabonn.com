"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";

export function HomepageEditor() {
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/cms/homepage", { cache: "no-store" }).then((response) => response.json()).then((result) => setForm(result.item));
  }, []);

  if (!form) return <div className="dashboard-loading card">Loading homepage content…</div>;
  const update = (path, value) => {
    const [group, key] = path.split(".");
    if (key) setForm((current) => ({ ...current, [group]: { ...current[group], [key]: value } }));
    else setForm((current) => ({ ...current, [path]: value }));
  };

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    const response = await fetch("/api/cms/homepage", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const result = await response.json();
    setStatus({ type: response.ok ? "success" : "error", message: result.message });
    setSaving(false);
  }

  return (
    <section className="dashboard-section">
      <div className="dashboard-page-head"><div><p className="eyebrow">Homepage CMS</p><h1>Homepage</h1><p>Edit every heading, paragraph, button and profile detail used in the homepage grid.</p></div><a className="button button-secondary" href="/" target="_blank">Preview homepage<Icon name="external" size={15}/></a></div>
      {status ? <div className={`dashboard-notice ${status.type}`}>{status.message}</div> : null}
      <form className="settings-form" onSubmit={save}>
        <SettingsGroup title="Hero card" description="The two-column heading card and profile image.">
          <Field label="Eyebrow"><input value={form.hero?.eyebrow || ""} onChange={(e) => update("hero.eyebrow", e.target.value)} /></Field>
          <Field label="Heading" wide><textarea rows="4" value={form.hero?.heading || ""} onChange={(e) => update("hero.heading", e.target.value)} /></Field>
          <Field label="Paragraph" wide><textarea rows="4" value={form.hero?.paragraph || ""} onChange={(e) => update("hero.paragraph", e.target.value)} /></Field>
          <Field label="Button text"><input value={form.hero?.ctaText || ""} onChange={(e) => update("hero.ctaText", e.target.value)} /></Field>
          <Field label="Button URL"><input value={form.hero?.ctaUrl || ""} onChange={(e) => update("hero.ctaUrl", e.target.value)} /></Field>
          <Field label="Availability text"><input value={form.hero?.availability || ""} onChange={(e) => update("hero.availability", e.target.value)} /></Field>
          <Field label="Portrait image URL"><input type="url" value={form.hero?.image || ""} onChange={(e) => update("hero.image", e.target.value)} /></Field>
          <Field label="Portrait alt text" wide><input value={form.hero?.imageAlt || ""} onChange={(e) => update("hero.imageAlt", e.target.value)} /></Field>
        </SettingsGroup>
        <SettingsGroup title="About card" description="The tall summary card beside the portrait.">
          <Field label="Label"><input value={form.about?.label || ""} onChange={(e) => update("about.label", e.target.value)} /></Field>
          <Field label="Experience"><input value={form.about?.experience || ""} onChange={(e) => update("about.experience", e.target.value)} /></Field>
          <Field label="Main biography" wide><textarea rows="5" value={form.about?.bio || ""} onChange={(e) => update("about.bio", e.target.value)} /></Field>
          <Field label="Secondary biography" wide><textarea rows="5" value={form.about?.secondary || ""} onChange={(e) => update("about.secondary", e.target.value)} /></Field>
          <Field label="Skills, one per line" wide><textarea rows="5" value={(form.about?.skills || []).join("\n")} onChange={(e) => update("about.skills", e.target.value.split("\n").filter(Boolean))} /></Field>
        </SettingsGroup>
        <SettingsGroup title="Section headings" description="Heading and support copy for Works, Reviews, CTA and Blog.">
          {[
            ["worksHeading", "Works heading", true], ["worksDescription", "Works description", true],
            ["reviewsHeading", "Reviews heading", true], ["reviewsDescription", "Reviews description", true],
            ["ctaHeading", "CTA heading", true], ["ctaSupporting", "CTA supporting text", true],
            ["ctaText", "CTA button text"], ["ctaUrl", "CTA button URL"],
            ["blogHeading", "Blog heading", true], ["blogDescription", "Blog description", true],
          ].map(([name, label, wide]) => <Field key={name} label={label} wide={wide}>{wide ? <textarea rows="3" value={form[name] || ""} onChange={(e) => update(name, e.target.value)} /> : <input value={form[name] || ""} onChange={(e) => update(name, e.target.value)} />}</Field>)}
        </SettingsGroup>
        <div className="settings-save-bar"><button className="button button-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save homepage"}<Icon name="check" size={15}/></button></div>
      </form>
    </section>
  );
}

function SettingsGroup({ title, description, children }) { return <section className="card settings-group"><header><h2>{title}</h2><p>{description}</p></header><div className="settings-fields">{children}</div></section>; }
function Field({ label, wide, children }) { return <label className={`dashboard-field ${wide ? "dashboard-field-wide" : ""}`}><span>{label}</span>{children}</label>; }
