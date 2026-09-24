"use client";

import { useEffect } from "react";
import CheckoutButton from "./CheckoutButton";
import ProductCover from "./ProductCover";
import { products } from "@/lib/products";
import { siteConfig } from "@/lib/site-config";
import { pricing, displayPrices, ctaLabels } from "@/lib/pricing";
import { captureAttribution, track, trackViewContent } from "@/lib/analytics";
import type { HeroVariant } from "@/lib/variants";

/**
 * Above-the-fold hero (brief §8). Mobile-first: on a 360px screen the headline,
 * the proof row, the CTA and the payment microcopy all land before the fold;
 * the product visual follows rather than pushing the CTA down.
 */

interface Props {
  variant: HeroVariant;
}

// P01 anchors the composition; these four carry the most commercial weight.
const SHOWCASE = ["p01", "p03", "p04", "p02", "p05"];

export default function Hero({ variant }: Props) {
  useEffect(() => {
    captureAttribution();
    // Guarded inside the helper: one ViewContent per page view, even though this
    // effect re-runs when the A/B variant changes and Strict Mode double-invokes
    // it in development.
    trackViewContent({ variant: variant.key });
  }, [variant.key]);

  const showcase = SHOWCASE.map((id) => products.find((p) => p.id === id)!).filter(Boolean);
  // Everything not in the showcase, in catalogue order.
  const rest = products.filter((p) => !SHOWCASE.includes(p.id));

  return (
    <section className="relative overflow-hidden bg-navy-950 text-white">
      {/* Decorative background — pure CSS, no image weight on first paint. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          background:
            "radial-gradient(60% 50% at 15% 0%, rgba(47,153,146,0.22) 0%, transparent 60%), radial-gradient(50% 45% at 90% 15%, rgba(37,99,235,0.2) 0%, transparent 62%)",
        }}
      />

      <div className="container-page relative pb-14 pt-8 sm:pb-20 sm:pt-12 lg:pb-24 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* ── Copy column ── */}
          <div className="animate-fade-up">
            {/* Brand mark sits above the product headline (§2). */}
            <p className="mb-3 text-fluid-xs font-bold uppercase tracking-[0.2em] text-teal-300">
              {siteConfig.BRAND_NAME}
            </p>

            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-fluid-xs font-medium text-teal-200">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-300" />
              {variant.eyebrow || siteConfig.PRODUCT_TAGLINE}
            </p>

            <h1 className="text-fluid-4xl font-bold leading-[1.08] text-white">
              {variant.headline}
              {variant.headlineAccent && (
                <>
                  {" "}
                  <span className="text-amber-400">{variant.headlineAccent}</span>
                </>
              )}
            </h1>

            <p className="mt-5 max-w-prose text-fluid-base leading-relaxed text-navy-100">
              {variant.subheadline}
            </p>

            {/* Proof row (brief §8) */}
            <ul className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-fluid-sm font-semibold text-white">
              {[
                `${siteConfig.TOTAL_PRODUCTS} interview resources`,
                `${siteConfig.TOTAL_PAGES} pages`,
                `${siteConfig.TOTAL_QUESTIONS} questions`,
                `${siteConfig.TOTAL_STAR_EXAMPLES} STAR examples`,
              ].map((item, i) => (
                <li key={item} className="flex items-center gap-3">
                  {i > 0 && <span aria-hidden="true" className="text-navy-500">•</span>}
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <CheckoutButton
                label={ctaLabels.primary}
                shortLabel={ctaLabels.short}
                location="hero"
                className="w-full sm:w-auto"
              />
              <a
                href="#whats-inside"
                onClick={() => track("HeroCTA_Click", { target: "whats_inside" })}
                className="btn-ghost-light w-full sm:w-auto"
              >
                See what's inside
              </a>
            </div>

            {/* Payment microcopy — answers "is this safe / recurring?" immediately */}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-fluid-xs text-navy-200">
              <TrustItem>One-time payment</TrustItem>
              <TrustItem>Instant digital access</TrustItem>
              <TrustItem>Yours to keep</TrustItem>
              <TrustItem>Secure checkout</TrustItem>
            </div>

            {/*
              Restrained price block (§15): the regular bundle price is shown
              small above the current price. ₹5,688 is deliberately NOT the hero
              comparison — it belongs in the value section where it can be
              properly labelled and explained.
            */}
            <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              {pricing.SHOW_BUNDLE_REGULAR_PRICE && (
                <span className="text-fluid-sm text-navy-300 line-through decoration-navy-500">
                  {displayPrices.bundleRegular}
                </span>
              )}
              <span className="text-fluid-2xl font-bold text-white">{displayPrices.special}</span>
              <span className="text-fluid-sm font-medium text-navy-200">
                one-time · all {siteConfig.TOTAL_PRODUCTS} resources
              </span>
            </div>
          </div>

          {/* ── Product visual (brief §44) ── */}
          <div className="relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Device frame communicates DIGITAL, not physical books */}
              <div className="rounded-xl2 border border-white/10 bg-white/[0.06] p-4 shadow-lift backdrop-blur-sm sm:p-6">
                {/*
                  Composition: the handbook (P01) anchors the left at 2×2, with
                  four supporting covers stacked to its right in a fixed 2×2
                  block. Explicit row placement keeps this stable — auto-flow
                  let a cover wrap to its own row at narrow widths.
                */}
                <div className="grid grid-cols-4 grid-rows-[auto_auto_auto] gap-2 sm:gap-3">
                  <div className="col-span-2 row-span-2">
                    <ProductCover
                      product={showcase[0]}
                      priority
                      sizes="(max-width: 640px) 42vw, 200px"
                    />
                  </div>

                  {showcase.slice(1, 5).map((product) => (
                    <div key={product.id} className="col-span-1">
                      <ProductCover
                        product={product}
                        variant="compact"
                        sizes="(max-width: 640px) 20vw, 96px"
                      />
                    </div>
                  ))}

                  {/*
                    The remaining seven covers as a real strip. Now that genuine
                    artwork exists, showing all 12 communicates "one library"
                    far better than a dashed "+7 more" box ever did.
                  */}
                  {rest.map((product) => (
                    <div key={product.id} className="col-span-1">
                      <ProductCover
                        product={product}
                        variant="compact"
                        sizes="(max-width: 640px) 20vw, 96px"
                      />
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-center text-fluid-xs text-navy-200">
                  {siteConfig.TOTAL_PRODUCTS}-resource digital interview preparation library
                  <span className="mt-0.5 block text-[0.65rem] text-navy-400">
                    Digital PDFs — no physical books are shipped
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustItem({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <svg className="h-3.5 w-3.5 shrink-0 text-teal-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z"
          clipRule="evenodd"
        />
      </svg>
      {children}
    </span>
  );
}
