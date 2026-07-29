"use client";

import { cloneElement, useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { ImageUploadField } from "@/components/dashboard/image-upload-field";

export function HomepageEditor() {
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/cms/homepage", { cache: "no-store" })
      .then((response) => response.json())
      .then((result) => setForm(result.item));
  }, []);

  if (!form) {
    return (
      <div className="rounded-[12px] bg-[var(--card)] p-8 text-sm text-[var(--text-soft)]">
        Loading homepage content…
      </div>
    );
  }

  const update = (path, value) => {
    const [group, key] = path.split(".");
    if (key) {
      setForm((current) => ({
        ...current,
        [group]: { ...current[group], [key]: value },
      }));
    } else {
      setForm((current) => ({ ...current, [path]: value }));
    }
  };

  const updateTechCard = (index, key, value) => {
    setForm((current) => ({
      ...current,
      techCards: (current.techCards || []).map((card, cardIndex) =>
        cardIndex === index ? { ...card, [key]: value } : card,
      ),
    }));
  };

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    const response = await fetch("/api/cms/homepage", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json();
    setStatus({ type: response.ok ? "success" : "error", message: result.message });
    setSaving(false);
  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.04em] text-[var(--text-faint)]">
            Homepage CMS
          </p>
          <h1 className="text-[clamp(24px,4vw,32px)] font-bold uppercase leading-[1.16] tracking-[-0.03em]">
            Homepage
          </h1>
          <p className="mt-2 max-w-[720px] text-sm text-[var(--text-soft)]">
            Edit homepage copy, portrait and full-image technology cards from one screen.
          </p>
        </div>
        <a
          className="inline-flex min-h-[38px] w-fit items-center justify-center gap-2 rounded-[7px] bg-[var(--card)] px-3.5 py-2 text-xs font-bold uppercase transition-colors duration-150 hover:bg-[var(--card-soft)]"
          href="/"
          target="_blank"
        >
          Preview homepage
          <Icon name="external" size={15} />
        </a>
      </div>

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
        <SettingsGroup
          title="Hero card"
          description="The two-column heading card and profile image."
        >
          <Field label="Eyebrow">
            <input
              value={form.hero?.eyebrow || ""}
              onChange={(event) => update("hero.eyebrow", event.target.value)}
            />
          </Field>
          <Field label="Heading" wide>
            <textarea
              rows="4"
              value={form.hero?.heading || ""}
              onChange={(event) => update("hero.heading", event.target.value)}
            />
          </Field>
          <Field label="Paragraph" wide>
            <textarea
              rows="4"
              value={form.hero?.paragraph || ""}
              onChange={(event) => update("hero.paragraph", event.target.value)}
            />
          </Field>
          <Field label="Button text">
            <input
              value={form.hero?.ctaText || ""}
              onChange={(event) => update("hero.ctaText", event.target.value)}
            />
          </Field>
          <Field label="Button URL">
            <input
              value={form.hero?.ctaUrl || ""}
              onChange={(event) => update("hero.ctaUrl", event.target.value)}
            />
          </Field>
          <Field label="Availability text">
            <input
              value={form.hero?.availability || ""}
              onChange={(event) => update("hero.availability", event.target.value)}
            />
          </Field>
          <ImageUploadField
            label="Portrait image"
            value={form.hero?.image || ""}
            alt={form.hero?.imageAlt || ""}
            onChange={(value) => update("hero.image", value)}
            previewClassName="aspect-square"
          />
          <Field label="Portrait alt text" wide>
            <input
              value={form.hero?.imageAlt || ""}
              onChange={(event) => update("hero.imageAlt", event.target.value)}
            />
          </Field>
        </SettingsGroup>

        <SettingsGroup
          title="Hero technology images"
          description="Each card is a full image, just like the portrait card. Upload an image and set its accessible label and destination."
        >
          {(form.techCards || []).slice(0, 3).map((card, index) => (
            <div
              className="grid gap-4 rounded-[10px] bg-[var(--card-soft)] p-4 sm:col-span-2"
              key={card.id || index}
            >
              <div className="flex items-center justify-between gap-3">
                <strong className="text-sm">Technology card {index + 1}</strong>
                <span className="text-xs text-[var(--text-faint)]">
                  {card.label || "Untitled"}
                </span>
              </div>
              <ImageUploadField
                label="Card image"
                value={card.image || ""}
                alt={card.imageAlt || card.label || ""}
                onChange={(value) => updateTechCard(index, "image", value)}
                previewClassName="aspect-square"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Label">
                  <input
                    value={card.label || ""}
                    onChange={(event) =>
                      updateTechCard(index, "label", event.target.value)
                    }
                  />
                </Field>
                <Field label="Destination link">
                  <input
                    value={card.href || ""}
                    onChange={(event) =>
                      updateTechCard(index, "href", event.target.value)
                    }
                  />
                </Field>
                <Field label="Image alt text" wide>
                  <input
                    value={card.imageAlt || ""}
                    onChange={(event) =>
                      updateTechCard(index, "imageAlt", event.target.value)
                    }
                  />
                </Field>
              </div>
            </div>
          ))}
        </SettingsGroup>

        <SettingsGroup
          title="About card"
          description="The tall summary card beside the portrait."
        >
          <Field label="Label">
            <input
              value={form.about?.label || ""}
              onChange={(event) => update("about.label", event.target.value)}
            />
          </Field>
          <Field label="Experience">
            <input
              value={form.about?.experience || ""}
              onChange={(event) => update("about.experience", event.target.value)}
            />
          </Field>
          <Field label="Main biography" wide>
            <textarea
              rows="5"
              value={form.about?.bio || ""}
              onChange={(event) => update("about.bio", event.target.value)}
            />
          </Field>
          <Field label="Secondary biography" wide>
            <textarea
              rows="5"
              value={form.about?.secondary || ""}
              onChange={(event) => update("about.secondary", event.target.value)}
            />
          </Field>
          <Field label="Skills, one per line" wide>
            <textarea
              rows="5"
              value={(form.about?.skills || []).join("\n")}
              onChange={(event) =>
                update("about.skills", event.target.value.split("\n").filter(Boolean))
              }
            />
          </Field>
        </SettingsGroup>

        <SettingsGroup
          title="Section headings"
          description="Heading and support copy for Works, Reviews, CTA and Blog."
        >
          {[
            ["worksHeading", "Works heading", true],
            ["worksDescription", "Works description", true],
            ["reviewsHeading", "Reviews heading", true],
            ["reviewsDescription", "Reviews description", true],
            ["ctaHeading", "CTA heading", true],
            ["ctaSupporting", "CTA supporting text", true],
            ["ctaText", "CTA button text"],
            ["ctaUrl", "CTA button URL"],
            ["blogHeading", "Blog heading", true],
            ["blogDescription", "Blog description", true],
          ].map(([name, label, wide]) => (
            <Field key={name} label={label} wide={wide}>
              {wide ? (
                <textarea
                  rows="3"
                  value={form[name] || ""}
                  onChange={(event) => update(name, event.target.value)}
                />
              ) : (
                <input
                  value={form[name] || ""}
                  onChange={(event) => update(name, event.target.value)}
                />
              )}
            </Field>
          ))}
        </SettingsGroup>

        <div className="sticky bottom-3 flex justify-end rounded-[12px] bg-[var(--page)] py-3">
          <button
            className="inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2.5 rounded-[7px] bg-[var(--accent)] px-3.5 py-2 text-xs font-bold uppercase text-white transition-colors duration-150 hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-55"
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save homepage"}
            <Icon name="check" size={15} />
          </button>
        </div>
      </form>
    </section>
  );
}

function SettingsGroup({ title, description, children }) {
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
  const control = Array.isArray(children) ? children[0] : children;
  const styledControl = control
    ? cloneElement(control, {
        className: `${control.type === "textarea" ? "resize-y" : ""} w-full rounded-[8px] bg-[var(--card-soft)] px-3 py-2.5 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`,
      })
    : null;

  return (
    <label className={`grid gap-1.5 ${wide ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">
        {label}
      </span>
      {styledControl}
    </label>
  );
}
