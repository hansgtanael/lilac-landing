import type { StructureResolver } from "sanity/structure";

// The singleton document id the app reads/writes. Keep SITE_CONTENT_ID in sync
// with lib/site-content.ts (and the GROQ query there).
export const SITE_CONTENT_ID = "siteContent";

/**
 * Desk structure: expose the site-content singleton as a single, fixed editor
 * entry (no "create new" list) so it behaves as a true singleton.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Site Content (Home)")
        .id(SITE_CONTENT_ID)
        .child(
          S.document()
            .schemaType("siteContent")
            .documentId(SITE_CONTENT_ID)
            .title("Site Content (Home)"),
        ),
    ]);
