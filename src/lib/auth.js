import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin } from "better-auth/plugins";
import { mongoClient, mongoDatabase } from "./mongodb.js";

const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const trustedOrigins = Array.from(new Set([
  baseURL,
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.NODE_ENV !== "production" ? "http://localhost:3000" : null,
  process.env.NODE_ENV !== "production" ? "http://127.0.0.1:3000" : null,
].filter(Boolean)));

export const auth = betterAuth({
  appName: "Portfolio CMS",
  baseURL,
  trustedOrigins,
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
