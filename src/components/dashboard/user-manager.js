"use client";

import { cloneElement, useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/icon";

const empty = {
  name: "",
  email: "",
  password: "",
  cmsRole: "EDITOR",
  status: "ACTIVE",
};

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

    try {
      const query = new URLSearchParams({ limit: "100" });
      if (search) query.set("search", search);

      const response = await fetch(`/api/cms/users?${query}`, {
        cache: "no-store",
      });
      const result = await response.json();

      if (response.ok) {
        setItems(result.items || []);
      } else {
        setNotice({ type: "error", message: result.message || "Unable to load users." });
      }
    } catch {
      setNotice({ type: "error", message: "Unable to connect to the user service." });
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  function openNew() {
    setEditing(null);
    setForm(empty);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      name: item.name || "",
      email: item.email || "",
      password: "",
      cmsRole: item.cmsRole || (item.role === "admin" ? "ADMIN" : "EDITOR"),
      status: item.status || (item.banned ? "SUSPENDED" : "ACTIVE"),
    });
  }

  function close() {
    setEditing(undefined);
    setForm(empty);
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(
        editing?.id ? `/api/cms/users/${editing.id}` : "/api/cms/users",
        {
          method: editing?.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const result = await response.json();

      setNotice({
        type: response.ok ? "success" : "error",
        message: result.message || (response.ok ? "User saved." : "Unable to save user."),
      });

      if (response.ok) {
        close();
        await load();
      }
    } catch {
      setNotice({ type: "error", message: "Unable to connect to the user service." });
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete ${item.name || item.email}?`)) return;

    try {
      const response = await fetch(`/api/cms/users/${item.id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      setNotice({
        type: response.ok ? "success" : "error",
        message: result.message || (response.ok ? "User deleted." : "Unable to delete user."),
      });

      if (response.ok) await load();
    } catch {
      setNotice({ type: "error", message: "Unable to connect to the user service." });
    }
  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="grid gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
            Access control
          </p>
          <h1 className="text-[clamp(24px,3vw,32px)] font-bold leading-[1.05] tracking-[-0.04em]">
            Users
          </h1>
          <p className="max-w-[720px] text-sm leading-[1.7] text-[var(--text-soft)]">
            Create administrator and editor accounts, change roles and suspend access.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex min-h-[38px] w-fit cursor-pointer items-center justify-center gap-2.5 rounded-[7px] bg-[var(--accent)] px-3.5 py-2 text-xs font-bold uppercase tracking-[0.015em] text-white transition-colors duration-150 hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          onClick={openNew}
        >
          <Icon name="plus" size={16} />
          New user
        </button>
      </div>

      {notice ? (
        <div
          className={`rounded-[8px] px-4 py-3 text-sm leading-[1.6] ${
            notice.type === "success"
              ? "bg-[var(--card-soft)] text-[var(--success)]"
              : "bg-[var(--card-soft)] text-[var(--danger)]"
          }`}
          role="status"
        >
          {notice.message}
        </div>
      ) : null}

      <div className="flex flex-col justify-between gap-4 rounded-[12px] bg-[var(--card)] p-4 lg:flex-row lg:items-end">
        <form
          className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            load();
          }}
        >
          <label className="grid flex-1 gap-2 text-xs font-bold uppercase tracking-[0.04em] text-[var(--text-soft)]">
            <span>Search</span>
            <input
              className="w-full rounded-[8px] bg-[var(--card-soft)] px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-[var(--text)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name or email"
            />
          </label>

          <button
            type="submit"
            className="inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-[7px] bg-[var(--card-soft)] px-3.5 py-2 text-xs font-bold uppercase transition-colors duration-150 hover:bg-[var(--card-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            <Icon name="search" size={15} />
            Search
          </button>
        </form>

        <span className="text-xs font-bold uppercase tracking-[0.04em] text-[var(--text-soft)]">
          {items.length} users
        </span>
      </div>

      <div className="overflow-x-auto rounded-[12px] bg-[var(--card)]">
        {loading ? (
          <div className="grid min-h-[220px] place-items-center p-6 text-sm text-[var(--text-soft)]">
            Loading users…
          </div>
        ) : items.length ? (
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-[var(--card-soft)] text-xs uppercase tracking-[0.04em] text-[var(--text-soft)]">
              <tr>
                <th className="px-4 py-3 font-bold">User</th>
                <th className="px-4 py-3 font-bold">Role</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Last login</th>
                <th className="px-4 py-3 font-bold"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isSuspended = item.status === "SUSPENDED" || item.banned;

                return (
                  <tr key={item.id} className="odd:bg-transparent even:bg-[var(--card-soft)]">
                    <td className="px-4 py-3 align-top">
                      <strong className="block text-sm font-bold text-[var(--text)]">
                        {item.name || "Unnamed user"}
                      </strong>
                      <span className="mt-1 block text-xs text-[var(--text-soft)]">
                        {item.email}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="inline-flex rounded-full bg-[var(--card-soft)] px-2 py-1 text-xs font-bold text-[var(--success)]">
                        {item.cmsRole || (item.role === "admin" ? "ADMIN" : "EDITOR")}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${
                          isSuspended
                            ? "bg-[var(--card-soft)] text-[var(--danger)]"
                            : "bg-[var(--card-soft)] text-[var(--success)]"
                        }`}
                      >
                        {item.status || (item.banned ? "SUSPENDED" : "ACTIVE")}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-[var(--text-soft)]">
                      {item.lastLogin
                        ? new Date(item.lastLogin).toLocaleString("en-US")
                        : "Never"}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="inline-grid h-8 w-8 cursor-pointer place-items-center rounded-lg bg-[var(--card-soft)] transition-colors duration-150 hover:bg-[var(--card-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                          onClick={() => openEdit(item)}
                          aria-label={`Edit ${item.name || item.email}`}
                        >
                          <Icon name="edit" size={15} />
                        </button>
                        <button
                          type="button"
                          className="inline-grid h-8 w-8 cursor-pointer place-items-center rounded-lg bg-[var(--card-soft)] text-[var(--danger)] transition-colors duration-150 hover:bg-[var(--card-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--danger)]"
                          onClick={() => remove(item)}
                          aria-label={`Delete ${item.name || item.email}`}
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
        ) : (
          <div className="grid min-h-[220px] place-items-center p-6 text-center">
            <div className="grid gap-2">
              <strong className="text-base">No users found</strong>
              <span className="text-sm text-[var(--text-soft)]">
                Create a user or change the search term.
              </span>
            </div>
          </div>
        )}
      </div>

      {editing !== undefined ? (
        <div className="fixed inset-0 z-[100] grid place-items-center p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 cursor-pointer bg-black/70"
            onClick={close}
            aria-label="Close user editor"
          />

          <div className="relative z-10 grid w-full max-w-[560px] gap-5 rounded-[12px] bg-[var(--surface)] p-5 shadow-2xl shadow-black/20">
            <div className="flex items-start justify-between gap-4">
              <div className="grid gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
                  Account
                </p>
                <h2 className="text-2xl font-bold tracking-[-0.03em]">
                  {editing?.id ? "Edit user" : "Create user"}
                </h2>
              </div>

              <button
                type="button"
                className="inline-grid h-8 w-8 cursor-pointer place-items-center rounded-lg bg-[var(--card)] transition-colors duration-150 hover:bg-[var(--card-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                onClick={close}
                aria-label="Close"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <form className="grid gap-5" onSubmit={save}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name">
                  <input
                    required
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                  />
                </Field>
                <Field label={editing?.id ? "New password (optional)" : "Password"}>
                  <input
                    type="password"
                    required={!editing?.id}
                    minLength="8"
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                  />
                </Field>
                <Field label="CMS role">
                  <select
                    value={form.cmsRole}
                    onChange={(event) => setForm({ ...form, cmsRole: event.target.value })}
                  >
                    <option value="EDITOR">Editor</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </Field>
                <Field label="Status">
                  <select
                    value={form.status}
                    onChange={(event) => setForm({ ...form, status: event.target.value })}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </Field>
              </div>

              <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                <button
                  type="button"
                  className="inline-flex min-h-[38px] cursor-pointer items-center justify-center rounded-[7px] bg-[var(--card)] px-3.5 py-2 text-xs font-bold uppercase transition-colors duration-150 hover:bg-[var(--card-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  onClick={close}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-[7px] bg-[var(--accent)] px-3.5 py-2 text-xs font-bold uppercase text-white transition-colors duration-150 hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-55"
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save user"}
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

function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.04em] text-[var(--text-soft)]">
      <span>{label}</span>
      {cloneElement(children, {
        className:
          "w-full rounded-[8px] bg-[var(--card)] px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-[var(--text)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
      })}
    </label>
  );
}
