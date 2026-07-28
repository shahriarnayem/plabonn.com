"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/icon";

export function MediaManager() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [file, setFile] = useState(null);
  const [alt, setAlt] = useState("");
  const [notice, setNotice] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 24;

  const load = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams({ limit: String(limit), page: String(page) });
    if (search) query.set("search", search);
    const response = await fetch(`/api/cms/media?${query}`, { cache: "no-store" });
    const result = await response.json();
    if (response.ok) { setItems(result.items || []); setTotal(result.total || 0); }
    else setNotice({ type: "error", message: result.message });
    setLoading(false);
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  async function upload(event) {
    event.preventDefault();
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.set("file", file);
    form.set("alt", alt);
    const response = await fetch("/api/media", { method: "POST", body: form });
    const result = await response.json();
    setNotice({ type: response.ok ? "success" : "error", message: result.message });
    setUploading(false);
    if (response.ok) { setFile(null); setAlt(""); event.currentTarget.reset(); load(); }
  }

  async function remove(item) {
    if (!window.confirm(`Delete ${item.filename}?`)) return;
    const response = await fetch(`/api/media/${item.id}`, { method: "DELETE" });
    const result = await response.json();
    setNotice({ type: response.ok ? "success" : "error", message: result.message });
    if (response.ok) load();
  }

  async function edit(item) {
    const filename = window.prompt("Filename", item.filename || "");
    if (filename === null) return;
    const altText = window.prompt("Alt text", item.metadata?.alt || "");
    if (altText === null) return;
    const response = await fetch(`/api/media/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filename, alt: altText }) });
    const result = await response.json();
    setNotice({ type: response.ok ? "success" : "error", message: result.message });
    if (response.ok) load();
  }

  async function copy(url) {
    await navigator.clipboard.writeText(url);
    setNotice({ type: "success", message: "Media URL copied." });
  }

  return <section className="dashboard-section">
    <div className="dashboard-page-head"><div><p className="eyebrow">GridFS library</p><h1>Media</h1><p>Upload images to MongoDB GridFS and reuse their URLs throughout the CMS.</p></div></div>
    {notice ? <div className={`dashboard-notice ${notice.type}`}>{notice.message}</div> : null}
    <form className="card media-upload" onSubmit={upload}><label className="upload-drop"><Icon name="upload" size={28}/><strong>{file ? file.name : "Choose an image"}</strong><span>JPG, PNG, WebP or GIF. Maximum 6 MB.</span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setFile(e.target.files?.[0] || null)} required /></label><label className="dashboard-field"><span>Alt text</span><input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Describe the image" /></label><button className="button button-primary" disabled={uploading}>{uploading ? "Uploading…" : "Upload image"}<Icon name="upload" size={15}/></button></form>
    <div className="dashboard-toolbar card"><form onSubmit={(e) => { e.preventDefault(); load(); }}><label><span>Search media</span><input value={search} onChange={(e) => setSearch(e.target.value)} /></label><button className="button button-secondary"><Icon name="search" size={15}/>Search</button></form><span>{total} files</span></div>
    {loading ? <div className="dashboard-loading card">Loading media…</div> : <div className="media-grid">{items.map((item) => { const url = `/api/media/${item.id}`; return <article className="card media-card" key={item.id}><div className="media-preview"><img src={url} alt={item.metadata?.alt || item.filename} /></div><div><strong>{item.filename}</strong><span>{formatBytes(item.length)} · {item.contentType || "image"}</span><small>{item.metadata?.alt || "No alt text"}</small></div><footer><button className="icon-button" onClick={() => edit(item)} type="button" title="Edit details"><Icon name="edit" size={15}/></button><button className="button button-secondary" onClick={() => copy(url)} type="button"><Icon name="copy" size={14}/>Copy URL</button><button className="icon-button danger" onClick={() => remove(item)} type="button"><Icon name="trash" size={15}/></button></footer></article>; })}{items.length === 0 ? <div className="card dashboard-empty"><p>No media found.</p></div> : null}</div>}
    {Math.ceil(total / limit) > 1 ? <div className="dashboard-pagination"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page} of {Math.ceil(total / limit)}</span><button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage((value) => value + 1)}>Next</button></div> : null}
  </section>;
}
function formatBytes(value = 0) { if (value < 1024) return `${value} B`; if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`; return `${(value / 1024 / 1024).toFixed(1)} MB`; }
