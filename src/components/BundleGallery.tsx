"use client";

import { useEffect, useRef } from "react";
import ProductCover from "./ProductCover";
import CheckoutButton from "./CheckoutButton";
import { products, productGroups, productsByGroup, type Product } from "@/lib/products";
import { siteConfig } from "@/lib/site-config";
import { displayPrices, formatINR, ctaLabels } from "@/lib/pricing";
import { observeSection } from "@/lib/analytics";

/**
 * "What exactly do you get?" (brief §13).
 *
 * Grouping matters more than it looks: twelve flat cards read as a dump, while
 * six labelled groups read as a designed curriculum. Every card carries the real
 * page count and specific outcomes — no generic filler copy.
 */

const groupBlurbs: Record<string, string> = {
  "Core system": "The teaching spine everything else plugs into.",
  Communication: "Make your spoken answers easier to follow.",
  "Questions & examples": "What gets asked, and what a strong answer sounds like.",
  "High-stakes answers": "The specific questions that decide interviews.",
  "Practice & personalisation": "Turn knowledge into your answers, then rehearse them.",
  Execution: "What you actually carry into interview day and beyond.",
};

export default function BundleGallery() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => observeSection(ref.current, "BundleSection_View", { section: "bundle" }), []);

  return (
    <section ref={ref} id="whats-inside" className="section bg-white">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">What exactly do you get?</p>
          <h2 className="h2 mt-3">
            {siteConfig.TOTAL_PRODUCTS} resources. {siteConfig.TOTAL_PAGES} pages. One purchase.
          </h2>
          <p className="lede mx-auto mt-4">
            Every resource below is finished and included. Here is exactly what each one does and
            how long it is.
          </p>
        </div>

        <div className="mt-12 space-y-12">
          {productGroups.map((group) => {
            const groupProducts = productsByGroup(group);
            const groupPages = groupProducts.reduce((sum, p) => sum + p.pages, 0);

            return (
              <div key={group}>
                <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2 border-b border-navy-100 pb-3">
                  <div>
                    <h3 className="text-fluid-xl font-bold text-navy-950">{group}</h3>
                    <p className="mt-0.5 text-fluid-sm text-ink-soft">{groupBlurbs[group]}</p>
                  </div>
                  <p className="text-fluid-xs font-semibold uppercase tracking-wider text-teal-700">
                    {groupProducts.length} {groupProducts.length === 1 ? "resource" : "resources"} ·{" "}
                    {groupPages} pages
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {groupProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Running total — reinforces the claim with arithmetic the reader can check */}
        <div className="mt-12 rounded-xl2 bg-navy-950 p-6 text-center text-white sm:p-8">
          <p className="text-fluid-sm uppercase tracking-[0.14em] text-navy-300">Total included</p>
          <p className="mt-2 text-fluid-3xl font-bold">
            {siteConfig.TOTAL_PRODUCTS} resources ·{" "}
            <span className="text-amber-400">{siteConfig.TOTAL_PAGES} pages</span>
          </p>
          <p className="mx-auto mt-3 max-w-xl text-fluid-sm text-navy-200">
            Delivered as PDFs you can read on your phone, tablet or laptop — and print the
            worksheets if you prefer writing by hand. No physical books are shipped.
          </p>
          <div className="mt-6 flex justify-center">
            <CheckoutButton
              label={ctaLabels.short}
              location="bundle_gallery"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article
      id={product.code.toLowerCase()}
      className="card group flex scroll-mt-24 flex-col overflow-hidden transition-shadow hover:shadow-lift"
    >
      <div className="flex gap-4 p-4 sm:p-5">
        <div className="w-[5.5rem] shrink-0 sm:w-24">
          <ProductCover product={product} sizes="(max-width: 640px) 88px, 96px" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded bg-navy-950 px-1.5 py-0.5 text-[0.65rem] font-bold tracking-wider text-white">
              {product.code}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-teal-700">
              <svg className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z"
                  clipRule="evenodd"
                />
              </svg>
              Included
            </span>
          </div>

          <h4 className="mt-2 text-fluid-base font-bold leading-snug text-navy-950">
            {product.title}
          </h4>

          <p className="mt-1 text-fluid-xs font-semibold text-ink-faint">
            {product.pages} pages
          </p>

          <p className="mt-2 text-fluid-sm leading-relaxed text-ink-soft">{product.purpose}</p>
        </div>
      </div>

      <div className="mt-auto border-t border-navy-100 bg-sand/60 p-4 sm:p-5">
        <ul className="space-y-2">
          {product.outcomes.map((outcome) => (
            <li key={outcome} className="flex items-start gap-2 text-fluid-sm text-ink">
              <svg
                className="mt-1 h-3.5 w-3.5 shrink-0 text-teal-600"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="leading-snug">{outcome}</span>
            </li>
          ))}
        </ul>

        {product.facts.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {product.facts.map((fact) => (
              <li key={fact} className="chip">
                {fact}
              </li>
            ))}
          </ul>
        )}

        {/*
          Individual prices demonstrate bundle value (§17). There is no per-item
          buy button, because individual checkout routes do not exist (§18) —
          offering one would be a promise the site cannot keep.
        */}
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-navy-100 pt-3">
          <span className="text-fluid-xs text-ink-faint">
            Regular {formatINR(product.regularPrice)}
          </span>
          <span className="text-fluid-sm font-bold text-navy-900">
            Special {formatINR(product.specialPrice)}
          </span>
        </div>
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wide text-teal-700">
          <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z"
              clipRule="evenodd"
            />
          </svg>
          Included in the {displayPrices.special} bundle
        </p>
      </div>
    </article>
  );
}

export { products };
