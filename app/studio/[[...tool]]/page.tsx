/**
 * Embedded Sanity Studio, served at /studio.
 *
 * NextStudio only mounts when a project id is configured. With Sanity unset the
 * route renders a plain setup notice instead of crashing — so the site is fully
 * usable with zero configuration.
 *
 * IMPORTANT (deployment): the site's Content-Security-Policy in next.config.ts
 * (and public/_headers) is same-origin only. Before the embedded Studio can
 * talk to Sanity in the browser, that CSP must be widened to allow Sanity's
 * hosts (see the report / README notes). The home page's data read is
 * server-side and is unaffected by CSP.
 */

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";
import { isSanityConfigured } from "@/lib/sanity";

// Statically prerender; the config branch is decided at build time by the
// (build-time inlined) NEXT_PUBLIC_SANITY_PROJECT_ID.
export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  if (!isSanityConfigured()) {
    return (
      <main
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          background: "#faf7f2",
          color: "#2c2825",
        }}
      >
        <div style={{ maxWidth: "34rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.75rem" }}>
            Sanity Studio isn&apos;t configured yet
          </h1>
          <p style={{ lineHeight: 1.6, opacity: 0.75 }}>
            Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> (and{" "}
            <code>NEXT_PUBLIC_SANITY_DATASET</code>) in <code>.env.local</code>,
            then restart the dev server. The Studio will mount here once a
            project id is present. Until then, the site renders its built-in
            content from <code>content/content.json</code>.
          </p>
        </div>
      </main>
    );
  }

  return <NextStudio config={config} />;
}
