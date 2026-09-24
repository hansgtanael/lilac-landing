import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

// Generated at /sitemap.xml. Only the four public, indexable pages — /studio
// and /api/* are excluded here and in robots.ts.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: siteUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/accessibility`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
