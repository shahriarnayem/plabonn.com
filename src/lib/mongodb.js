import { GridFSBucket, MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/portfolio_cms";
const dbName = process.env.MONGODB_DB || (() => {
  try {
    const parsed = new URL(uri);
    return parsed.pathname.replace(/^\//, "") || "portfolio_cms";
  } catch {
    return "portfolio_cms";
  }
})();

const globalMongo = globalThis;

export const mongoClient = globalMongo.__portfolioMongoClient || new MongoClient(uri, {
  maxPoolSize: 10,
  minPoolSize: 0,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
});

if (process.env.NODE_ENV !== "production") {
  globalMongo.__portfolioMongoClient = mongoClient;
}

export const mongoDatabase = mongoClient.db(dbName);

let connectPromise = globalMongo.__portfolioMongoConnectPromise;

export async function getDb() {
  if (!connectPromise) {
    connectPromise = mongoClient.connect();
    if (process.env.NODE_ENV !== "production") {
      globalMongo.__portfolioMongoConnectPromise = connectPromise;
    }
  }
  await connectPromise;
  return mongoDatabase;
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
