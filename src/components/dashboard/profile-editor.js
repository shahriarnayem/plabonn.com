"use client";

import { cloneElement, useEffect, useState } from "react";
import { Icon } from "@/components/icon";

export function ProfileEditor() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    fetch("/api/cms/profile", { cache: "no-store" })
      .then((response) => response.json())
      .then((result) => {
        setForm((current) => ({
          ...current,
          name: result.item?.name || "",
          email: result.item?.email || "",
          bio: result.item?.bio || "",
        }));
        setLoading(false);
      });
  }, []);

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    const response = await fetch("/api/cms/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json();
    setNotice({
      type: response.ok ? "success" : "error",
      message: result.message,
    });
    setSaving(false);

    if (response.ok) {
      setForm((current) => ({
        ...current,
        currentPassword: "",
        newPassword: "",
      }));
    }
  }

  if (loading) {
    return (
      <div className="rounded-[12px] bg-[var(--card)] p-8 text-sm text-[var(--text-soft)]">
        Loading profile…
      </div>
    );
  }

  return (
    <section className="grid gap-5">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.04em] text-[var(--text-faint)]">
          Account
        </p>
        <h1 className="text-[clamp(24px,4vw,32px)] font-bold uppercase leading-[1.16] tracking-[-0.03em]">
          Profile
        </h1>
        <p className="mt-2 max-w-[720px] text-sm text-[var(--text-soft)]">
          Update your CMS display information and password.
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

      <form className="grid gap-[14px]" onSubmit={save}>
        <Group
          title="Profile details"
          description="Your email is managed by an administrator."
        >
          <Field label="Name">
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </Field>
          <Field label="Email">
            <input disabled value={form.email} />
          </Field>
          <Field label="Biography" wide>
            <textarea
              rows="6"
              value={form.bio}
              onChange={(event) => setForm({ ...form, bio: event.target.value })}
            />
          </Field>
        </Group>

        <Group
          title="Change password"
          description="Leave both fields empty when you are not changing the password."
        >
          <Field label="Current password">
            <input
              type="password"
              value={form.currentPassword}
              onChange={(event) =>
                setForm({ ...form, currentPassword: event.target.value })
              }
            />
          </Field>
          <Field label="New password">
            <input
              type="password"
              minLength="8"
              value={form.newPassword}
              onChange={(event) =>
                setForm({ ...form, newPassword: event.target.value })
              }
            />
          </Field>
        </Group>

        <div className="sticky bottom-3 flex justify-end rounded-[12px] bg-[var(--page)] py-3">
          <button
            className="inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-[7px] bg-[var(--accent)] px-3.5 py-2 text-xs font-bold uppercase text-white transition-colors duration-150 hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-55"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save profile"}
            <Icon name="check" size={15} />
          </button>
        </div>
      </form>
    </section>
  );
}

function Group({ title, description, children }) {
  return (
    <section className="rounded-[12px] bg-[var(--card)] p-5 sm:p-6">
      <header className="mb-5">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="mt-1 text-xs text-[var(--text-soft)]">{description}</p>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ label, wide = false, children }) {
  const styledControl = cloneElement(children, {
    className: `${children.type === "textarea" ? "resize-y" : ""} w-full rounded-[8px] bg-[var(--card-soft)] px-3 py-2.5 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60`,
  });

  return (
    <label className={`grid gap-1.5 ${wide ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">
        {label}
      </span>
      {styledControl}
    </label>
  );
}
