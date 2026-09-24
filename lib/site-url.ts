// Canonical origin, resolved rather than hardcoded so it is never a lie:
// lilaclanding.com has no DNS yet, and hardcoding it pointed every canonical
// + og:image at a domain that does not resolve.
//   NEXT_PUBLIC_SITE_URL — explicit override, set it if you ever need to force one
//   URL                  — injected by Netlify as the site's PRIMARY url, so this
//                          self-corrects to lilaclanding.com the moment that
//                          custom domain is attached. No code change needed.
//   fallback             — local dev
//
// layout.tsx (metadataBase), robots.ts and sitemap.ts all read this, so the
// three can never disagree about which origin the site lives on.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.URL ||
  "http://localhost:3020";
