"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BlockEditor } from "@/components/dashboard/block-editor";
import { GalleryUploadField, ImageUploadField } from "@/components/dashboard/image-upload-field";
import { Icon } from "@/components/icon";

function createInitial(fields) {
  const result = {};
  for (const field of fields) {
    if (field.type === "checkbox") result[field.name] = Boolean(field.defaultValue);
    else if (["list", "blocks", "image-list"].includes(field.type)) result[field.name] = [];
    else result[field.name] = field.defaultValue ?? "";
  }
  return result;
}

function normalizeForForm(item, fields) {
  const result = createInitial(fields);
  for (const field of fields) {
    const value = item?.[field.name];
    if (value === undefined || value === null) continue;
    result[field.name] = field.type === "date" ? String(value).slice(0, 10) : value;
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
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) query.set("search", search);
    if (status) query.set("status", status);

    const response = await fetch(`/api/cms/${resource}?${query}`, {
      cache: "no-store",
    });
    const result = await response.json();

    if (response.ok) {
      setItems(result.items || []);
      setTotal(result.total || 0);
    } else {
      setNotice({
        type: "error",
        message: result.message || "Content could not be loaded.",
      });
    }
    setLoading(false);
  }, [page, search, status, resource]);

  useEffect(() => {
    load();
  }, [load]);

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

    const response = await fetch(
      editing?.id ? `/api/cms/${resource}/${editing.id}` : `/api/cms/${resource}`,
      {
        method: editing?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      },
    );
    const result = await response.json();
    setSaving(false);

    if (!response.ok) {
      setNotice({
        type: "error",
        message: result.message || "The item could not be saved.",
      });
      return;
    }

    setNotice({ type: "success", message: result.message });
    closeForm();
    load();
  }

  async function remove(item) {
    if (
      !window.confirm(
        `Delete “${item[config.titleField] || "this item"}”? This cannot be undone.`,
      )
    ) {
      return;
    }

    const response = await fetch(`/api/cms/${resource}/${item.id}`, {
      method: "DELETE",
    });
    const result = await response.json();
    setNotice({
      type: response.ok ? "success" : "error",
      message: result.message,
    });
    if (response.ok) load();
  }

  async function duplicate(item) {
    const copy = { ...item };
    delete copy.id;
    copy[config.titleField] = `${copy[config.titleField] || "Untitled"} Copy`;
    if (copy.slug) copy.slug = `${copy.slug}-copy-${Date.now().toString().slice(-4)}`;
    copy.status = "DRAFT";

    const response = await fetch(`/api/cms/${resource}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(copy),
    });
    const result = await response.json();
    setNotice({
      type: response.ok ? "success" : "error",
      message: result.message,
    });
    if (response.ok) load();
  }

  const dialogOpen = editing !== undefined;

  return (
    <section className="grid gap-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.04em] text-[var(--text-faint)]">
            Content manager
          </p>
          <h1 className="text-[clamp(24px,4vw,32px)] font-bold uppercase leading-[1.16] tracking-[-0.03em]">
            {config.label}
          </h1>
          <p className="mt-2 max-w-[720px] text-sm text-[var(--text-soft)]">
            Create, edit, publish, duplicate and organize {config.label.toLowerCase()}.
          </p>
        </div>
        <button
          className="inline-flex min-h-[38px] w-fit cursor-pointer items-center justify-center gap-2.5 rounded-[7px] bg-[var(--accent)] px-3.5 py-2 text-xs font-bold uppercase tracking-[0.015em] text-white transition-colors duration-150 hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          type="button"
          onClick={openNew}
        >
          <Icon name="plus" size={16} />
          New {config.singular}
        </button>
      </div>

      {notice ? (
        <div
          className={`flex items-center justify-between gap-4 rounded-[10px] px-4 py-3 text-xs ${
            notice.type === "success"
              ? "bg-[var(--card-soft)] text-[var(--success)]"
              : "bg-[var(--card-soft)] text-[var(--danger)]"
          }`}
        >
          <span>{notice.message}</span>
          <button
            type="button"
            className="grid h-7 w-7 place-items-center rounded-md transition-colors duration-150 hover:bg-black/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            onClick={() => setNotice(null)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ) : null}

      <div className="flex flex-col justify-between gap-4 rounded-[12px] bg-[var(--card)] p-4 lg:flex-row lg:items-end">
        <form
          className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
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
              placeholder={`Search ${config.label.toLowerCase()}`}
            />
          </label>
          {config.fields.some((field) => field.name === "status") ? (
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">
                Status
              </span>
              <select
                className="w-full cursor-pointer appearance-none rounded-[8px] bg-[var(--card-soft)] px-3 py-2.5 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">All</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </label>
          ) : null}
          <button
            className="inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2.5 rounded-[7px] bg-[var(--card-soft)] px-3.5 py-2 text-xs font-bold uppercase tracking-[0.015em] transition-colors duration-150 hover:bg-[var(--card-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            type="submit"
          >
            <Icon name="search" size={15} />
            Filter
          </button>
        </form>
        <span className="text-xs text-[var(--text-faint)]">{total} total</span>
      </div>

      <div className="overflow-x-auto rounded-[12px] bg-[var(--card)]">
        {loading ? (
          <div className="p-8 text-sm text-[var(--text-soft)]">Loading content…</div>
        ) : items.length === 0 ? (
          <div className="p-8">
            <h2 className="text-xl font-bold">No {config.label.toLowerCase()} yet.</h2>
            <p className="mt-2 text-sm text-[var(--text-soft)]">
              Create the first item to get started.
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[var(--card-soft)] text-xs uppercase text-[var(--text-faint)]">
                <th className="px-4 py-3 font-semibold">{config.singular}</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Updated</th>
                <th className="px-4 py-3" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const title = item[config.titleField] || "Untitled";
                const preview =
                  resource === "pages"
                    ? item.route ||
                      (item.slug === "home" ? "/" : item.slug ? `/${item.slug}` : "")
                    : config.previewBase && item.slug
                      ? `${config.previewBase}/${item.slug}`
                      : config.previewBase || "";

                return (
                  <tr key={item.id} className="bg-[var(--card)] align-top">
                    <td className="px-4 py-4">
                      <strong className="block text-sm">{title}</strong>
                      <span className="mt-1 block max-w-[420px] truncate text-xs text-[var(--text-faint)]">
                        {item.slug || item.excerpt || item.url || ""}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {item.status ? (
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${
                            String(item.status).toUpperCase() === "PUBLISHED"
                              ? "bg-[var(--card-soft)] text-[var(--success)]"
                              : "bg-[var(--card-soft)] text-[var(--warning)]"
                          }`}
                        >
                          {item.status}
                        </span>
                      ) : item.visible === false ? (
                        <span className="inline-flex rounded-full bg-[var(--card-soft)] px-2.5 py-1 text-xs font-semibold uppercase text-[var(--warning)]">
                          Hidden
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-[var(--card-soft)] px-2.5 py-1 text-xs font-semibold uppercase text-[var(--success)]">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs text-[var(--text-soft)]">
                      {item.order ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-xs text-[var(--text-soft)]">
                      {item.updatedAt
                        ? new Date(item.updatedAt).toLocaleDateString("en-US")
                        : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-1.5">
                        {preview ? (
                          <Link
                            className="inline-grid h-8 w-8 place-items-center rounded-lg bg-[var(--card-soft)] transition-colors duration-150 hover:bg-[var(--card-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                            href={preview}
                            target="_blank"
                            title="Preview"
                          >
                            <Icon name="external" size={15} />
                          </Link>
                        ) : null}
                        <button
                          className="inline-grid h-8 w-8 cursor-pointer place-items-center rounded-lg bg-[var(--card-soft)] transition-colors duration-150 hover:bg-[var(--card-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                          type="button"
                          onClick={() => openEdit(item)}
                          title="Edit"
                        >
                          <Icon name="edit" size={15} />
                        </button>
                        <button
                          className="inline-grid h-8 w-8 cursor-pointer place-items-center rounded-lg bg-[var(--card-soft)] transition-colors duration-150 hover:bg-[var(--card-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                          type="button"
                          onClick={() => duplicate(item)}
                          title="Duplicate"
                        >
                          <Icon name="copy" size={15} />
                        </button>
                        <button
                          className="inline-grid h-8 w-8 cursor-pointer place-items-center rounded-lg bg-[var(--card-soft)] text-[var(--danger)] transition-colors duration-150 hover:bg-[var(--card-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--danger)]"
                          type="button"
                          onClick={() => remove(item)}
                          title="Delete"
                        >
                          <Icon name="trash" size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

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

      {dialogOpen ? (
        <div
          className="fixed inset-0 z-[100] grid place-items-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="editor-title"
        >
          <button
            className="absolute inset-0 bg-black/70"
            onClick={closeForm}
            aria-label="Close editor"
          />
          <div className="relative z-[1] max-h-[92vh] w-full max-w-[960px] overflow-y-auto rounded-[12px] bg-[var(--page)]">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-[var(--page)] p-5">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.04em] text-[var(--text-faint)]">
                  {editing?.id ? "Edit content" : "Create content"}
                </p>
                <h2 id="editor-title" className="text-2xl font-bold">
                  {editing?.id ? `Edit ${config.singular}` : `New ${config.singular}`}
                </h2>
              </div>
              <button
                className="inline-grid h-8 w-8 cursor-pointer place-items-center rounded-lg bg-[var(--card)] transition-colors duration-150 hover:bg-[var(--card-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                onClick={closeForm}
                aria-label="Close"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <form className="grid gap-5 p-5 pt-0" onSubmit={submit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {config.fields.map((field) => (
                  <EditorField
                    key={field.name}
                    field={field}
                    value={form[field.name]}
                    onChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        [field.name]: value,
                      }))
                    }
                  />
                ))}
              </div>
              <div className="sticky bottom-0 flex justify-end gap-2 bg-[var(--page)] py-4">
                <button
                  className="inline-flex min-h-[38px] cursor-pointer items-center justify-center rounded-[7px] bg-[var(--card)] px-3.5 py-2 text-xs font-bold uppercase transition-colors duration-150 hover:bg-[var(--card-soft)]"
                  type="button"
                  onClick={closeForm}
                >
                  Cancel
                </button>
                <button
                  className="inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2.5 rounded-[7px] bg-[var(--accent)] px-3.5 py-2 text-xs font-bold uppercase text-white transition-colors duration-150 hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-55"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save changes"}
                  <Icon name="check" size={15} />
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function EditorField({ field, value, onChange }) {
  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2.5 text-sm text-[var(--text-soft)] sm:col-span-2">
        <input
          className="h-4 w-4 accent-[#9a000f]"
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>{field.label}</span>
      </label>
    );
  }

  if (field.type === "blocks") {
    return (
      <div className="grid gap-1.5 sm:col-span-2">
        <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">
          {field.label}
        </span>
        <BlockEditor value={value || []} onChange={onChange} />
      </div>
    );
  }

  if (field.type === "image") {
    return (
      <ImageUploadField
        label={field.label}
        value={value || ""}
        onChange={onChange}
        required={field.required}
      />
    );
  }

  if (field.type === "image-list") {
    return (
      <GalleryUploadField
        label={field.label}
        value={Array.isArray(value) ? value : []}
        onChange={onChange}
      />
    );
  }

  if (field.type === "textarea") {
    return (
      <label className="grid gap-1.5 sm:col-span-2">
        <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">
          {field.label}
          {field.required ? " *" : ""}
        </span>
        <textarea
          className="w-full resize-y rounded-[8px] bg-[var(--card)] px-3 py-2.5 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          rows="5"
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          required={field.required}
          placeholder={field.placeholder}
        />
      </label>
    );
  }

  if (field.type === "list") {
    return (
      <label className="grid gap-1.5 sm:col-span-2">
        <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">
          {field.label}
        </span>
        <textarea
          className="w-full resize-y rounded-[8px] bg-[var(--card)] px-3 py-2.5 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          rows="4"
          value={Array.isArray(value) ? value.join("\n") : value || ""}
          onChange={(event) =>
            onChange(
              event.target.value
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean),
            )
          }
          placeholder="One item per line"
        />
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label className="grid gap-1.5">
        <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">
          {field.label}
          {field.required ? " *" : ""}
        </span>
        <select
          className="w-full cursor-pointer appearance-none rounded-[8px] bg-[var(--card)] px-3 py-2.5 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          required={field.required}
        >
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">
        {field.label}
        {field.required ? " *" : ""}
      </span>
      <input
        className="w-full rounded-[8px] bg-[var(--card)] px-3 py-2.5 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        type={field.type === "slug" ? "text" : field.type}
        value={value ?? ""}
        onChange={(event) =>
          onChange(
            field.type === "number" ? Number(event.target.value) : event.target.value,
          )
        }
        required={field.required}
        placeholder={field.placeholder}
      />
    </label>
  );
}
