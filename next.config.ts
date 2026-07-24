import type { NextConfig } from "next";

const dev = process.env.NODE_ENV !== "production";

// PUBLIC-SITE CSP. Everything the site loads is same-origin (self-hosted fonts,
// photos, videos); inline script/style allowances cover Next's hydration
// runtime and framework-injected styles. Dev additionally needs eval +
// websockets for HMR. Mirror any change here in public/_headers, which serves
// the same policy on static Netlify deploys where headers() doesn't run.
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // cdn.sanity.io: client-managed photos are served from Sanity's image CDN.
  "img-src 'self' data: blob: https://cdn.sanity.io",
  "media-src 'self'",
  "font-src 'self' data:",
  `connect-src 'self'${dev ? " ws:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

// STUDIO CSP for /studio only. The embedded Sanity Studio is a first-party SPA
// that needs eval + web workers and talks to Sanity's API/CDN/realtime hosts,
// so its policy is necessarily looser than the public site's — but still bounds
// what an admin-route script could reach. `*.sanity.io` covers api/apicdn/cdn/
// auth/telemetry subdomains; lh3.googleusercontent.com is the account avatar.
const STUDIO_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io https://*.sanity.io https://lh3.googleusercontent.com",
  "media-src 'self' blob: data:",
  "font-src 'self' data:",
  `connect-src 'self' https://*.sanity.io wss://*.api.sanity.io${dev ? " ws:" : ""}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ");

// Non-CSP headers apply everywhere, including /studio.
const COMMON_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // HSTS only means something over HTTPS — set it in production alone so a
  // local http://localhost session never caches a strict-transport rule.
  ...(dev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ]),
];

const nextConfig: NextConfig = {
  images: {
    // Next 16 only serves qualities listed here (default is [75]); the hero
    // requests 90, so both are whitelisted.
    qualities: [75, 90],
    // Client-managed photos come from Sanity's image CDN; let next/image
    // optimize them. (Sanity image URLs already carry their own w/h/format
    // params from the URL builder — next/image re-optimizes at request sizes.)
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async headers() {
    return [
      // Public site: strict CSP on every path EXCEPT /studio (negative lookahead
      // so /studio never gets two conflicting CSP headers).
      {
        source: "/((?!studio).*)",
        headers: [{ key: "Content-Security-Policy", value: CSP }, ...COMMON_HEADERS],
      },
      // Embedded Studio: its own Sanity-aware CSP (matches /studio and children).
      {
        source: "/studio/:path*",
        headers: [{ key: "Content-Security-Policy", value: STUDIO_CSP }, ...COMMON_HEADERS],
      },
    ];
  },
};

export default nextConfig;
