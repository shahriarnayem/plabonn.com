"use client";

import { useId, useState } from "react";
import { Icon } from "@/components/icon";

async function uploadImage(file, alt = "") {
  const body = new FormData();
  body.set("file", file);
  body.set("alt", alt);

  const response = await fetch("/api/media", {
    method: "POST",
    body,
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "The image could not be uploaded.");
  }

  return result.item;
}

export function ImageUploadField({
  label,
  value = "",
  onChange,
  alt = "",
  required = false,
  help = "JPG, PNG, WebP or GIF. Maximum 6 MB.",
  className = "",
  previewClassName = "aspect-[4/3]",
}) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setMessage("");

    try {
      const item = await uploadImage(file, alt);
      onChange(item.url);
      setMessage("Image uploaded.");
    } catch (error) {
      setMessage(error.message || "The image could not be uploaded.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={`grid gap-2 sm:col-span-2 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">
          {label}
          {required ? " *" : ""}
        </span>
        {value ? (
          <button
            type="button"
            className="rounded-[6px] bg-[var(--card-soft)] px-2.5 py-1.5 text-xs font-semibold text-[var(--danger)] transition-colors duration-150 hover:bg-[var(--card-strong)]"
            onClick={() => onChange("")}
          >
            Remove
          </button>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_190px] sm:items-stretch">
        <div className={`overflow-hidden rounded-[10px] bg-[var(--card-soft)] ${previewClassName}`}>
          {value ? (
            <img
              className="h-full w-full object-cover"
              src={value}
              alt={alt || label}
              width="1200"
              height="900"
            />
          ) : (
            <div className="grid h-full min-h-[150px] place-items-center text-[var(--text-faint)]">
              <Icon name="image" size={28} />
            </div>
          )}
        </div>

        <label
          htmlFor={inputId}
          className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[10px] bg-[var(--card-soft)] p-4 text-center"
        >
          <Icon name="upload" size={24} />
          <strong className="text-xs uppercase">
            {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
          </strong>
          <span className="text-xs leading-[1.45] text-[var(--text-faint)]">{help}</span>
          <input
            id={inputId}
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFile}
            disabled={uploading}
          />
        </label>
      </div>

      {message ? (
        <p className="text-xs text-[var(--text-soft)]" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}

export function GalleryUploadField({
  label,
  value = [],
  onChange,
  className = "",
  max = 30,
}) {
  const inputId = useId();
  const images = Array.isArray(value) ? value : [];
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleFiles(event) {
    const files = Array.from(event.target.files || []).slice(0, Math.max(0, max - images.length));
    event.target.value = "";
    if (!files.length) return;

    setUploading(true);
    setMessage("");

    try {
      const uploaded = [];
      for (const file of files) {
        const item = await uploadImage(file);
        uploaded.push(item.url);
      }
      onChange([...images, ...uploaded].slice(0, max));
      setMessage(`${uploaded.length} image${uploaded.length === 1 ? "" : "s"} uploaded.`);
    } catch (error) {
      setMessage(error.message || "The images could not be uploaded.");
    } finally {
      setUploading(false);
    }
  }

  function remove(index) {
    onChange(images.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className={`grid gap-2 sm:col-span-2 ${className}`}>
      <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">
        {label}
      </span>

      {images.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <div
              className="relative aspect-square overflow-hidden rounded-[10px] bg-[var(--card-soft)]"
              key={`${image}-${index}`}
            >
              <img
                className="h-full w-full object-cover"
                src={image}
                alt={`${label} ${index + 1}`}
                width="600"
                height="600"
              />
              <button
                type="button"
                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-[7px] bg-black/70 text-white transition-colors duration-150 hover:bg-[var(--accent)]"
                onClick={() => remove(index)}
                aria-label={`Remove image ${index + 1}`}
              >
                <Icon name="trash" size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid min-h-[140px] place-items-center rounded-[10px] bg-[var(--card-soft)] text-xs text-[var(--text-faint)]">
          No images uploaded.
        </div>
      )}

      <label
        htmlFor={inputId}
        className="inline-flex min-h-[38px] w-fit cursor-pointer items-center justify-center gap-2 rounded-[7px] bg-[var(--card-soft)] px-3.5 py-2 text-xs font-bold uppercase transition-colors duration-150 hover:bg-[var(--card-strong)]"
      >
        <Icon name="upload" size={15} />
        {uploading ? "Uploading…" : "Upload images"}
        <input
          id={inputId}
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFiles}
          disabled={uploading || images.length >= max}
        />
      </label>

      {message ? (
        <p className="text-xs text-[var(--text-soft)]" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
