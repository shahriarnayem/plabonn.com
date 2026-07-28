"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";

export function ProfileEditor() {
  const [form, setForm] = useState({ name: "", email: "", bio: "", currentPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    fetch("/api/cms/profile", { cache: "no-store" }).then((r) => r.json()).then((result) => {
      setForm((current) => ({ ...current, name: result.item?.name || "", email: result.item?.email || "", bio: result.item?.bio || "" }));
      setLoading(false);
    });
  }, []);

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    const response = await fetch("/api/cms/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const result = await response.json();
    setNotice({ type: response.ok ? "success" : "error", message: result.message });
    setSaving(false);
    if (response.ok) setForm((current) => ({ ...current, currentPassword: "", newPassword: "" }));
  }

  if (loading) return <div className="dashboard-loading card">Loading profile…</div>;
  return <section className="dashboard-section"><div className="dashboard-page-head"><div><p className="eyebrow">Account</p><h1>Profile</h1><p>Update your CMS display information and password.</p></div></div>{notice ? <div className={`dashboard-notice ${notice.type}`}>{notice.message}</div> : null}<form className="settings-form" onSubmit={save}><section className="card settings-group"><header><h2>Profile details</h2><p>Your email is managed by an administrator.</p></header><div className="settings-fields"><Field label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field><Field label="Email"><input disabled value={form.email} /></Field><Field label="Biography" wide><textarea rows="6" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></Field></div></section><section className="card settings-group"><header><h2>Change password</h2><p>Leave both fields empty when you are not changing the password.</p></header><div className="settings-fields"><Field label="Current password"><input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} /></Field><Field label="New password"><input type="password" minLength="8" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} /></Field></div></section><div className="settings-save-bar"><button className="button button-primary" disabled={saving}>{saving ? "Saving…" : "Save profile"}<Icon name="check" size={15}/></button></div></form></section>;
}
function Field({ label, wide, children }) { return <label className={`dashboard-field ${wide ? "dashboard-field-wide" : ""}`}><span>{label}</span>{children}</label>; }
