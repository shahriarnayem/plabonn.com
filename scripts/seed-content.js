import { loadEnvFile } from "./load-env.js";

loadEnvFile();

const [{ getDb, mongoClient }, demo] = await Promise.all([
  import("../src/lib/mongodb.js"),
  import("../src/lib/data/demo-data.js"),
]);

const timestamp = () => new Date();

function normalizeDocument(item) {
  return {
    ...structuredClone(item),
    createdAt: item.createdAt ? new Date(item.createdAt) : timestamp(),
    updatedAt: timestamp(),
    ...(item.publishedAt ? { publishedAt: new Date(item.publishedAt) } : {}),
    ...(item.completionDate ? { completionDate: new Date(item.completionDate) } : {}),
  };
}

async function upsertMany(collection, documents, uniqueKey = "slug") {
  for (const raw of documents) {
    const document = normalizeDocument(raw);
    const value = document[uniqueKey];
    if (value === undefined) continue;
    await collection.updateOne(
      { [uniqueKey]: value },
      { $set: document, $setOnInsert: { createdAt: document.createdAt } },
      { upsert: true },
    );
  }
}

async function ensureIndexes(db) {
  await Promise.all([
    db.collection("user").createIndex({ email: 1 }, { unique: true, sparse: true }),
    db.collection("services").createIndex({ slug: 1 }, { unique: true }),
    db.collection("projects").createIndex({ slug: 1 }, { unique: true }),
    db.collection("projects").createIndex({ status: 1, featured: 1, order: 1 }),
    db.collection("testimonials").createIndex({ status: 1, featured: 1, order: 1 }),
    db.collection("posts").createIndex({ slug: 1 }, { unique: true }),
    db.collection("posts").createIndex({ status: 1, category: 1, publishedAt: -1 }),
    db.collection("pages").createIndex({ slug: 1 }, { unique: true }),
    db.collection("categories").createIndex({ scope: 1, slug: 1 }, { unique: true }),
    db.collection("tags").createIndex({ slug: 1 }, { unique: true }),
    db.collection("navigation").createIndex({ url: 1 }, { unique: true }),
    db.collection("contactMessages").createIndex({ createdAt: -1, status: 1 }),
    db.collection("activityLogs").createIndex({ createdAt: -1 }),
  ]);
}

async function main() {
  const db = await getDb();

  await db.collection("siteSettings").updateOne(
    { key: "site" },
    { $set: normalizeDocument(demo.defaultSettings) },
    { upsert: true },
  );
  await db.collection("homepage").updateOne(
    { key: "homepage" },
    { $set: normalizeDocument(demo.defaultHomepage) },
    { upsert: true },
  );

  await upsertMany(db.collection("navigation"), demo.navigation, "url");
  await upsertMany(db.collection("categories"), demo.categories, "slug");
  await upsertMany(db.collection("tags"), demo.tags, "slug");
  await upsertMany(db.collection("services"), demo.services);
  await upsertMany(db.collection("projects"), demo.projects);
  await upsertMany(db.collection("testimonials"), demo.testimonials, "clientName");
  await upsertMany(db.collection("posts"), demo.posts);
  await upsertMany(db.collection("pages"), demo.pages);

  await ensureIndexes(db);
  await db.collection("activityLogs").insertOne({
    action: "seed.content",
    description: "Demonstration website content was seeded.",
    createdAt: timestamp(),
  });

  console.log("✓ Demonstration content and database indexes are ready.");
}

main()
  .catch((error) => {
    console.error("✗ Content seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoClient.close().catch(() => {});
  });
