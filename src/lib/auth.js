import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin } from "better-auth/plugins";
import { mongoClient, mongoDatabase } from "./mongodb.js";

function normalizeURL(value) {
  if (!value) return null;
  try {
    return new URL(value.startsWith("http") ? value : `https://${value}`);
  } catch {
    return null;
  }
}

function normalizeOrigin(value) {
  return normalizeURL(value)?.origin || null;
}

const configuredOrigin = normalizeOrigin(
  process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL,
);
const productionOrigin = normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL);
const deploymentOrigin = normalizeOrigin(process.env.VERCEL_URL);
const fallbackOrigin = configuredOrigin || productionOrigin || deploymentOrigin || "http://localhost:3000";
const allowedHosts = Array.from(new Set([
  normalizeURL(configuredOrigin)?.host,
  normalizeURL(productionOrigin)?.host,
  normalizeURL(deploymentOrigin)?.host,
  "localhost:*",
  "127.0.0.1:*",
  "*.vercel.app",
].filter(Boolean)));

const defaultTrustedOrigins = Array.from(new Set([
  fallbackOrigin,
  configuredOrigin,
  productionOrigin,
  deploymentOrigin,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://*.vercel.app",
].filter(Boolean)));

export const auth = betterAuth({
  appName: "Portfolio CMS",
  baseURL: {
    allowedHosts,
    protocol: "auto",
    fallback: fallbackOrigin,
  },
  trustedOrigins: defaultTrustedOrigins,
  secret: process.env.BETTER_AUTH_SECRET || "development-secret-change-this-before-production-123456",
  database: mongodbAdapter(mongoDatabase, { client: mongoClient }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
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
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});
