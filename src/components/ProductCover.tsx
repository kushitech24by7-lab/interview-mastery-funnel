"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/products";

/**
 * Renders a product cover (brief §43 + §55).
 *
 * ── STATUS ────────────────────────────────────────────────────────────────────
 * The real 3D cover artwork now ships at /public/covers/p01–p12.webp, so the
 * normal path renders genuine product imagery.
 *
 * The typographic fallback below remains as a NETWORK-ERROR safety net only: if
 * an image fails to load, the card degrades to a panel built from the product's
 * real title and page count rather than showing a broken-image icon. It never
 * imitates an interior page or invents artwork.
 */

interface Props {
  product: Product;
  priority?: boolean;
  className?: string;
  sizes?: string;
  /**
   * Density of the typographic fallback. "compact" is for thumbnails roughly
   * 60–100px wide, where full metadata would clip; "full" is for cards.
   */
  variant?: "full" | "compact";
}

export default function ProductCover({
  product,
  priority = false,
  className = "",
  sizes = "(max-width: 640px) 45vw, 220px",
  variant = "full",
}: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`relative aspect-[1/1.414] w-full overflow-hidden rounded-lg shadow-cover ${className}`}
      style={{ backgroundColor: product.coverAccent }}
    >
      {!failed ? (
        <Image
          src={product.cover}
          alt={`Cover of ${product.title} — ${product.pages} pages`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <CoverFallback product={product} variant={variant} />
      )}
    </div>
  );
}

/**
 * Typographic stand-in shown until the real cover export exists.
 *
 * It presents only true information (title, code, page count) and never
 * imitates an interior page.
 *
 * The panel is decorative (aria-hidden) and its title uses a <div>, not a
 * heading — a heading here would inject an h4 into the document outline
 * directly under the page h1.
 */
function CoverFallback({ product, variant }: { product: Product; variant: "full" | "compact" }) {
  const compact = variant === "compact";

  // The compact variant renders in cells as narrow as ~55px, so its type is
  // sized in fixed px tuned for that width. (Container-query units were tried
  // here and silently fell back to their clamp maximum, which clipped the text.)
  if (compact) {
    return (
      <div
        className="flex h-full w-full flex-col justify-between overflow-hidden text-white"
        style={{
          background: `linear-gradient(155deg, ${product.coverAccent} 0%, #0b1424 100%)`,
          padding: "8%",
        }}
        aria-hidden="true"
      >
        <div className="flex items-start justify-between gap-0.5">
          <span
            className="font-bold uppercase leading-none tracking-wider text-white/60"
            style={{ fontSize: "5px" }}
          >
            IM
          </span>
          <span
            className="shrink-0 rounded-sm bg-white/25 px-[2px] font-bold leading-tight tracking-wide"
            style={{ fontSize: "5.5px" }}
          >
            {product.code}
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden pt-[8%]">
          <div className="mb-[8%] h-[1.5px] w-[45%] bg-amber-400" />
          <div
            className="font-bold"
            style={{
              fontSize: "6.5px",
              lineHeight: 1.2,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              // Lets long words break instead of overflowing a narrow cell.
              overflowWrap: "anywhere",
              hyphens: "auto",
            }}
          >
            {product.shortTitle}
          </div>
        </div>

        <span className="whitespace-nowrap leading-none text-white/60" style={{ fontSize: "5px" }}>
          {product.pages}pp
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex h-full w-full flex-col justify-between overflow-hidden p-3 text-white sm:p-4"
      style={{ background: `linear-gradient(155deg, ${product.coverAccent} 0%, #0b1424 100%)` }}
      aria-hidden="true"
    >
      <div className="flex items-start justify-between gap-1">
        <span className="text-[0.55rem] font-semibold uppercase leading-tight tracking-[0.14em] text-white/70">
          Interview Mastery
        </span>
        <span className="shrink-0 rounded bg-white/20 px-1.5 py-0.5 text-[0.55rem] font-bold tracking-wider">
          {product.code}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden py-3">
        <div className="mb-2 h-0.5 w-8 bg-amber-400" />
        <div
          className="text-[0.78rem] font-bold leading-tight sm:text-sm"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 5,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            overflowWrap: "anywhere",
          }}
        >
          {product.title}
        </div>
      </div>

      <div className="flex items-center justify-between gap-1 text-[0.55rem] text-white/70">
        <span className="whitespace-nowrap">{product.pages} pages</span>
        <span className="shrink-0 rounded-full border border-white/30 px-1.5">PDF</span>
      </div>
    </div>
  );
}
