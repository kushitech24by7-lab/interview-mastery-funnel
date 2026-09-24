import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";
import { displayPrices } from "@/lib/pricing";

/**
 * Open Graph card, generated at build time.
 *
 * site-config previously pointed OG_IMAGE at /og/complete-interview-mastery.jpg,
 * which was never added — so every WhatsApp, LinkedIn and X share of this link
 * rendered a broken preview. For a product that spreads peer-to-peer among job
 * seekers, that is a silent conversion leak on the highest-intent traffic there
 * is. Generating the card here keeps it in sync with the real numbers and
 * price, and it can never 404.
 */

export const alt = `${siteConfig.PRODUCT_NAME} — ${siteConfig.TOTAL_PRODUCTS} interview preparation resources`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const facts = [
    `${siteConfig.TOTAL_PRODUCTS} resources`,
    `${siteConfig.TOTAL_PAGES} pages`,
    `${siteConfig.TOTAL_QUESTIONS} questions`,
    `${siteConfig.TOTAL_STAR_EXAMPLES} STAR examples`,
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0b1424",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 4,
            color: "#5eead4",
            fontWeight: 700,
          }}
        >
          {siteConfig.BRAND_NAME.toUpperCase()}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 26,
            fontSize: 66,
            lineHeight: 1.1,
            fontWeight: 800,
            color: "#ffffff",
            maxWidth: 940,
          }}
        >
          Walk into your next interview knowing exactly how to prepare.
        </div>

        <div style={{ display: "flex", marginTop: 34, gap: 18, flexWrap: "wrap" }}>
          {facts.map((f) => (
            <div
              key={f}
              style={{
                display: "flex",
                border: "1px solid rgba(255,255,255,0.22)",
                borderRadius: 999,
                padding: "10px 24px",
                fontSize: 27,
                color: "#e2e8f0",
              }}
            >
              {f}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", marginTop: 40, alignItems: "center", gap: 20 }}>
          {/*
            The ₹ sign is stripped here on purpose. ImageResponse downloads a
            font per glyph at build time and the rupee sign fails that fetch,
            which would render the price as a blank box — on the one image that
            represents this product in every WhatsApp and LinkedIn share.
            "INR" carries the same meaning with glyphs that always resolve.
          */}
          <div style={{ display: "flex", fontSize: 54, fontWeight: 800, color: "#f0b429" }}>
            {`INR ${displayPrices.special.replace(/[^0-9,]/g, "")}`}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#94a3b8" }}>
            one-time · instant digital access
          </div>
        </div>
      </div>
    ),
    size
  );
}
