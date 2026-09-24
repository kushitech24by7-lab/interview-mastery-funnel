import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

/**
 * Web app manifest. Kept minimal and honest: this is a content site, not an
 * installable app, so it declares only what the browser needs for a tidy
 * home-screen icon and theme colour.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.PRODUCT_NAME} | ${siteConfig.BRAND_NAME}`,
    short_name: siteConfig.BRAND_NAME,
    description: siteConfig.PRODUCT_TAGLINE,
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#0b1424",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  };
}
