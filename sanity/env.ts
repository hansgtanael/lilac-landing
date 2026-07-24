/**
 * Public Sanity connection values, read from NEXT_PUBLIC_* env vars.
 *
 * These are intentionally NON-throwing: the whole site is designed to build and
 * run with them blank (see .env.example). When `projectId` is empty the app
 * treats Sanity as "not configured" — /lux renders its built-in fallback copy
 * and /studio shows a friendly setup notice instead of crashing.
 *
 * projectId + dataset + apiVersion are safe to expose to the browser. The read
 * token (SANITY_API_READ_TOKEN) is a server-only secret and lives in lib/sanity.ts.
 */

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-10-01";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
