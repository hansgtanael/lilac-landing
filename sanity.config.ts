"use client";

/**
 * Sanity Studio configuration, mounted at /studio by
 * app/studio/[[...tool]]/page.tsx.
 *
 * defineConfig only builds a config object here — it does not create a client
 * or validate connectivity — so importing this module with a blank projectId is
 * safe at build time. The Studio only actually connects when it renders, and
 * the /studio route guards that render behind isSanityConfigured().
 */

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { schema } from "@/sanity/schemaTypes";
import { structure, LUX_PAGE_ID } from "@/sanity/structure";

export default defineConfig({
  name: "lilac-lux",
  title: "Lilac Landing — Lux",
  basePath: "/studio",
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  document: {
    // Singletons: never offer "duplicate" or "delete" on the lux page or the
    // main site content document.
    actions: (prev, { schemaType }) =>
      schemaType === "luxPage" || schemaType === "siteContent"
        ? prev.filter(
            ({ action }) =>
              action && !["unpublish", "delete", "duplicate"].includes(action),
          )
        : prev,
    // Route "create new" of the singletons to their fixed ids.
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === "global"
        ? prev.filter(
            (t) => t.templateId !== "luxPage" && t.templateId !== "siteContent",
          )
        : prev,
  },
});

export { LUX_PAGE_ID };
