"use client";

import { cloneElement, useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { ImageUploadField } from "@/components/dashboard/image-upload-field";

export function SettingsEditor({ mode = "general", canEdit = true }) {
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/cms/settings", { cache: "no-store" })
      .then((response) => response.json())
      .then((result) => setForm(result.item));
  }, []);

  if (!form) {
    return (
      <div className="rounded-[12px] bg-[var(--card)] p-8 text-sm text-[var(--text-soft)]">
        Loading settings…
      </div>
    );
  }

  const set = (name, value) =>
    setForm((current) => ({ ...current, [name]: value }));

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    const response = await fetch("/api/cms/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json();
    setStatus({
      type: response.ok ? "success" : "error",
      message: result.message,
    });
    setSaving(false);
  }

  const title = mode === "seo" ? "SEO settings" : "Website settings";

  return (
    <section className="grid gap-5">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.04em] text-[var(--text-faint)]">
          Website configuration
        </p>
        <h1 className="text-[clamp(24px,4vw,32px)] font-bold uppercase leading-[1.16] tracking-[-0.03em]">
          {title}
        </h1>
        <p className="mt-2 max-w-[760px] text-sm text-[var(--text-soft)]">
          {mode === "seo"
            ? "Control default metadata, social sharing and search engine defaults."
            : "Manage branding, contact details, theme behavior and homepage controls."}
        </p>
      </div>

      {!canEdit ? (
        <div className="rounded-[10px] bg-[var(--card-soft)] px-4 py-3 text-xs text-[var(--danger)]">
          Only administrators can save website settings.
        </div>
      ) : null}

      {status ? (
        <div
          className={`rounded-[10px] px-4 py-3 text-xs ${
            status.type === "success"
              ? "bg-[var(--card-soft)] text-[var(--success)]"
              : "bg-[var(--card-soft)] text-[var(--danger)]"
          }`}
        >
          {status.message}
        </div>
      ) : null}

      <form className="grid gap-[14px]" onSubmit={save}>
        {mode === "seo" ? (
          <>
            <Group
              title="Default metadata"
              description="Used when a page or content item does not have custom SEO fields."
            >
              <Field label="Default SEO title" wide>
                <input
                  value={form.defaultSeoTitle || ""}
                  onChange={(event) => set("defaultSeoTitle", event.target.value)}
                />
              </Field>
              <Field label="Default meta description" wide>
                <textarea
                  rows="4"
                  value={form.defaultSeoDescription || ""}
                  onChange={(event) =>
                    set("defaultSeoDescription", event.target.value)
                  }
                />
              </Field>
              <ImageUploadField
                label="Default social image"
                value={form.defaultSocialImage || ""}
                onChange={(value) => set("defaultSocialImage", value)}
                previewClassName="aspect-[16/9]"
              />
            </Group>

            <Group
              title="SEO checklist"
              description="Technical SEO is generated automatically by Next.js."
            >
              <div className="grid gap-3 sm:col-span-2">
                {[
                  "Dynamic titles and descriptions",
                  "Canonical and social metadata",
                  "Sitemap and robots rules",
                  "Article and project structured data",
                  "Dashboard pages set to noindex",
                ].map((item) => (
                  <span
                    className="flex items-center gap-2.5 rounded-[8px] bg-[var(--card-soft)] px-3 py-2.5 text-sm"
                    key={item}
                  >
                    <span className="text-[var(--success)]">
                      <Icon name="check" size={16} />
                    </span>
                    {item}
                  </span>
                ))}
              </div>
            </Group>
          </>
        ) : (
          <>
            <Group
              title="Branding"
              description="Text logo, optional image assets and the global color system."
            >
              <Field label="Website name">
                <input
                  value={form.siteName || ""}
                  onChange={(event) => set("siteName", event.target.value)}
                />
              </Field>
              <Field label="Text logo">
                <input
                  value={form.textLogo || ""}
                  onChange={(event) => set("textLogo", event.target.value)}
                />
              </Field>
              <ImageUploadField
                label="Logo image"
                value={form.logoImage || ""}
                onChange={(value) => set("logoImage", value)}
                previewClassName="aspect-[3/1]"
              />
              <ImageUploadField
                label="Light logo"
                value={form.lightLogo || ""}
                onChange={(value) => set("lightLogo", value)}
                previewClassName="aspect-[3/1]"
              />
              <ImageUploadField
                label="Dark logo"
                value={form.darkLogo || ""}
                onChange={(value) => set("darkLogo", value)}
                previewClassName="aspect-[3/1]"
              />
              <ImageUploadField
                label="Favicon"
                value={form.favicon || ""}
                onChange={(value) => set("favicon", value)}
                previewClassName="aspect-square max-w-[180px]"
              />
              <Field label="Accent color">
                <input
                  className="h-[42px] cursor-pointer p-1"
                  type="color"
                  value={form.accentColor || "#9a000f"}
                  onChange={(event) => set("accentColor", event.target.value)}
                />
              </Field>
              <Field label="Default theme">
                <select
                  value={form.defaultTheme || "system"}
                  onChange={(event) => set("defaultTheme", event.target.value)}
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </Field>
            </Group>

            <Group
              title="Contact and footer"
              description="Displayed on public contact and footer areas."
            >
              <Field label="Contact email">
                <input
                  type="email"
                  value={form.contactEmail || ""}
                  onChange={(event) => set("contactEmail", event.target.value)}
                />
              </Field>
              <Field label="Phone">
                <input
                  value={form.phone || ""}
                  onChange={(event) => set("phone", event.target.value)}
                />
              </Field>
              <Field label="Location">
                <input
                  value={form.location || ""}
                  onChange={(event) => set("location", event.target.value)}
                />
              </Field>
              <Field label="Footer copyright">
                <input
                  value={form.footerCopyright || ""}
                  onChange={(event) =>
                    set("footerCopyright", event.target.value)
                  }
                />
              </Field>
              <Field label="Social links JSON" wide>
                <textarea
                  rows="5"
                  value={JSON.stringify(form.socialLinks || {}, null, 2)}
                  onChange={(event) => {
                    try {
                      set("socialLinks", JSON.parse(event.target.value));
                    } catch {
                      // Keep the previous valid JSON until the input becomes valid.
                    }
                  }}
                />
              </Field>
            </Group>

            <Group
              title="Homepage controls"
              description="Control visibility, order and the number of dynamic cards."
            >
              <Field label="Project count">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={form.homeProjectCount || 5}
                  onChange={(event) =>
                    set("homeProjectCount", Number(event.target.value))
                  }
                />
              </Field>
              <Field label="Review count">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={form.homeTestimonialCount || 5}
                  onChange={(event) =>
                    set("homeTestimonialCount", Number(event.target.value))
                  }
                />
              </Field>
              <Field label="Blog count">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={form.homePostCount || 10}
                  onChange={(event) =>
                    set("homePostCount", Number(event.target.value))
                  }
                />
              </Field>
              <Field label="Section order" wide>
                <input
                  value={(form.sectionOrder || []).join(", ")}
                  onChange={(event) =>
                    set(
                      "sectionOrder",
                      event.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    )
                  }
                />
              </Field>

              <div className="grid gap-2 sm:col-span-2">
                <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">
                  Visible sections
                </span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {["hero", "works", "reviews", "cta", "blog"].map(
                    (section) => (
                      <label
                        className="flex items-center gap-2 rounded-[8px] bg-[var(--card-soft)] px-3 py-2.5 text-sm"
                        key={section}
                      >
                        <input
                          className="h-4 w-4 accent-[#9a000f]"
                          type="checkbox"
                          checked={form.sectionVisibility?.[section] !== false}
                          onChange={(event) =>
                            set("sectionVisibility", {
                              ...form.sectionVisibility,
                              [section]: event.target.checked,
                            })
                          }
                        />
                        <span>{section}</span>
                      </label>
                    ),
                  )}
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-sm text-[var(--text-soft)]">
                <input
                  className="h-4 w-4 accent-[#9a000f]"
                  type="checkbox"
                  checked={Boolean(form.headerSticky)}
                  onChange={(event) => set("headerSticky", event.target.checked)}
                />
                <span>Sticky public header</span>
              </label>
              <label className="flex items-center gap-2.5 text-sm text-[var(--text-soft)]">
                <input
                  className="h-4 w-4 accent-[#9a000f]"
                  type="checkbox"
                  checked={Boolean(form.maintenanceMode)}
                  onChange={(event) =>
                    set("maintenanceMode", event.target.checked)
                  }
                />
                <span>Maintenance mode flag</span>
              </label>
            </Group>
          </>
        )}

        <div className="sticky bottom-3 flex justify-end rounded-[12px] bg-[var(--page)] py-3">
          <button
            className="inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-[7px] bg-[var(--accent)] px-3.5 py-2 text-xs font-bold uppercase text-white transition-colors duration-150 hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-55"
            type="submit"
            disabled={!canEdit || saving}
          >
            {saving ? "Saving…" : "Save settings"}
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
  const existing = children.props.className || "";
  const styledControl = cloneElement(children, {
    className: `${existing} ${children.type === "textarea" ? "resize-y" : ""} w-full rounded-[8px] bg-[var(--card-soft)] px-3 py-2.5 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`,
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
