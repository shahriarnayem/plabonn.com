"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";

export function SettingsEditor({ mode = "general", canEdit = true }) {
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch("/api/cms/settings", { cache: "no-store" }).then((r) => r.json()).then((result) => setForm(result.item)); }, []);
  if (!form) return <div className="dashboard-loading card">Loading settings…</div>;
  const set = (name, value) => setForm((current) => ({ ...current, [name]: value }));

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    const response = await fetch("/api/cms/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const result = await response.json();
    setStatus({ type: response.ok ? "success" : "error", message: result.message });
    setSaving(false);
  }

  const title = mode === "seo" ? "SEO settings" : "Website settings";
  return <section className="dashboard-section">
    <div className="dashboard-page-head"><div><p className="eyebrow">Website configuration</p><h1>{title}</h1><p>{mode === "seo" ? "Control default metadata, social sharing and search engine defaults." : "Manage branding, contact details, theme behavior and homepage controls."}</p></div></div>
    {!canEdit ? <div className="dashboard-notice error">Only administrators can save website settings.</div> : null}
    {status ? <div className={`dashboard-notice ${status.type}`}>{status.message}</div> : null}
    <form className="settings-form" onSubmit={save}>
      {mode === "seo" ? <>
        <Group title="Default metadata" description="Used when a page or content item does not have custom SEO fields.">
          <Field label="Default SEO title" wide><input value={form.defaultSeoTitle || ""} onChange={(e) => set("defaultSeoTitle", e.target.value)} /></Field>
          <Field label="Default meta description" wide><textarea rows="4" value={form.defaultSeoDescription || ""} onChange={(e) => set("defaultSeoDescription", e.target.value)} /></Field>
          <Field label="Default social image URL" wide><input type="url" value={form.defaultSocialImage || ""} onChange={(e) => set("defaultSocialImage", e.target.value)} /></Field>
        </Group>
        <Group title="SEO checklist" description="Technical SEO is generated automatically by Next.js.">
          <div className="seo-checklist dashboard-field-wide"><span><Icon name="check" size={16}/>Dynamic titles and descriptions</span><span><Icon name="check" size={16}/>Canonical and social metadata</span><span><Icon name="check" size={16}/>Sitemap and robots rules</span><span><Icon name="check" size={16}/>Article and project structured data</span><span><Icon name="check" size={16}/>Dashboard pages set to noindex</span></div>
        </Group>
      </> : <>
        <Group title="Branding" description="Text logo, optional image assets and the global color system.">
          <Field label="Website name"><input value={form.siteName || ""} onChange={(e) => set("siteName", e.target.value)} /></Field>
          <Field label="Text logo"><input value={form.textLogo || ""} onChange={(e) => set("textLogo", e.target.value)} /></Field>
          <Field label="Logo image URL"><input type="url" value={form.logoImage || ""} onChange={(e) => set("logoImage", e.target.value)} /></Field>
          <Field label="Light logo URL"><input type="url" value={form.lightLogo || ""} onChange={(e) => set("lightLogo", e.target.value)} /></Field>
          <Field label="Dark logo URL"><input type="url" value={form.darkLogo || ""} onChange={(e) => set("darkLogo", e.target.value)} /></Field>
          <Field label="Favicon URL"><input value={form.favicon || ""} onChange={(e) => set("favicon", e.target.value)} /></Field>
          <Field label="Accent color"><input type="color" value={form.accentColor || "#9a000f"} onChange={(e) => set("accentColor", e.target.value)} /></Field>
          <Field label="Default theme"><select value={form.defaultTheme || "system"} onChange={(e) => set("defaultTheme", e.target.value)}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></Field>
        </Group>
        <Group title="Contact and footer" description="Displayed on public contact and footer areas.">
          <Field label="Contact email"><input type="email" value={form.contactEmail || ""} onChange={(e) => set("contactEmail", e.target.value)} /></Field>
          <Field label="Phone"><input value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} /></Field>
          <Field label="Location"><input value={form.location || ""} onChange={(e) => set("location", e.target.value)} /></Field>
          <Field label="Footer copyright"><input value={form.footerCopyright || ""} onChange={(e) => set("footerCopyright", e.target.value)} /></Field>
          <Field label="Social links JSON" wide><textarea rows="5" value={JSON.stringify(form.socialLinks || {}, null, 2)} onChange={(e) => { try { set("socialLinks", JSON.parse(e.target.value)); } catch {} }} /></Field>
        </Group>
        <Group title="Homepage controls" description="Control visibility, order and the number of dynamic cards.">
          <Field label="Project count"><input type="number" min="1" max="20" value={form.homeProjectCount || 5} onChange={(e) => set("homeProjectCount", Number(e.target.value))} /></Field>
          <Field label="Review count"><input type="number" min="1" max="20" value={form.homeTestimonialCount || 5} onChange={(e) => set("homeTestimonialCount", Number(e.target.value))} /></Field>
          <Field label="Blog count"><input type="number" min="1" max="20" value={form.homePostCount || 10} onChange={(e) => set("homePostCount", Number(e.target.value))} /></Field>
          <Field label="Section order" wide><input value={(form.sectionOrder || []).join(", ")} onChange={(e) => set("sectionOrder", e.target.value.split(",").map((item) => item.trim()).filter(Boolean))} /></Field>
          <div className="dashboard-field dashboard-field-wide"><span>Visible sections</span><div className="checkbox-grid">{["hero", "works", "reviews", "cta", "blog"].map((section) => <label className="checkbox-field" key={section}><input type="checkbox" checked={form.sectionVisibility?.[section] !== false} onChange={(e) => set("sectionVisibility", { ...form.sectionVisibility, [section]: e.target.checked })}/><span>{section}</span></label>)}</div></div>
          <label className="checkbox-field dashboard-checkbox"><input type="checkbox" checked={Boolean(form.headerSticky)} onChange={(e) => set("headerSticky", e.target.checked)} /><span>Sticky public header</span></label>
          <label className="checkbox-field dashboard-checkbox"><input type="checkbox" checked={Boolean(form.maintenanceMode)} onChange={(e) => set("maintenanceMode", e.target.checked)} /><span>Maintenance mode flag</span></label>
        </Group>
      </>}
      <div className="settings-save-bar"><button className="button button-primary" type="submit" disabled={!canEdit || saving}>{saving ? "Saving…" : "Save settings"}<Icon name="check" size={15}/></button></div>
    </form>
  </section>;
}

function Group({ title, description, children }) { return <section className="card settings-group"><header><h2>{title}</h2><p>{description}</p></header><div className="settings-fields">{children}</div></section>; }
function Field({ label, wide, children }) { return <label className={`dashboard-field ${wide ? "dashboard-field-wide" : ""}`}><span>{label}</span>{children}</label>; }
