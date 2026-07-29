export function slugify(value = "") {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function stripHtml(value = "") {
  return String(value).replace(/<[^>]*>/g, "").trim();
}

export function excerpt(value = "", length = 160) {
  const clean = stripHtml(value);
  return clean.length > length ? `${clean.slice(0, length).trim()}…` : clean;
}

export function normalizeArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  if (typeof value !== "string") return [];
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export function safeJson(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function formatDate(value, options = {}) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  }).format(date);
}

export function readingTime(blocks = []) {
  const text = blocks
    .map((block) => Object.values(block?.data || {}).join(" "))
    .join(" ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function escapeRegex(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function clampNumber(value, min, max, fallback = min) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

export function safeUrl(value = "", { image = false } = {}) {
  const url = String(value || "").trim();
  if (!url) return "";
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  if (!image && (url.startsWith("#") || url.startsWith("mailto:") || url.startsWith("tel:"))) return url;
  try {
    const parsed = new URL(url);
    if (["http:", "https:"].includes(parsed.protocol)) return parsed.toString();
  } catch {
    return "";
  }
  return "";
}

export function safeHexColor(value = "", fallback = "#6656d9") {
  const color = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color : fallback;
}


const BLOG_FALLBACK_IMAGES = [
  "/placeholders/project-1.png",
  "/placeholders/project-2.png",
  "/placeholders/project-3.png",
  "/placeholders/project-4.png",
  "/placeholders/project-5.png",
  "/placeholders/project-6.png",
];

export function getPostFeaturedImage(post = {}) {
  const direct = safeUrl(post.coverImage || post.featuredImage || "", { image: true });
  if (direct) return direct;
  const key = String(post.slug || post.title || post.id || "post");
  const total = BLOG_FALLBACK_IMAGES.length;
  const hash = Array.from(key).reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
  return BLOG_FALLBACK_IMAGES[hash % total];
}
