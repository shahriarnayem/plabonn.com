import { getDb, serializeDocument, serializeDocuments } from "@/lib/mongodb";
import { escapeRegex } from "@/lib/utils";
import { ensureDefaultContent } from "@/lib/data/bootstrap";
import {
  defaultHomepage,
  defaultSettings,
  navigation as demoNavigation,
  pages as demoPages,
  posts as demoPosts,
  projects as demoProjects,
  services as demoServices,
  testimonials as demoTestimonials,
  categories as demoCategories,
  tags as demoTags,
} from "@/lib/data/demo-data";

const fallbackByCollection = {
  navigation: demoNavigation,
  pages: demoPages,
  posts: demoPosts,
  projects: demoProjects,
  services: demoServices,
  testimonials: demoTestimonials,
  categories: demoCategories,
  tags: demoTags,
};

async function safeCollection(collection, operation, fallback) {
  try {
    await ensureDefaultContent();
    const db = await getDb();
    return await operation(db.collection(collection));
  } catch {
    return fallback;
  }
}

export async function getSettings() {
  return safeCollection(
    "siteSettings",
    async (collection) => serializeDocument(await collection.findOne({ key: "site" })) || defaultSettings,
    defaultSettings,
  );
}

export async function getHomepage() {
  return safeCollection(
    "homepage",
    async (collection) => {
      const item = serializeDocument(
        await collection.findOne({ key: "homepage" }),
      );
      if (!item) return defaultHomepage;

      const storedTechCards = Array.isArray(item.techCards)
        ? item.techCards
        : [];

      return {
        ...defaultHomepage,
        ...item,
        hero: { ...defaultHomepage.hero, ...(item.hero || {}) },
        about: { ...defaultHomepage.about, ...(item.about || {}) },
        techCards: defaultHomepage.techCards.map((fallback, index) => ({
          ...fallback,
          ...(storedTechCards[index] || {}),
        })),
      };
    },
    defaultHomepage,
  );
}

export async function getNavigation() {
  return safeCollection(
    "navigation",
    async (collection) => {
      const items = await collection.find({ visible: { $ne: false } }).sort({ order: 1, createdAt: 1 }).toArray();
      return serializeDocuments(items);
    },
    demoNavigation,
  );
}

export async function getPublished(collection, { limit = 100, featured, category, tag, search, page = 1, sort = { order: 1, publishedAt: -1 } } = {}) {
  const filter = { status: "PUBLISHED" };
  if (featured !== undefined) filter.featured = Boolean(featured);
  if (category) filter.category = category;
  if (tag) filter.tags = tag;
  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ title: regex }, { excerpt: regex }, { clientName: regex }, { name: regex }];
  }
  const skip = Math.max(0, (Number(page) - 1) * Number(limit));
  const fallback = (fallbackByCollection[collection] || [])
    .filter((item) => item.status === undefined || item.status === "PUBLISHED")
    .filter((item) => featured === undefined || Boolean(item.featured) === Boolean(featured))
    .filter((item) => !category || item.category === category)
    .filter((item) => !tag || item.tags?.includes(tag))
    .slice(skip, skip + Number(limit));

  return safeCollection(
    collection,
    async (mongoCollection) => {
      const documents = await mongoCollection.find(filter).sort(sort).skip(skip).limit(Number(limit)).toArray();
      return serializeDocuments(documents);
    },
    fallback,
  );
}

export async function countPublished(collection, filter = {}) {
  const { search, ...rest } = filter;
  const query = { status: "PUBLISHED", ...rest };
  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    query.$or = [{ title: regex }, { excerpt: regex }, { clientName: regex }, { name: regex }];
  }
  const fallback = (fallbackByCollection[collection] || []).filter((item) => {
    if (item.status !== undefined && item.status !== "PUBLISHED") return false;
    for (const [key, value] of Object.entries(rest)) {
      if (key === "tags") {
        if (!item.tags?.includes(value)) return false;
      } else if (item[key] !== value) return false;
    }
    if (search) {
      const haystack = [item.title, item.excerpt, item.clientName, item.name].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(String(search).toLowerCase())) return false;
    }
    return true;
  }).length;
  return safeCollection(collection, (mongoCollection) => mongoCollection.countDocuments(query), fallback);
}

export async function getBySlug(collection, slug, { publishedOnly = true } = {}) {
  const filter = { slug };
  if (publishedOnly) filter.status = "PUBLISHED";
  const fallback = (fallbackByCollection[collection] || []).find((item) => item.slug === slug) || null;
  return safeCollection(
    collection,
    async (mongoCollection) => serializeDocument(await mongoCollection.findOne(filter)),
    fallback,
  );
}

export async function getPageBySlug(slug) {
  return getBySlug("pages", slug);
}

export async function getCategories(scope) {
  const fallback = demoCategories.filter((category) => !scope || category.scope === scope);
  return safeCollection(
    "categories",
    async (collection) => {
      const filter = { status: { $ne: "DRAFT" } };
      if (scope) filter.scope = scope;
      const items = await collection.find(filter).sort({ order: 1, name: 1 }).toArray();
      return serializeDocuments(items);
    },
    fallback,
  );
}

export async function getTags() {
  return safeCollection(
    "tags",
    async (collection) => {
      const items = await collection.find({}).sort({ order: 1, name: 1 }).toArray();
      return serializeDocuments(items);
    },
    demoTags,
  );
}

export async function getAdjacent(collection, current) {
  const items = await getPublished(collection, { limit: 200 });
  const index = items.findIndex((item) => item.slug === current.slug);
  return {
    previous: index > 0 ? items[index - 1] : null,
    next: index >= 0 && index < items.length - 1 ? items[index + 1] : null,
  };
}
