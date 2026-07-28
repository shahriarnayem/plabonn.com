"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/icon";

export function MessageManager() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams({ limit: "100" });
    if (search) query.set("search", search);
    if (unreadOnly) query.set("read", "false");
    const response = await fetch(`/api/cms/messages?${query}`, { cache: "no-store" });
    const result = await response.json();
    if (response.ok) setItems(result.items || []);
    else setNotice({ type: "error", message: result.message });
    setLoading(false);
  }, [search, unreadOnly]);

  useEffect(() => { load(); }, [load]);

  async function setRead(item, read = true) {
    const response = await fetch(`/api/cms/messages/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ read }) });
    const result = await response.json();
    setNotice({ type: response.ok ? "success" : "error", message: result.message });
    if (response.ok) {
      if (selected?.id === item.id) setSelected({ ...selected, read });
      load();
    }
  }

  async function remove(item) {
    if (!window.confirm("Delete this contact message?")) return;
    const response = await fetch(`/api/cms/messages/${item.id}`, { method: "DELETE" });
    const result = await response.json();
    setNotice({ type: response.ok ? "success" : "error", message: result.message });
    if (response.ok) { if (selected?.id === item.id) setSelected(null); load(); }
  }

  return <section className="dashboard-section">
    <div className="dashboard-page-head"><div><p className="eyebrow">Inbox</p><h1>Contact messages</h1><p>Review project enquiries, mark them as read and keep the inbox organized.</p></div></div>
    {notice ? <div className={`dashboard-notice ${notice.type}`}>{notice.message}</div> : null}
    <div className="dashboard-toolbar card"><form onSubmit={(e) => { e.preventDefault(); load(); }}><label><span>Search</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, email or message" /></label><label className="checkbox-field"><input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} /><span>Unread only</span></label><button className="button button-secondary" type="submit"><Icon name="search" size={15}/>Filter</button></form><span>{items.length} shown</span></div>
    <div className="message-layout">
      <div className="card message-list">{loading ? <div className="dashboard-loading">Loading messages…</div> : items.length === 0 ? <div className="dashboard-empty"><p>No messages found.</p></div> : items.map((item) => <button key={item.id} type="button" className={`${selected?.id === item.id ? "active" : ""} ${item.read ? "" : "unread"}`} onClick={() => { setSelected(item); if (!item.read) setRead(item, true); }}><div><strong>{item.fullName}</strong><span>{item.email}</span></div><p>{item.message}</p><time>{item.createdAt ? new Date(item.createdAt).toLocaleString("en-US") : ""}</time></button>)}</div>
      <div className="card message-reader">{selected ? <><header><div><p className="eyebrow">Project enquiry</p><h2>{selected.fullName}</h2><a href={`mailto:${selected.email}`}>{selected.email}</a></div><div><button className="icon-button" onClick={() => setRead(selected, !selected.read)} title={selected.read ? "Mark unread" : "Mark read"}><Icon name={selected.read ? "mail" : "check"} size={16}/></button><button className="icon-button danger" onClick={() => remove(selected)} title="Delete"><Icon name="trash" size={16}/></button></div></header><dl><div><dt>Phone</dt><dd>{selected.phone || "—"}</dd></div><div><dt>Company</dt><dd>{selected.company || "—"}</dd></div><div><dt>Service</dt><dd>{selected.service || "—"}</dd></div><div><dt>Budget</dt><dd>{selected.budget || "—"}</dd></div></dl><article>{selected.message}</article><a className="button button-primary" href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.service || "Website project"}`)}`}>Reply by email<Icon name="arrow" size={15}/></a></> : <div className="dashboard-empty"><Icon name="mail" size={36}/><h2>Select a message</h2><p>Choose an enquiry from the inbox to read its complete details.</p></div>}</div>
    </div>
  </section>;
}
