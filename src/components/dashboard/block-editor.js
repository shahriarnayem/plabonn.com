"use client";

import { cloneElement } from "react";
import { Icon } from "@/components/icon";
import { GalleryUploadField, ImageUploadField } from "@/components/dashboard/image-upload-field";

const blockTypes = [
  "heading",
  "paragraph",
  "image",
  "quote",
  "list",
  "button",
  "code",
  "stats",
  "twoColumn",
  "gallery",
  "cta",
];

function newBlock(type = "paragraph") {
  const dataByType = {
    heading: { text: "New heading", level: 2 },
    paragraph: { text: "Write your paragraph here." },
    image: { url: "", alt: "", caption: "" },
    quote: { text: "", cite: "" },
    list: { items: ["First item", "Second item"], ordered: false },
    button: { text: "Learn more", url: "/contact" },
    code: { code: "", language: "javascript" },
    stats: { items: [{ value: "100+", label: "Projects" }] },
    twoColumn: {
      leftTitle: "Left title",
      leftText: "Left content",
      rightTitle: "Right title",
      rightText: "Right content",
    },
    gallery: { images: [] },
    cta: {
      heading: "Ready to start?",
      text: "Tell us about your project.",
      buttonText: "Contact us",
      buttonUrl: "/contact",
    },
  };

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    data: dataByType[type] || {},
  };
}

export function BlockEditor({ value = [], onChange }) {
  const blocks = Array.isArray(value) ? value : [];

  function update(index, nextBlock) {
    const next = [...blocks];
    next[index] = nextBlock;
    onChange(next);
  }

  function move(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;

    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function remove(index) {
    onChange(blocks.filter((_, blockIndex) => blockIndex !== index));
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3 rounded-[10px] bg-[var(--card-soft)] p-3">
        <span className="text-xs font-bold uppercase tracking-[0.04em] text-[var(--text-soft)]">
          {blocks.length} blocks
        </span>
        <button
          type="button"
          className="inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-[7px] bg-[var(--card)] px-3.5 py-2 text-xs font-bold uppercase transition-colors duration-150 hover:bg-[var(--card-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          onClick={() => onChange([...blocks, newBlock()])}
        >
          <Icon name="plus" size={15} />
          Add block
        </button>
      </div>

      {blocks.length === 0 ? (
        <div className="grid min-h-[150px] place-items-center rounded-[10px] bg-[var(--card-soft)] p-6 text-center text-sm text-[var(--text-soft)]">
          No blocks yet. Add the first content block.
        </div>
      ) : null}

      {blocks.map((block, index) => (
        <div
          className="grid gap-4 rounded-[10px] bg-[var(--card-soft)] p-4"
          key={block.id || index}
        >
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <select
              className="min-h-[38px] cursor-pointer appearance-none rounded-[8px] bg-[var(--card)] px-3 py-2 text-xs font-bold uppercase text-[var(--text)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              value={block.type}
              onChange={(event) => update(index, newBlock(event.target.value))}
              aria-label={`Block ${index + 1} type`}
            >
              {blockTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                type="button"
                className="inline-grid h-8 w-8 cursor-pointer place-items-center rounded-lg bg-[var(--card)] transition-colors duration-150 hover:bg-[var(--card-strong)] disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="Move block up"
              >
                ↑
              </button>
              <button
                type="button"
                className="inline-grid h-8 w-8 cursor-pointer place-items-center rounded-lg bg-[var(--card)] transition-colors duration-150 hover:bg-[var(--card-strong)] disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => move(index, 1)}
                disabled={index === blocks.length - 1}
                aria-label="Move block down"
              >
                ↓
              </button>
              <button
                type="button"
                className="inline-grid h-8 w-8 cursor-pointer place-items-center rounded-lg bg-[var(--card)] text-[var(--danger)] transition-colors duration-150 hover:bg-[var(--card-soft)]"
                onClick={() => remove(index)}
                aria-label="Remove block"
              >
                <Icon name="trash" size={15} />
              </button>
            </div>
          </div>

          <BlockFields
            block={block}
            onChange={(data) => update(index, { ...block, data })}
          />
        </div>
      ))}
    </div>
  );
}

function Field({ label, children, wide = false }) {
  const control = Array.isArray(children) ? children[0] : children;
  const isTextarea = control?.type === "textarea";
  const isSelect = control?.type === "select";

  return (
    <label className={`grid gap-1.5 ${wide ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">
        {label}
      </span>
      {control
        ? cloneElement(control, {
            className: `${isTextarea ? "resize-y" : ""} ${isSelect ? "cursor-pointer appearance-none" : ""} w-full rounded-[8px] bg-[var(--card)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`,
          })
        : null}
    </label>
  );
}

function BlockFields({ block, onChange }) {
  const data = block.data || {};
  const set = (name, value) => onChange({ ...data, [name]: value });

  switch (block.type) {
    case "heading":
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]">
          <Field label="Heading">
            <input
              value={data.text || ""}
              onChange={(event) => set("text", event.target.value)}
            />
          </Field>
          <Field label="Level">
            <select
              value={data.level || 2}
              onChange={(event) => set("level", Number(event.target.value))}
            >
              <option value="2">H2</option>
              <option value="3">H3</option>
              <option value="4">H4</option>
            </select>
          </Field>
        </div>
      );

    case "paragraph":
      return (
        <Field label="Paragraph">
          <textarea
            rows="5"
            value={data.text || ""}
            onChange={(event) => set("text", event.target.value)}
          />
        </Field>
      );

    case "image":
      return (
        <div className="grid gap-4">
          <ImageUploadField
            label="Image"
            value={data.url || ""}
            alt={data.alt || ""}
            onChange={(value) => set("url", value)}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Alt text">
              <input
                value={data.alt || ""}
                onChange={(event) => set("alt", event.target.value)}
              />
            </Field>
            <Field label="Caption">
              <input
                value={data.caption || ""}
                onChange={(event) => set("caption", event.target.value)}
              />
            </Field>
          </div>
        </div>
      );

    case "quote":
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Quote" wide>
            <textarea
              rows="4"
              value={data.text || ""}
              onChange={(event) => set("text", event.target.value)}
            />
          </Field>
          <Field label="Citation" wide>
            <input
              value={data.cite || ""}
              onChange={(event) => set("cite", event.target.value)}
            />
          </Field>
        </div>
      );

    case "list":
      return (
        <div className="grid gap-4">
          <Field label="Items, one per line">
            <textarea
              rows="5"
              value={(data.items || []).join("\n")}
              onChange={(event) =>
                set("items", event.target.value.split("\n").filter(Boolean))
              }
            />
          </Field>
          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-[var(--text-soft)]">
            <input
              type="checkbox"
              checked={Boolean(data.ordered)}
              onChange={(event) => set("ordered", event.target.checked)}
            />
            <span>Numbered list</span>
          </label>
        </div>
      );

    case "button":
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Button text">
            <input
              value={data.text || ""}
              onChange={(event) => set("text", event.target.value)}
            />
          </Field>
          <Field label="Button URL">
            <input
              value={data.url || ""}
              onChange={(event) => set("url", event.target.value)}
            />
          </Field>
        </div>
      );

    case "code":
      return (
        <div className="grid gap-4">
          <Field label="Language">
            <input
              value={data.language || ""}
              onChange={(event) => set("language", event.target.value)}
            />
          </Field>
          <Field label="Code">
            <textarea
              rows="8"
              value={data.code || ""}
              onChange={(event) => set("code", event.target.value)}
            />
          </Field>
        </div>
      );

    case "stats":
      return (
        <Field label="Statistics (one per line: value | label)">
          <textarea
            rows="5"
            value={(data.items || [])
              .map((item) => `${item.value} | ${item.label}`)
              .join("\n")}
            onChange={(event) =>
              set(
                "items",
                event.target.value
                  .split("\n")
                  .filter(Boolean)
                  .map((line) => {
                    const [value, label] = line.split("|");
                    return {
                      value: value?.trim() || "",
                      label: label?.trim() || "",
                    };
                  }),
              )
            }
          />
        </Field>
      );

    case "twoColumn":
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Left title">
            <input
              value={data.leftTitle || ""}
              onChange={(event) => set("leftTitle", event.target.value)}
            />
          </Field>
          <Field label="Right title">
            <input
              value={data.rightTitle || ""}
              onChange={(event) => set("rightTitle", event.target.value)}
            />
          </Field>
          <Field label="Left text">
            <textarea
              rows="4"
              value={data.leftText || ""}
              onChange={(event) => set("leftText", event.target.value)}
            />
          </Field>
          <Field label="Right text">
            <textarea
              rows="4"
              value={data.rightText || ""}
              onChange={(event) => set("rightText", event.target.value)}
            />
          </Field>
        </div>
      );

    case "gallery":
      return (
        <GalleryUploadField
          label="Gallery images"
          value={data.images || []}
          onChange={(images) => set("images", images)}
        />
      );

    case "cta":
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Heading">
            <input
              value={data.heading || ""}
              onChange={(event) => set("heading", event.target.value)}
            />
          </Field>
          <Field label="Text">
            <textarea
              rows="3"
              value={data.text || ""}
              onChange={(event) => set("text", event.target.value)}
            />
          </Field>
          <Field label="Button text">
            <input
              value={data.buttonText || ""}
              onChange={(event) => set("buttonText", event.target.value)}
            />
          </Field>
          <Field label="Button URL">
            <input
              value={data.buttonUrl || ""}
              onChange={(event) => set("buttonUrl", event.target.value)}
            />
          </Field>
        </div>
      );

    default:
      return null;
  }
}
