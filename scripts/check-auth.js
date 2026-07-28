import { loadEnvFiles } from "./load-env.js";

loadEnvFiles();

const [{ auth }, { mongoClient, getDb }] = await Promise.all([
  import("../src/lib/auth.js"),
  import("../src/lib/mongodb.js"),
]);

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@portfolio.local").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";
  const baseURL = (
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");

  const db = await getDb();
  const user = await db.collection("user").findOne({ email });
  if (!user) throw new Error(`No user exists for ${email} in database ${db.databaseName}.`);

  const credential = await db.collection("account").findOne({
    providerId: "credential",
    userId: { $in: [user._id, String(user._id)] },
  });
  if (!credential?.password) throw new Error("Credential account/password is missing.");

  await auth.api.signInEmail({
    body: { email, password, rememberMe: false },
    headers: new Headers({ origin: baseURL, referer: `${baseURL}/login` }),
  });

  await db.collection("session").deleteMany({
    userId: { $in: [user._id, String(user._id)] },
  });

  console.log("✓ Better Auth accepted the configured administrator credentials");
  console.log(`  Database: ${db.databaseName}`);
  console.log(`  Email: ${email}`);
}

main()
  .catch((error) => {
    console.error("✗ Auth check failed:", error?.body?.message || error?.message || String(error));
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoClient.close().catch(() => {});
  });
