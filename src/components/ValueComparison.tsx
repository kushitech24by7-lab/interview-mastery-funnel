"use client";

import { useEffect, useRef } from "react";
import CheckoutButton from "./CheckoutButton";
import { products } from "@/lib/products";
import { pricing, displayPrices, priceLabels, formatINR, SEPARATE_PURCHASE_NOTE } from "@/lib/pricing";
import { siteConfig } from "@/lib/site-config";
import { observeSection } from "@/lib/analytics";

/**
 * "What would the 12 resources cost separately?" (§20 + §21).
 *
 * ── THE TRANSPARENCY PROBLEM THIS SECTION SOLVES ──────────────────────────────
 * A sceptical Meta visitor who sees "₹5,688 → ₹699" assumes the higher number
 * is invented. So rather than flashing one dramatic discount, this section shows
 * its working: every resource with its own listed prices, then the three totals
 * clearly labelled and visibly different from each other. The buyer can add it
 * up themselves, which is the only thing that actually defuses the suspicion.
 *
 * ── RESPONSIVE STRATEGY ───────────────────────────────────────────────────────
 * Desktop gets a real <table> (correct semantics for tabular data). Mobile gets
 * per-product cards — never a squeezed table. Both are rendered from the same
 * data, and only one is visible at a time.
 */

export default function ValueComparison() {
  const ref = useRef<HTMLElement>(null);
  useEffect(
    () => observeSection(ref.current, "BundleSection_View", { section: "value_comparison" }),
    []
  );

  return (
    <section ref={ref} id="value" className="section bg-white">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Transparent pricing</p>
          <h2 className="h2 mt-3">What would the 12 resources cost separately?</h2>
          <p className="lede mx-auto mt-4">
            {siteConfig.PRODUCT_NAME} brings the full interview-preparation system together
            in one bundle. Here is every resource with its own listed prices, so you can see
            exactly where the totals come from.
          </p>
        </div>

        {/* ── Desktop table ── */}
        <div className="mt-10 hidden lg:block">
          <table className="w-full border-collapse overflow-hidden rounded-xl2 border border-navy-100">
            <caption className="sr-only">
              The 12 included resources with their individual regular and special prices
            </caption>
            <thead>
              <tr className="bg-navy-950 text-white">
                <th scope="col" className="px-4 py-3 text-left text-fluid-xs font-semibold uppercase tracking-wider">
                  Resource
                </th>
                <th scope="col" className="px-4 py-3 text-right text-fluid-xs font-semibold uppercase tracking-wider">
                  Pages
                </th>
                <th scope="col" className="px-4 py-3 text-right text-fluid-xs font-semibold uppercase tracking-wider">
                  Regular
                </th>
                <th scope="col" className="px-4 py-3 text-right text-fluid-xs font-semibold uppercase tracking-wider">
                  Special
                </th>
                <th scope="col" className="px-4 py-3 text-center text-fluid-xs font-semibold uppercase tracking-wider">
                  In bundle
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100 bg-white">
              {products.map((product) => (
                <tr key={product.id} className="transition-colors hover:bg-sand">
                  <td className="px-4 py-3">
                    <span className="mr-2 rounded bg-navy-100 px-1.5 py-0.5 text-[0.65rem] font-bold text-navy-800">
                      {product.code}
                    </span>
                    <span className="text-fluid-sm font-medium text-navy-950">
                      {product.title}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-fluid-sm text-ink-soft">
                    {product.pages}
                  </td>
                  <td className="px-4 py-3 text-right text-fluid-sm text-ink-faint">
                    {formatINR(product.regularPrice)}
                  </td>
                  <td className="px-4 py-3 text-right text-fluid-sm font-semibold text-navy-900">
                    {formatINR(product.specialPrice)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <TickIcon />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-navy-200 bg-sand">
                <th scope="row" className="px-4 py-3 text-left text-fluid-sm font-bold text-navy-950">
                  Totals if bought separately
                </th>
                <td className="px-4 py-3 text-right text-fluid-sm font-bold text-navy-950">
                  {siteConfig.TOTAL_PAGES}
                </td>
                <td className="px-4 py-3 text-right text-fluid-sm font-bold text-ink-soft">
                  {displayPrices.individualRegular}
                </td>
                <td className="px-4 py-3 text-right text-fluid-sm font-bold text-navy-950">
                  {displayPrices.individualSpecial}
                </td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* ── Mobile cards ── */}
        <ul className="mt-10 space-y-3 lg:hidden">
          {products.map((product) => (
            <li key={product.id} className="card p-4">
              <div className="flex items-start gap-2">
                <span className="rounded bg-navy-950 px-1.5 py-0.5 text-[0.65rem] font-bold text-white">
                  {product.code}
                </span>
                <h3 className="flex-1 text-fluid-sm font-bold leading-snug text-navy-950">
                  {product.title}
                </h3>
              </div>

              <p className="mt-1.5 text-fluid-xs text-ink-faint">{product.pages} pages</p>

              <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="text-fluid-xs text-ink-faint">
                  Regular {formatINR(product.regularPrice)}
                </span>
                <span className="text-fluid-sm font-bold text-navy-900">
                  Special {formatINR(product.specialPrice)}
                </span>
              </div>

              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wide text-teal-700">
                <TickIcon />
                Included in the {displayPrices.special} bundle
              </p>
            </li>
          ))}
        </ul>

        {/* ── Totals summary (both breakpoints) ── */}
        <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-xl2 bg-navy-950 text-white">
          <div className="divide-y divide-white/10">
            {pricing.SHOW_INDIVIDUAL_REGULAR_VALUE && (
              <SummaryRow
                label={priceLabels.individualRegular}
                value={displayPrices.individualRegular}
                tone="muted"
              />
            )}
            {pricing.SHOW_INDIVIDUAL_SPECIAL_TOTAL && (
              <SummaryRow
                label={priceLabels.individualSpecial}
                value={displayPrices.individualSpecial}
                tone="muted"
              />
            )}
            {pricing.SHOW_BUNDLE_REGULAR_PRICE && (
              <SummaryRow
                label={priceLabels.bundleRegular}
                value={displayPrices.bundleRegular}
                tone="regular"
              />
            )}
            <SummaryRow
              label={priceLabels.special}
              value={displayPrices.special}
              tone="special"
            />
          </div>

          <div className="border-t border-white/10 bg-white/[0.04] p-6 text-center">
            <p className="text-fluid-base font-bold text-amber-400">
              Save {displayPrices.savings} vs the regular bundle price
            </p>
            <div className="mt-5 flex justify-center">
              <CheckoutButton
                label={`Get all 12 for ${displayPrices.special}`}
                location="value_comparison"
              />
            </div>
            <p className="mx-auto mt-4 max-w-md text-fluid-xs leading-relaxed text-navy-300">
              {SEPARATE_PURCHASE_NOTE}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "muted" | "regular" | "special";
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-4 sm:px-6">
      <span
        className={`text-fluid-sm ${
          tone === "special" ? "font-semibold text-white" : "text-navy-300"
        }`}
      >
        {label}
      </span>
      <span
        className={
          tone === "special"
            ? "text-fluid-2xl font-bold text-amber-400"
            : tone === "regular"
              ? "text-fluid-lg font-semibold text-navy-200 line-through decoration-navy-400"
              : "text-fluid-base font-medium text-navy-300"
        }
      >
        {value}
      </span>
    </div>
  );
}

function TickIcon() {
  return (
    <svg
      className="inline-block h-3.5 w-3.5 shrink-0 text-teal-600"
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
  );
}
