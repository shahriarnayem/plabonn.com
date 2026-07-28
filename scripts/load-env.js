import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function parseEnvFile(filename) {
  const path = resolve(process.cwd(), filename);
  if (!existsSync(path)) return {};

  const values = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

/**
 * Load environment files using the same practical priority as Next.js.
 * Existing shell variables always win. `.env.local` is supported because
 * that is where most Next.js projects keep MongoDB and auth credentials.
 */
export function loadEnvFiles() {
  const mode = process.env.NODE_ENV || "development";
  const files = [
    `.env.${mode}.local`,
    ".env.local",
    `.env.${mode}`,
    ".env",
  ];

  const originalKeys = new Set(Object.keys(process.env));
  const loadedKeys = new Set();

  for (const filename of files) {
    const values = parseEnvFile(filename);
    for (const [key, value] of Object.entries(values)) {
      if (originalKeys.has(key) || loadedKeys.has(key)) continue;
      process.env[key] = value;
      loadedKeys.add(key);
    }
  }
}

// Backward-compatible helper for the content seed script.
export function loadEnvFile(filename = ".env") {
  if (filename === ".env") {
    loadEnvFiles();
    return;
  }

  const values = parseEnvFile(filename);
  for (const [key, value] of Object.entries(values)) {
    if (!(key in process.env)) process.env[key] = value;
  }
}
