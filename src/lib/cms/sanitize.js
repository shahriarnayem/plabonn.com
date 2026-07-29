import {
  normalizeArray,
  readingTime,
  safeHexColor,
  safeJson,
  safeUrl,
  slugify,
} from "@/lib/utils";

function trimText(value, max = 12000) {
  return String(value ?? "").slice(0, max);
}

function mediaValue(value) {
  return trimText(value, 1000).trim();
}

export function sanitizeResourcePayload(config, input = {}, existing = null) {
  const output = {};

  for (const field of config.fields) {
    let value = input[field.name];
    if (value === undefined) continue;

    if (field.type === "checkbox") value = Boolean(value);
    if (field.type === "number") {
      value = Number.isFinite(Number(value)) ? Number(value) : 0;
    }
    if (field.type === "list") value = normalizeArray(value);
    if (field.type === "image-list") {
      value = normalizeArray(value).slice(0, 30).map(mediaValue).filter(Boolean);
    }
    if (field.type === "blocks") {
      value = sanitizeBlocks(safeJson(value, Array.isArray(value) ? value : []));
    }
    if (field.type === "date") value = value ? new Date(value) : null;
    if (
      [
        "text",
        "textarea",
        "url",
        "image",
        "slug",
        "select",
        "color",
      ].includes(field.type)
    ) {
      value = value === null ? "" : String(value).trim();
    }
    if (field.type === "url") value = safeUrl(value);
    if (field.type === "image") value = mediaValue(value);
    if (field.type === "color") value = safeHexColor(value);

    output[field.name] = value;
  }

  if (
    Object.prototype.hasOwnProperty.call(output, "title") &&
    (!output.slug || !String(output.slug).trim())
  ) {
    output.slug = slugify(output.title);
  }
  if (
    Object.prototype.hasOwnProperty.call(output, "name") &&
    (!output.slug || !String(output.slug).trim())
  ) {
    output.slug = slugify(output.name);
  }
  if (output.slug) output.slug = slugify(output.slug);

  if (
    config.collection === "posts" &&
    (!output.readingTime || output.readingTime < 1)
  ) {
    const blocks = output.content || existing?.content || [];
    output.readingTime = readingTime(blocks);
  }

  if (output.status === "PUBLISHED" && !existing?.publishedAt) {
    output.publishedAt = new Date();
  }
  if (output.status === "DRAFT") output.publishedAt = null;

  output.updatedAt = new Date();
  if (!existing) output.createdAt = new Date();
  return output;
}

export function validateRequiredFields(config, payload) {
  const errors = {};
  for (const field of config.fields) {
    if (!field.required) continue;
    const value = payload[field.name];
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      errors[field.name] = `${field.label} is required.`;
    }
  }
  return errors;
}

const allowedBlockTypes = new Set([
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
]);

function sanitizeBlocks(blocks) {
  if (!Array.isArray(blocks)) return [];

  return blocks
    .slice(0, 200)
    .filter((block) => allowedBlockTypes.has(block?.type))
    .map((block, index) => {
      const data =
        block?.data && typeof block.data === "object" ? block.data : {};
      const clean = {};

      for (const [key, raw] of Object.entries(data)) {
        if (["buttonUrl"].includes(key)) {
          clean[key] = safeUrl(raw);
        } else if (key === "url" && block.type !== "image") {
          clean[key] = safeUrl(raw);
        } else if (key === "images") {
          clean[key] = normalizeArray(raw)
            .slice(0, 30)
            .map(mediaValue)
            .filter(Boolean);
        } else if (key === "items" && Array.isArray(raw)) {
          clean[key] = raw.slice(0, 100).map((item) =>
            typeof item === "object"
              ? {
                  value: trimText(item.value, 120),
                  label: trimText(item.label, 240),
                }
              : trimText(item, 1000),
          );
        } else if (typeof raw === "boolean" || typeof raw === "number") {
          clean[key] = raw;
        } else {
          clean[key] = trimText(raw);
        }
      }

      if (block.type === "image") clean.url = mediaValue(data.url);

      return {
        id: trimText(block.id || `${block.type}-${index}`, 120),
        type: block.type,
        data: clean,
      };
    });
}
