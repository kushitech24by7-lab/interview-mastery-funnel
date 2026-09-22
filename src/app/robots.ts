import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.SITE_URL;
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Post-purchase pages must never be indexed.
      disallow: ["/thank-you", "/success", "/access", "/payment-failed", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
