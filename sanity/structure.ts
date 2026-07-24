import type { StructureResolver } from "sanity/structure";

// The singleton document ids the whole app reads/writes. Keep LUX_PAGE_ID in
// sync with lib/sanity.ts and SITE_CONTENT_ID with lib/site-content.ts (and the
// GROQ queries there).
export const LUX_PAGE_ID = "luxPage";
export const SITE_CONTENT_ID = "siteContent";

/**
 * Desk structure: expose each singleton as a single, fixed editor entry (no
 * "create new" list) so it behaves as a true singleton.
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
      S.listItem()
        .title("Lux Page")
        .id(LUX_PAGE_ID)
        .child(
          S.document()
            .schemaType("luxPage")
            .documentId(LUX_PAGE_ID)
            .title("Lux Page"),
        ),
    ]);
