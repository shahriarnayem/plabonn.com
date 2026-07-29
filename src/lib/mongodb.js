import { GridFSBucket, MongoClient, ObjectId } from "mongodb";

const configuredUri = process.env.MONGODB_URI?.trim();
const developmentFallback = "mongodb://127.0.0.1:27017/portfolio_cms";
const uri = configuredUri || developmentFallback;

function resolveDatabaseName() {
  if (process.env.MONGODB_DB?.trim()) return process.env.MONGODB_DB.trim();

  try {
    const parsed = new URL(uri);
    return parsed.pathname.replace(/^\//, "") || "portfolio_cms";
  } catch {
    return "portfolio_cms";
  }
}

const dbName = resolveDatabaseName();
const globalMongo = globalThis;

function createMongoClient() {
  return new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 0,
    maxIdleTimeMS: 30_000,
    serverSelectionTimeoutMS: 10_000,
    connectTimeoutMS: 10_000,
    socketTimeoutMS: 20_000,
    retryReads: true,
    retryWrites: true,
  });
}

export const mongoClient =
  globalMongo.__plabonnMongoClient || createMongoClient();

if (!globalMongo.__plabonnMongoClient) {
  globalMongo.__plabonnMongoClient = mongoClient;
}

export const mongoDatabase = mongoClient.db(dbName);

export function hasMongoConfiguration() {
  return Boolean(configuredUri);
}

export async function getDb() {
  if (!configuredUri && process.env.NODE_ENV === "production") {
    throw new Error(
      "MONGODB_URI is missing. Add it to the deployment environment variables and redeploy.",
    );
  }

  if (!globalMongo.__plabonnMongoConnectPromise) {
    globalMongo.__plabonnMongoConnectPromise = mongoClient.connect().catch((error) => {
      globalMongo.__plabonnMongoConnectPromise = null;
      throw error;
    });
  }

  await globalMongo.__plabonnMongoConnectPromise;
  return mongoDatabase;
}

export async function pingDatabase() {
  const db = await getDb();
  const startedAt = Date.now();
  await db.command({ ping: 1 });

  return {
    database: db.databaseName,
    latencyMs: Date.now() - startedAt,
  };
}

export async function getBucket() {
  const db = await getDb();
  return new GridFSBucket(db, { bucketName: "media" });
}

export function toObjectId(value) {
  if (value instanceof ObjectId) return value;
  if (!value || !ObjectId.isValid(String(value))) return null;
  return new ObjectId(String(value));
}

export function serializeDocument(document) {
  if (!document) return null;

  const result = { ...document };
  if (result._id) {
    result.id = result._id.toString();
    delete result._id;
  }

  for (const [key, value] of Object.entries(result)) {
    if (value instanceof Date) result[key] = value.toISOString();
    if (value instanceof ObjectId) result[key] = value.toString();
  }

  return result;
}

export function serializeDocuments(documents = []) {
  return documents.map(serializeDocument);
}
