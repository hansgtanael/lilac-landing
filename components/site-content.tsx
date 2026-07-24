"use client";

import { createContext, useContext } from "react";
import { site as staticSite, type SiteContent } from "@/lib/content";

/**
 * Runtime content seam for the main site.
 *
 * The whole page tree reads its copy + photos through `useSiteContent()`. A
 * Server Component (app/page.tsx) resolves the content from Sanity when it is
 * configured and seeded, and passes it to <SiteContentProvider>. When Sanity is
 * NOT set up — or a component renders outside the provider — the hook falls
 * back to the built-in `content.json` (staticSite), so the site always renders
 * and nothing breaks before the CMS is live.
 *
 * The resolved SiteContent shape is IDENTICAL to content.json: image fields are
 * already resolved to URL strings (Sanity CDN urls when seeded, /public paths
 * on fallback), so components consume `{ src }` exactly as they do today.
 */
const SiteContentContext = createContext<SiteContent | null>(null);

export function SiteContentProvider({
  value,
  children,
}: {
  value: SiteContent;
  children: React.ReactNode;
}) {
  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

/** The active site content — Sanity-resolved when provided, else content.json. */
export function useSiteContent(): SiteContent {
  return useContext(SiteContentContext) ?? staticSite;
}
