"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BlockEditor } from "@/components/dashboard/block-editor";
import { Icon } from "@/components/icon";

function createInitial(fields) {
  const result = {};
  for (const field of fields) {
    if (field.type === "checkbox") result[field.name] = Boolean(field.defaultValue);
    else if (field.type === "list" || field.type === "blocks") result[field.name] = [];
    else result[field.name] = field.defaultValue ?? "";
  }
  return result;
}

function normalizeForForm(item, fields) {
  const result = createInitial(fields);
  for (const field of fields) {
    const value = item?.[field.name];
    if (value === undefined || value === null) continue;
    if (field.type === "date") result[field.name] = String(value).slice(0, 10);
    else result[field.name] = value;
  }
  return result;
}

export function ResourceManager({ resource, config }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [editing, setEditing] = useState(undefined);
  const [form, setForm] = useState(() => createInitial(config.fields));
  const [saving, setSaving] = useState(false);
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) query.set("search", search);
    if (status) query.set("status", status);
    const response = await fetch(`/api/cms/${resource}?${query}`, { cache: "no-store" });
    const result = await response.json();
    if (response.ok) {
      setItems(result.items || []);
      setTotal(result.total || 0);
    } else {
      setNotice({ type: "error", message: result.message || "Content could not be loaded." });
    }
    setLoading(false);
  }, [page, search, status, resource]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  function openNew() {
    setEditing(null);
    setForm(createInitial(config.fields));
  }

  function openEdit(item) {
    setEditing(item);
    setForm(normalizeForForm(item, config.fields));
  }

  function closeForm() {
    setEditing(undefined);
    setForm(createInitial(config.fields));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    const response = await fetch(editing?.id ? `/api/cms/${resource}/${editing.id}` : `/api/cms/${resource}`, {
      method: editing?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) {
      setNotice({ type: "error", message: result.message || "The item could not be saved." });
      return;
    }
    setNotice({ type: "success", message: result.message });
    closeForm();
    load();
  }

  async function remove(item) {
    if (!window.confirm(`Delete “${item[config.titleField] || "this item"}”? This cannot be undone.`)) return;
    const response = await fetch(`/api/cms/${resource}/${item.id}`, { method: "DELETE" });
    const result = await response.json();
    setNotice({ type: response.ok ? "success" : "error", message: result.message });
    if (response.ok) load();
  }

  async function duplicate(item) {
    const copy = { ...item };
    delete copy.id;
    copy[config.titleField] = `${copy[config.titleField] || "Untitled"} Copy`;
    if (copy.slug) copy.slug = `${copy.slug}-copy-${Date.now().toString().slice(-4)}`;
    copy.status = "DRAFT";
    const response = await fetch(`/api/cms/${resource}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(copy) });
    const result = await response.json();
    setNotice({ type: response.ok ? "success" : "error", message: result.message });
    if (response.ok) load();
  }

  const dialogOpen = editing !== undefined;

  return (
    <section className="dashboard-section">
      <div className="dashboard-page-head">
        <div><p className="eyebrow">Content manager</p><h1>{config.label}</h1><p>Create, edit, publish, duplicate and organize {config.label.toLowerCase()}.</p></div>
        <button className="button button-primary" type="button" onClick={openNew}><Icon name="plus" size={16}/>New {config.singular}</button>
      </div>

      {notice ? <div className={`dashboard-notice ${notice.type}`}>{notice.message}<button type="button" onClick={() => setNotice(null)} aria-label="Dismiss">×</button></div> : null}

      <div className="dashboard-toolbar card">
        <form onSubmit={(event) => { event.preventDefault(); setPage(1); load(); }}>
          <label><span>Search</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${config.label.toLowerCase()}`} /></label>
          {config.fields.some((field) => field.name === "status") ? <label><span>Status</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">All</option><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option></select></label> : null}
          <button className="button button-secondary" type="submit"><Icon name="search" size={15}/>Filter</button>
        </form>
        <span>{total} total</span>
      </div>

      <div className="dashboard-table-wrap card">
        {loading ? <div className="dashboard-loading">Loading content…</div> : items.length === 0 ? <div className="dashboard-empty"><h2>No {config.label.toLowerCase()} yet.</h2><p>Create the first item to get started.</p></div> : <table className="dashboard-table">
          <thead><tr><th>{config.singular}</th><th>Status</th><th>Order</th><th>Updated</th><th aria-label="Actions" /></tr></thead>
          <tbody>{items.map((item) => {
            const title = item[config.titleField] || "Untitled";
            const preview = resource === "pages" ? (item.route || (item.slug === "home" ? "/" : item.slug ? `/${item.slug}` : "")) : config.previewBase && item.slug ? `${config.previewBase}/${item.slug}` : config.previewBase || "";
            return <tr key={item.id}><td><strong>{title}</strong><span>{item.slug || item.excerpt || item.url || ""}</span></td><td>{item.status ? <span className={`status-pill ${String(item.status).toLowerCase()}`}>{item.status}</span> : item.visible === false ? <span className="status-pill draft">Hidden</span> : <span className="status-pill published">Active</span>}</td><td>{item.order ?? "—"}</td><td>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("en-US") : "—"}</td><td><div className="table-actions">{preview ? <Link className="icon-button" href={preview} target="_blank" title="Preview"><Icon name="external" size={15}/></Link> : null}<button className="icon-button" type="button" onClick={() => openEdit(item)} title="Edit"><Icon name="edit" size={15}/></button><button className="icon-button" type="button" onClick={() => duplicate(item)} title="Duplicate"><Icon name="copy" size={15}/></button><button className="icon-button danger" type="button" onClick={() => remove(item)} title="Delete"><Icon name="trash" size={15}/></button></div></td></tr>;
          })}</tbody>
        </table>}
      </div>

      {totalPages > 1 ? <div className="dashboard-pagination"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page} of {totalPages}</span><button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>Next</button></div> : null}

      {dialogOpen ? <div className="dashboard-modal" role="dialog" aria-modal="true" aria-labelledby="editor-title"><button className="dashboard-modal-backdrop" onClick={closeForm} aria-label="Close editor"/><div className="dashboard-modal-panel">
        <div className="dashboard-modal-head"><div><p className="eyebrow">{editing?.id ? "Edit content" : "Create content"}</p><h2 id="editor-title">{editing?.id ? `Edit ${config.singular}` : `New ${config.singular}`}</h2></div><button className="icon-button" onClick={closeForm} aria-label="Close"><Icon name="close" size={18}/></button></div>
        <form className="dashboard-editor-form" onSubmit={submit}>
          <div className="dashboard-fields">{config.fields.map((field) => <EditorField key={field.name} field={field} value={form[field.name]} onChange={(value) => setForm((current) => ({ ...current, [field.name]: value }))} />)}</div>
          <div className="dashboard-modal-footer"><button className="button button-secondary" type="button" onClick={closeForm}>Cancel</button><button className="button button-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}<Icon name="check" size={15}/></button></div>
        </form>
      </div></div> : null}
    </section>
  );
}

function EditorField({ field, value, onChange }) {
  if (field.type === "checkbox") return <label className="checkbox-field dashboard-checkbox"><input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} /><span>{field.label}</span></label>;
  if (field.type === "blocks") return <div className="dashboard-field dashboard-field-wide"><span>{field.label}</span><BlockEditor value={value || []} onChange={onChange} /></div>;
  if (field.type === "textarea") return <label className="dashboard-field dashboard-field-wide"><span>{field.label}{field.required ? " *" : ""}</span><textarea rows="5" value={value || ""} onChange={(event) => onChange(event.target.value)} required={field.required} placeholder={field.placeholder}/></label>;
  if (field.type === "list") return <label className="dashboard-field dashboard-field-wide"><span>{field.label}</span><textarea rows="4" value={Array.isArray(value) ? value.join("\n") : value || ""} onChange={(event) => onChange(event.target.value.split("\n").map((item) => item.trim()).filter(Boolean))} placeholder="One item per line" /></label>;
  if (field.type === "select") return <label className="dashboard-field"><span>{field.label}{field.required ? " *" : ""}</span><select value={value ?? ""} onChange={(event) => onChange(event.target.value)} required={field.required}>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
  return <label className="dashboard-field"><span>{field.label}{field.required ? " *" : ""}</span><input type={field.type === "slug" ? "text" : field.type === "image" ? "url" : field.type} value={value ?? ""} onChange={(event) => onChange(field.type === "number" ? Number(event.target.value) : event.target.value)} required={field.required} placeholder={field.placeholder}/></label>;
}
