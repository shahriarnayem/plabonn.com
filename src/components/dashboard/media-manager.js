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
    const query = new URLSearchParams({
      limit: String(limit),
      page: String(page),
    });
    if (search) query.set("search", search);

    const response = await fetch(`/api/cms/media?${query}`, {
      cache: "no-store",
    });
    const result = await response.json();

    if (response.ok) {
      setItems(result.items || []);
      setTotal(result.total || 0);
    } else {
      setNotice({ type: "error", message: result.message });
    }
    setLoading(false);
  }, [search, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function upload(event) {
    event.preventDefault();
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.set("file", file);
    form.set("alt", alt);

    const response = await fetch("/api/media", {
      method: "POST",
      body: form,
    });
    const result = await response.json();
    setNotice({
      type: response.ok ? "success" : "error",
      message: result.message,
    });
    setUploading(false);

    if (response.ok) {
      setFile(null);
      setAlt("");
      event.currentTarget.reset();
      load();
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete ${item.filename}?`)) return;
    const response = await fetch(`/api/media/${item.id}`, { method: "DELETE" });
    const result = await response.json();
    setNotice({
      type: response.ok ? "success" : "error",
      message: result.message,
    });
    if (response.ok) load();
  }

  async function edit(item) {
    const filename = window.prompt("Filename", item.filename || "");
    if (filename === null) return;
    const altText = window.prompt("Alt text", item.metadata?.alt || "");
    if (altText === null) return;

    const response = await fetch(`/api/media/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, alt: altText }),
    });
    const result = await response.json();
    setNotice({
      type: response.ok ? "success" : "error",
      message: result.message,
    });
    if (response.ok) load();
  }

  async function copy(url) {
    await navigator.clipboard.writeText(url);
    setNotice({ type: "success", message: "Media URL copied." });
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <section className="grid gap-5">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.04em] text-[var(--text-faint)]">
          GridFS library
        </p>
        <h1 className="text-[clamp(24px,4vw,32px)] font-bold uppercase leading-[1.16] tracking-[-0.03em]">
          Media
        </h1>
        <p className="mt-2 max-w-[720px] text-sm text-[var(--text-soft)]">
          Upload images to MongoDB GridFS and reuse their URLs throughout the CMS.
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

      <form
        className="grid grid-cols-1 items-end gap-4 rounded-[12px] bg-[var(--card)] p-5 lg:grid-cols-[minmax(0,1fr)_minmax(220px,.6fr)_auto]"
        onSubmit={upload}
      >
        <label className="relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[10px] bg-[var(--card-soft)] p-5 text-center">
          <Icon name="upload" size={28} />
          <strong className="text-sm">{file ? file.name : "Choose an image"}</strong>
          <span className="text-xs text-[var(--text-faint)]">
            JPG, PNG, WebP or GIF. Maximum 6 MB.
          </span>
          <input
            className="absolute inset-0 cursor-pointer opacity-0"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            required
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">
            Alt text
          </span>
          <input
            className="w-full rounded-[8px] bg-[var(--card-soft)] px-3 py-2.5 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            placeholder="Describe the image"
          />
        </label>

        <button
          className="inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-[7px] bg-[var(--accent)] px-3.5 py-2 text-xs font-bold uppercase text-white transition-colors duration-150 hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-55"
          disabled={uploading}
        >
          {uploading ? "Uploading…" : "Upload image"}
          <Icon name="upload" size={15} />
        </button>
      </form>

      <div className="flex flex-col justify-between gap-4 rounded-[12px] bg-[var(--card)] p-4 sm:flex-row sm:items-end">
        <form
          className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            load();
          }}
        >
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">
              Search media
            </span>
            <input
              className="w-full rounded-[8px] bg-[var(--card-soft)] px-3 py-2.5 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <button className="inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-[7px] bg-[var(--card-soft)] px-3.5 py-2 text-xs font-bold uppercase transition-colors duration-150 hover:bg-[var(--card-strong)]">
            <Icon name="search" size={15} />
            Search
          </button>
        </form>
        <span className="text-xs text-[var(--text-faint)]">{total} files</span>
      </div>

      {loading ? (
        <div className="rounded-[12px] bg-[var(--card)] p-8 text-sm text-[var(--text-soft)]">
          Loading media…
        </div>
      ) : (
        <div className="grid grid-flow-dense grid-cols-1 gap-[14px] sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const url = `/api/media/${item.id}`;
            return (
              <article
                className="relative min-w-0 overflow-hidden rounded-[12px] bg-[var(--card)]"
                key={item.id}
              >
                <div className="aspect-[4/3] bg-[var(--card-soft)]">
                  <img
                    className="h-full w-full object-cover"
                    src={url}
                    alt={item.metadata?.alt || item.filename}
                  />
                </div>
                <div className="grid gap-1.5 p-4">
                  <strong className="truncate text-sm">{item.filename}</strong>
                  <span className="text-xs text-[var(--text-faint)]">
                    {formatBytes(item.length)} · {item.contentType || "image"}
                  </span>
                  <small className="text-xs text-[var(--text-soft)]">
                    {item.metadata?.alt || "No alt text"}
                  </small>
                </div>
                <footer className="flex items-center justify-between gap-2 p-4 pt-0">
                  <button
                    className="inline-grid h-8 w-8 cursor-pointer place-items-center rounded-lg bg-[var(--card-soft)] transition-colors duration-150 hover:bg-[var(--card-strong)]"
                    onClick={() => edit(item)}
                    type="button"
                    title="Edit details"
                  >
                    <Icon name="edit" size={15} />
                  </button>
                  <button
                    className="inline-flex min-h-[34px] cursor-pointer items-center justify-center gap-2 rounded-[7px] bg-[var(--card-soft)] px-3 text-xs font-bold uppercase transition-colors duration-150 hover:bg-[var(--card-strong)]"
                    onClick={() => copy(url)}
                    type="button"
                  >
                    <Icon name="copy" size={14} />
                    Copy URL
                  </button>
                  <button
                    className="inline-grid h-8 w-8 cursor-pointer place-items-center rounded-lg bg-[var(--card-soft)] text-[var(--danger)] transition-colors duration-150 hover:bg-[var(--card-soft)]"
                    onClick={() => remove(item)}
                    type="button"
                  >
                    <Icon name="trash" size={15} />
                  </button>
                </footer>
              </article>
            );
          })}
          {items.length === 0 ? (
            <div className="rounded-[12px] bg-[var(--card)] p-8 text-sm text-[var(--text-soft)]">
              No media found.
            </div>
          ) : null}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3 text-xs">
          <button
            className="rounded-[7px] bg-[var(--card)] px-3 py-2 transition-colors duration-150 hover:bg-[var(--card-soft)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((value) => value - 1)}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            className="rounded-[7px] bg-[var(--card)] px-3 py-2 transition-colors duration-150 hover:bg-[var(--card-soft)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((value) => value + 1)}
          >
            Next
          </button>
        </div>
      ) : null}
    </section>
  );
}

function formatBytes(value = 0) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}
