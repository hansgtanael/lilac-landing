import type { NextConfig } from "next";
import {
  isAnalyticsConfigured,
  GA_SCRIPT_HOST,
  GA_CONNECT_HOSTS,
} from "./lib/analytics";

const dev = process.env.NODE_ENV !== "production";

// GA4 hosts, folded into the CSP ONLY when a measurement ID is configured
// (lib/analytics.ts). An unmeasured deploy therefore keeps the tighter
// policy rather than carrying a permanent hole for a tag it never loads.
//
// Both directives are required and they fail differently. Missing
// script-src blocks gtag.js outright (visible in the console). Missing
// connect-src lets the tag load and run while every beacon is blocked — no
// error the page surfaces, and a GA4 dashboard reading zero, which is
// indistinguishable from nobody visiting. Never add one without the other.
const ga = isAnalyticsConfigured();
const gaScript = ga ? ` ${GA_SCRIPT_HOST}` : "";
const gaConnect = ga ? ` ${GA_CONNECT_HOSTS.join(" ")}` : "";
// GA4 falls back to a pixel when a beacon cannot be sent.
const gaImg = ga ? " https://*.google-analytics.com https://www.googletagmanager.com" : "";

// PUBLIC-SITE CSP. Everything the site loads is same-origin (self-hosted fonts,
// photos, videos); inline script/style allowances cover Next's hydration
// runtime and framework-injected styles. Dev additionally needs eval +
// websockets for HMR. Mirror any change here in public/_headers, which serves
// the same policy on static Netlify deploys where headers() doesn't run.
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}${gaScript}`,
  "style-src 'self' 'unsafe-inline'",
  // cdn.sanity.io: client-managed photos are served from Sanity's image CDN.
  `img-src 'self' data: blob: https://cdn.sanity.io${gaImg}`,
  "media-src 'self'",
  "font-src 'self' data:",
  `connect-src 'self'${dev ? " ws:" : ""}${gaConnect}`,
  // Hospitable direct-booking checkout, embedded as an iframe by
  // components/BookingWidgetModal.tsx. frame-src is REQUIRED here: without it
  // the directive falls back to `default-src 'self'` and the iframe renders
  // blank with no visible error. Scoped to Hospitable only — their booking page
  // is served from a subdomain, and the widget's own JS runs inside that frame,
  // so no script-src or connect-src entry is needed on this origin.
  // Must cover the host of NEXT_PUBLIC_HOSPITABLE_BOOKING_URL (lib/bookingWidget.ts).
  "frame-src 'self' https://*.hospitable.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

// STUDIO CSP for /studio only. The embedded Sanity Studio is a first-party SPA
// that needs eval + web workers and talks to Sanity's API/CDN/realtime hosts,
// so its policy is necessarily looser than the public site's — but still bounds
// what an admin-route script could reach. `*.sanity.io` covers api/apicdn/cdn/
// auth/telemetry subdomains; `*.sanity-cdn.com` serves the Studio "core" bridge
// (core.sanity-cdn.com/bridge.js); lh3.googleusercontent.com is the avatar.
const STUDIO_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://*.sanity-cdn.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io https://*.sanity.io https://*.sanity-cdn.com https://lh3.googleusercontent.com",
  "media-src 'self' blob: data:",
  "font-src 'self' data:",
  `connect-src 'self' https://*.sanity.io https://*.sanity-cdn.com wss://*.api.sanity.io${dev ? " ws:" : ""}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ");

// Exact origin of the Hospitable booking page, derived from the same variable
// the client uses (lib/bookingWidget.ts) so the two can never disagree.
//
// Permissions-Policy needs this because its allowlist does NOT accept wildcard
// origins the way CSP's frame-src does — `https://*.hospitable.com` is invalid
// here and the whole directive would be dropped. Deriving the literal origin
// avoids hardcoding a guess.
//
// Read at BUILD time: NEXT_PUBLIC_ values are inlined during the build, so this
// variable must be set on the host before the deploy that should carry it, not
// merely at runtime. An unset/malformed value leaves payment fully disabled,
// which matches the widget also being off in that case.
const BOOKING_ORIGIN = (() => {
  const raw = process.env.NEXT_PUBLIC_HOSPITABLE_BOOKING_URL || "";
  try {
    const u = new URL(raw);
    return u.protocol === "https:" ? u.origin : "";
  } catch {
    return "";
  }
})();

// Non-CSP headers apply everywhere, including /studio.
const COMMON_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    // payment: the checkout iframe needs the Payment Request API. `payment=()`
    // disables it for every frame including embedded ones, so card entry can
    // fail inside a widget that otherwise loads fine — a genuinely confusing
    // failure. Delegated to the booking origin alone, and only when one is
    // configured; the iframe's own allow="payment" grants the rest.
    value: `camera=(), microphone=(), geolocation=(), payment=(${
      BOOKING_ORIGIN ? `"${BOOKING_ORIGIN}"` : ""
    })`,
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
  // Self-hosting: emit .next/standalone — a self-contained server bundle that
  // runs with `node .next/standalone/server.js` and needs no node_modules on
  // the target machine. See DEPLOYMENT.md.
  //
  // Deliberately NOT set on Netlify: @netlify/plugin-nextjs manages its own
  // output packaging, and forcing standalone underneath it is unsupported.
  // Netlify sets NETLIFY=true during builds, so the hosted deploy keeps its
  // current behaviour byte-for-byte while self-hosters get the bundle.
  output: process.env.NETLIFY ? undefined : "standalone",
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
