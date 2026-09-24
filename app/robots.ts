import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

// Generated at /robots.txt. The Studio and the API routes are deliberately
// disallowed: /studio is Elle's editing surface (auth-gated, zero search
// value) and /api/* answers JSON that would only pollute the index.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/studio", "/studio/", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
