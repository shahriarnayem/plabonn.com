import { loadEnvFiles } from "./load-env.js";

loadEnvFiles();

const [
  { betterAuth },
  { mongodbAdapter },
  { mongoClient, mongoDatabase, getDb },
] = await Promise.all([
  import("better-auth"),
  import("better-auth/adapters/mongodb"),
  import("../src/lib/mongodb.js"),
]);

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getBaseUrl() {
  return (
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

async function removeExistingAdmin(db, email) {
  const users = await db
    .collection("user")
    .find({ email: new RegExp(`^${escapeRegex(email)}$`, "i") })
    .toArray();

  if (!users.length) return;

  const ids = users.flatMap((user) => [user._id, String(user._id)]);

  await Promise.all([
    db.collection("account").deleteMany({ userId: { $in: ids } }),
    db.collection("session").deleteMany({ userId: { $in: ids } }),
    db.collection("user").deleteMany({ _id: { $in: users.map((user) => user._id) } }),
  ]);
}

async function main() {
  const name = process.env.ADMIN_NAME?.trim() || "Site Administrator";
  const email = (process.env.ADMIN_EMAIL || "admin@portfolio.local")
    .trim()
    .toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";
  const baseURL = getBaseUrl();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("ADMIN_EMAIL is not a valid email address.");
  }
  if (password.length < 8 || password.length > 128) {
    throw new Error("ADMIN_PASSWORD must contain between 8 and 128 characters.");
  }
  if (!process.env.MONGODB_URI) {
    console.warn("! MONGODB_URI is missing. Using the local MongoDB fallback.");
  }

  const db = await getDb();

  // Recreate this one account through Better Auth itself. This avoids stale,
  // manually shaped credential records and guarantees the password is hashed
  // in exactly the format expected by the installed Better Auth version.
  await removeExistingAdmin(db, email);

  const seedAuth = betterAuth({
    appName: "Portfolio CMS Admin Seed",
    baseURL,
    secret:
      process.env.BETTER_AUTH_SECRET ||
      "development-secret-change-this-before-production-123456",
    database: mongodbAdapter(mongoDatabase, { client: mongoClient }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: false,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      autoSignIn: false,
    },
    user: {
      additionalFields: {
        cmsRole: {
          type: "string",
          defaultValue: "EDITOR",
          input: true,
          returned: true,
        },
        status: {
          type: "string",
          defaultValue: "ACTIVE",
          input: true,
          returned: true,
        },
        bio: {
          type: "string",
          required: false,
          input: true,
          returned: true,
        },
        lastLogin: {
          type: "date",
          required: false,
          input: false,
          returned: true,
        },
      },
    },
  });

  await seedAuth.api.signUpEmail({
    body: {
      name,
      email,
      password,
      cmsRole: "ADMIN",
      status: "ACTIVE",
    },
  });

  const user = await db.collection("user").findOne({ email });
  if (!user) {
    throw new Error("Better Auth did not create the administrator user.");
  }

  await db.collection("user").updateOne(
    { _id: user._id },
    {
      $set: {
        name,
        role: "admin",
        cmsRole: "ADMIN",
        status: "ACTIVE",
        banned: false,
        banReason: null,
        banExpires: null,
        emailVerified: true,
        updatedAt: new Date(),
      },
    },
  );

  const credential = await db.collection("account").findOne({
    providerId: "credential",
    userId: { $in: [user._id, String(user._id)] },
  });

  if (!credential?.password) {
    throw new Error(
      "The administrator was created, but the Better Auth credential account is missing.",
    );
  }

  // Verify the exact credentials before reporting success. A seed command that
  // exits successfully now guarantees that the email/password pair is valid.
  await seedAuth.api.signInEmail({
    body: {
      email,
      password,
      rememberMe: false,
    },
    headers: new Headers({
      origin: baseURL,
      referer: `${baseURL}/login`,
    }),
  });

  // The verification login may create a session. Remove it so the first browser
  // login starts with a clean session state.
  await db.collection("session").deleteMany({
    userId: { $in: [user._id, String(user._id)] },
  });

  console.log("✓ Administrator was recreated and the credentials were verified");
  console.log(`  Database: ${db.databaseName}`);
  console.log(`  Login URL: ${baseURL}/login`);
  console.log(`  Email: ${email}`);
  console.log(`  Password: ${password}`);
}

main()
  .catch((error) => {
    const message = error?.body?.message || error?.message || String(error);
    console.error("✗ Admin seed failed:", message);
    console.error(
      "  Check MONGODB_URI, MONGODB_DB, BETTER_AUTH_SECRET and the terminal output above.",
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoClient.close().catch(() => {});
  });
