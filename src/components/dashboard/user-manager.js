"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/icon";

const empty = { name: "", email: "", password: "", cmsRole: "EDITOR", status: "ACTIVE" };

export function UserManager() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(undefined);
  const [form, setForm] = useState(empty);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams({ limit: "100" });
    if (search) query.set("search", search);
    const response = await fetch(`/api/cms/users?${query}`, { cache: "no-store" });
    const result = await response.json();
    if (response.ok) setItems(result.items || []);
    else setNotice({ type: "error", message: result.message });
    setLoading(false);
  }, [search]);

  useEffect(() => { load(); }, [load]);

  function openNew() { setEditing(null); setForm(empty); }
  function openEdit(item) { setEditing(item); setForm({ name: item.name || "", email: item.email || "", password: "", cmsRole: item.cmsRole || (item.role === "admin" ? "ADMIN" : "EDITOR"), status: item.status || (item.banned ? "SUSPENDED" : "ACTIVE") }); }
  function close() { setEditing(undefined); setForm(empty); }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    const response = await fetch(editing?.id ? `/api/cms/users/${editing.id}` : "/api/cms/users", { method: editing?.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const result = await response.json();
    setNotice({ type: response.ok ? "success" : "error", message: result.message });
    setSaving(false);
    if (response.ok) { close(); load(); }
  }

  async function remove(item) {
    if (!window.confirm(`Delete ${item.name || item.email}?`)) return;
    const response = await fetch(`/api/cms/users/${item.id}`, { method: "DELETE" });
    const result = await response.json();
    setNotice({ type: response.ok ? "success" : "error", message: result.message });
    if (response.ok) load();
  }

  return <section className="dashboard-section">
    <div className="dashboard-page-head"><div><p className="eyebrow">Access control</p><h1>Users</h1><p>Create administrator and editor accounts, change roles and suspend access.</p></div><button className="button button-primary" onClick={openNew}><Icon name="plus" size={16}/>New user</button></div>
    {notice ? <div className={`dashboard-notice ${notice.type}`}>{notice.message}</div> : null}
    <div className="dashboard-toolbar card"><form onSubmit={(e) => { e.preventDefault(); load(); }}><label><span>Search</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or email" /></label><button className="button button-secondary"><Icon name="search" size={15}/>Search</button></form><span>{items.length} users</span></div>
    <div className="dashboard-table-wrap card">{loading ? <div className="dashboard-loading">Loading users…</div> : <table className="dashboard-table"><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Last login</th><th/></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><strong>{item.name || "Unnamed user"}</strong><span>{item.email}</span></td><td><span className="status-pill published">{item.cmsRole || (item.role === "admin" ? "ADMIN" : "EDITOR")}</span></td><td><span className={`status-pill ${(item.status === "SUSPENDED" || item.banned) ? "draft" : "published"}`}>{item.status || (item.banned ? "SUSPENDED" : "ACTIVE")}</span></td><td>{item.lastLogin ? new Date(item.lastLogin).toLocaleString("en-US") : "Never"}</td><td><div className="table-actions"><button className="icon-button" onClick={() => openEdit(item)}><Icon name="edit" size={15}/></button><button className="icon-button danger" onClick={() => remove(item)}><Icon name="trash" size={15}/></button></div></td></tr>)}</tbody></table>}</div>
    {editing !== undefined ? <div className="dashboard-modal" role="dialog" aria-modal="true"><button className="dashboard-modal-backdrop" onClick={close}/><div className="dashboard-modal-panel small"><div className="dashboard-modal-head"><div><p className="eyebrow">Account</p><h2>{editing?.id ? "Edit user" : "Create user"}</h2></div><button className="icon-button" onClick={close}><Icon name="close" size={18}/></button></div><form className="dashboard-editor-form" onSubmit={save}><div className="dashboard-fields"><Field label="Name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/></Field><Field label="Email"><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/></Field><Field label={editing?.id ? "New password (optional)" : "Password"}><input type="password" required={!editing?.id} minLength="8" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}/></Field><Field label="CMS role"><select value={form.cmsRole} onChange={(e) => setForm({ ...form, cmsRole: e.target.value })}><option value="EDITOR">Editor</option><option value="ADMIN">Administrator</option></select></Field><Field label="Status"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option></select></Field></div><div className="dashboard-modal-footer"><button type="button" className="button button-secondary" onClick={close}>Cancel</button><button className="button button-primary" disabled={saving}>{saving ? "Saving…" : "Save user"}<Icon name="check" size={15}/></button></div></form></div></div> : null}
  </section>;
}
function Field({ label, children }) { return <label className="dashboard-field"><span>{label}</span>{children}</label>; }
