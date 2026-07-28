import { getDb } from "@/lib/mongodb";
import {
  defaultHomepage,
  defaultSettings,
  navigation,
  pages,
  posts,
  projects,
  services,
  testimonials,
  categories,
  tags,
} from "@/lib/data/demo-data";

const globalBootstrap = globalThis;

function withTimestamps(document) {
  const now = new Date();
  return {
    ...document,
    createdAt: document.createdAt || now,
    updatedAt: document.updatedAt || now,
  };
}

async function insertMissing(collection, documents, makeFilter) {
  if (!documents.length) return;
  await collection.bulkWrite(
    documents.map((raw) => {
      const document = withTimestamps(raw);
      return {
        updateOne: {
          filter: makeFilter(document),
          update: { $setOnInsert: document },
          upsert: true,
        },
      };
    }),
    { ordered: false },
  );
}

async function backfillSystemPageFields(collection) {
  const operations = [];
  for (const page of pages) {
    for (const field of ["heading", "route", "systemPage"]) {
      if (page[field] === undefined) continue;
      operations.push({
        updateOne: {
          filter: { slug: page.slug, [field]: { $exists: false } },
          update: { $set: { [field]: page[field], updatedAt: new Date() } },
        },
      });
    }
  }
  if (operations.length) await collection.bulkWrite(operations, { ordered: false });
}

async function createIndexes(db) {
  await Promise.allSettled([
    db.collection("services").createIndex({ slug: 1 }, { unique: true }),
    db.collection("projects").createIndex({ slug: 1 }, { unique: true }),
    db.collection("posts").createIndex({ slug: 1 }, { unique: true }),
    db.collection("pages").createIndex({ slug: 1 }, { unique: true }),
    db.collection("categories").createIndex({ scope: 1, slug: 1 }, { unique: true }),
    db.collection("tags").createIndex({ slug: 1 }, { unique: true }),
    db.collection("navigation").createIndex({ url: 1 }, { unique: true }),
    db.collection("projects").createIndex({ status: 1, featured: 1, order: 1 }),
    db.collection("testimonials").createIndex({ status: 1, featured: 1, order: 1 }),
    db.collection("posts").createIndex({ status: 1, category: 1, publishedAt: -1 }),
  ]);
}

async function bootstrapDatabase() {
  const db = await getDb();
  const markerCollection = db.collection("systemMeta");
  const markerKey = "default-content-v3";

  // Core website records are always checked. This keeps every built-in route
  // available in MongoDB even when a database was created by an older build,
  // or an individual collection was removed later.
  await db.collection("siteSettings").updateOne(
    { key: "site" },
    { $setOnInsert: withTimestamps(defaultSettings) },
    { upsert: true },
  );

  await db.collection("siteSettings").updateOne(
    { key: "site", accentColor: { $in: [null, "", "#d73552", "#b7001e"] } },
    { $set: { accentColor: "#9a000f", updatedAt: new Date() } },
  );

  await db.collection("homepage").updateOne(
    { key: "homepage" },
    { $setOnInsert: withTimestamps(defaultHomepage) },
    { upsert: true },
  );

  await Promise.all([
    insertMissing(db.collection("navigation"), navigation, (item) => ({ url: item.url })),
    insertMissing(db.collection("pages"), pages, (item) => ({ slug: item.slug })),
  ]);
  await backfillSystemPageFields(db.collection("pages"));

  const completed = await markerCollection.findOne({ key: markerKey });
  if (!completed) {
    await Promise.all([
      insertMissing(db.collection("services"), services, (item) => ({ slug: item.slug })),
      insertMissing(db.collection("projects"), projects, (item) => ({ slug: item.slug })),
      insertMissing(db.collection("testimonials"), testimonials, (item) => ({ clientName: item.clientName })),
      insertMissing(db.collection("posts"), posts, (item) => ({ slug: item.slug })),
      insertMissing(db.collection("categories"), categories, (item) => ({ scope: item.scope, slug: item.slug })),
      insertMissing(db.collection("tags"), tags, (item) => ({ slug: item.slug })),
    ]);

    await markerCollection.updateOne(
      { key: markerKey },
      { $set: { key: markerKey, completedAt: new Date(), version: 3 } },
      { upsert: true },
    );
  }

  await createIndexes(db);
  return true;
}

export async function ensureDefaultContent() {
  if (!process.env.MONGODB_URI) return false;

  if (!globalBootstrap.__plabonnDefaultContentPromise) {
    globalBootstrap.__plabonnDefaultContentPromise = bootstrapDatabase().catch((error) => {
      globalBootstrap.__plabonnDefaultContentPromise = null;
      throw error;
    });
  }

  return globalBootstrap.__plabonnDefaultContentPromise;
}
