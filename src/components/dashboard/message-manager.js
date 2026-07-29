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

    const response = await fetch(`/api/cms/messages?${query}`, {
      cache: "no-store",
    });
    const result = await response.json();

    if (response.ok) setItems(result.items || []);
    else setNotice({ type: "error", message: result.message });
    setLoading(false);
  }, [search, unreadOnly]);

  useEffect(() => {
    load();
  }, [load]);

  async function setRead(item, read = true) {
    const response = await fetch(`/api/cms/messages/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read }),
    });
    const result = await response.json();
    setNotice({
      type: response.ok ? "success" : "error",
      message: result.message,
    });

    if (response.ok) {
      if (selected?.id === item.id) setSelected({ ...selected, read });
      load();
    }
  }

  async function remove(item) {
    if (!window.confirm("Delete this contact message?")) return;
    const response = await fetch(`/api/cms/messages/${item.id}`, {
      method: "DELETE",
    });
    const result = await response.json();
    setNotice({
      type: response.ok ? "success" : "error",
      message: result.message,
    });

    if (response.ok) {
      if (selected?.id === item.id) setSelected(null);
      load();
    }
  }

  return (
    <section className="grid gap-5">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.04em] text-[var(--text-faint)]">
          Inbox
        </p>
        <h1 className="text-[clamp(24px,4vw,32px)] font-bold uppercase leading-[1.16] tracking-[-0.03em]">
          Contact messages
        </h1>
        <p className="mt-2 max-w-[720px] text-sm text-[var(--text-soft)]">
          Review project enquiries, mark them as read and keep the inbox organized.
        </p>
      </div>

      {notice ? (
        <div
          className={`rounded-[10px] px-4 py-3 text-xs ${
            notice.type === "success"
              ? "bg-[var(--card-soft)] text-[var(--success)]"
              : "bg-[var(--card-soft)] text-[var(--danger)]"
          }`}
        >
          {notice.message}
        </div>
      ) : null}

      <div className="flex flex-col justify-between gap-4 rounded-[12px] bg-[var(--card)] p-4 lg:flex-row lg:items-end">
        <form
          className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            load();
          }}
        >
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">
              Search
            </span>
            <input
              className="w-full rounded-[8px] bg-[var(--card-soft)] px-3 py-2.5 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, email or message"
            />
          </label>
          <label className="flex min-h-[38px] items-center gap-2.5 text-sm text-[var(--text-soft)]">
            <input
              className="h-4 w-4 accent-[#9a000f]"
              type="checkbox"
              checked={unreadOnly}
              onChange={(event) => setUnreadOnly(event.target.checked)}
            />
            <span>Unread only</span>
          </label>
          <button
            className="inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-[7px] bg-[var(--card-soft)] px-3.5 py-2 text-xs font-bold uppercase transition-colors duration-150 hover:bg-[var(--card-strong)]"
            type="submit"
          >
            <Icon name="search" size={15} />
            Filter
          </button>
        </form>
        <span className="text-xs text-[var(--text-faint)]">{items.length} shown</span>
      </div>

      <div className="grid grid-flow-dense grid-cols-1 gap-[14px] xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="max-h-[720px] overflow-y-auto rounded-[12px] bg-[var(--card)] p-2">
          {loading ? (
            <div className="p-6 text-sm text-[var(--text-soft)]">Loading messages…</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-sm text-[var(--text-soft)]">No messages found.</div>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`mb-1 grid w-full gap-2 rounded-[8px] p-3 text-left transition-colors duration-150 last:mb-0 hover:bg-[var(--card-strong)] ${
                  selected?.id === item.id
                    ? "bg-[var(--card-strong)]"
                    : "bg-[var(--card-soft)]"
                } ${item.read ? "" : "text-[var(--text)]"}`}
                onClick={() => {
                  setSelected(item);
                  if (!item.read) setRead(item, true);
                }}
              >
                <div className="min-w-0">
                  <strong className="block truncate text-sm">{item.fullName}</strong>
                  <span className="block truncate text-xs text-[var(--text-faint)]">
                    {item.email}
                  </span>
                </div>
                <p className="line-clamp-2 text-xs text-[var(--text-soft)]">
                  {item.message}
                </p>
                <time className="text-xs text-[var(--text-faint)]">
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString("en-US")
                    : ""}
                </time>
              </button>
            ))
          )}
        </div>

        <div className="min-h-[420px] rounded-[12px] bg-[var(--card)] p-5 sm:p-6">
          {selected ? (
            <>
              <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.04em] text-[var(--text-faint)]">
                    Project enquiry
                  </p>
                  <h2 className="text-2xl font-bold">{selected.fullName}</h2>
                  <a
                    className="mt-1 inline-block break-all text-sm text-[var(--text-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                    href={`mailto:${selected.email}`}
                  >
                    {selected.email}
                  </a>
                </div>
                <div className="flex gap-1.5">
                  <button
                    className="inline-grid h-8 w-8 cursor-pointer place-items-center rounded-lg bg-[var(--card-soft)] transition-colors duration-150 hover:bg-[var(--card-strong)]"
                    onClick={() => setRead(selected, !selected.read)}
                    title={selected.read ? "Mark unread" : "Mark read"}
                  >
                    <Icon name={selected.read ? "mail" : "check"} size={16} />
                  </button>
                  <button
                    className="inline-grid h-8 w-8 cursor-pointer place-items-center rounded-lg bg-[var(--card-soft)] text-[var(--danger)] transition-colors duration-150 hover:bg-[var(--card-soft)]"
                    onClick={() => remove(selected)}
                    title="Delete"
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              </header>

              <dl className="mt-6 grid grid-cols-1 gap-4 rounded-[10px] bg-[var(--card-soft)] p-4 sm:grid-cols-2">
                {[
                  ["Phone", selected.phone || "—"],
                  ["Company", selected.company || "—"],
                  ["Service", selected.service || "—"],
                  ["Budget", selected.budget || "—"],
                ].map(([label, value]) => (
                  <div className="grid gap-1" key={label}>
                    <dt className="text-xs uppercase text-[var(--text-faint)]">{label}</dt>
                    <dd className="m-0 text-sm">{value}</dd>
                  </div>
                ))}
              </dl>

              <article className="mt-6 whitespace-pre-wrap text-sm leading-[1.75] text-[var(--text-soft)]">
                {selected.message}
              </article>

              <a
                className="mt-6 inline-flex min-h-[38px] items-center justify-center gap-2 rounded-[7px] bg-[var(--accent)] px-3.5 py-2 text-xs font-bold uppercase text-white transition-colors duration-150 hover:bg-[var(--accent-hover)]"
                href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.service || "Website project"}`)}`}
              >
                Reply by email
                <Icon name="arrow" size={15} />
              </a>
            </>
          ) : (
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
              <Icon name="mail" size={36} />
              <h2 className="mt-4 text-xl font-bold">Select a message</h2>
              <p className="mt-2 max-w-[420px] text-sm text-[var(--text-soft)]">
                Choose an enquiry from the inbox to read its complete details.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
