"use client";

import { useEffect, useRef } from "react";
import CheckoutButton from "./CheckoutButton";
import { siteConfig, isPlaceholder, supportMailto, whatsappLink } from "@/lib/site-config";
import { pricing, displayPrices, priceLabels, SEPARATE_PURCHASE_NOTE } from "@/lib/pricing";
import { observeSection, track } from "@/lib/analytics";

/**
 * Value stack + pricing + checkout trust (brief §30, §31, §32).
 *
 * ── NO FAKE ANCHORING ─────────────────────────────────────────────────────────
 * Four figures appear on this page and each is labelled with what it actually
 * is (see src/lib/pricing.ts). Only the regular BUNDLE price (₹2,499) is struck
 * through, because it is the only figure this bundle genuinely sells at. The
 * ₹5,688 and ₹2,608 totals are labelled sums of the twelve separate listings —
 * never dressed up as a former price of the bundle itself.
 *
 * The headline savings claim is therefore ₹1,800 against ₹2,499, not a much
 * larger number against ₹5,688 that a sceptical buyer would rightly distrust.
 */

const valueStack = [
  { item: "Complete Interview Mastery Handbook", detail: "166 pages · 24 chapters" },
  { item: "500 interview questions", detail: "11 categories" },
  { item: "14 answer frameworks", detail: "Patterns, not scripts" },
  { item: "100 worked STAR examples", detail: "10 competency areas" },
  { item: "30 spoken practice drills", detail: "Plus a 14-day plan" },
  { item: "5 guided mock interview formats", detail: "With a 5-dimension scoring system" },
  { item: "45-minute company research system", detail: "Converts research into answers" },
  { item: "Answer-building worksheets", detail: "Build your own evidence bank" },
  { item: "Interview day + follow-up toolkit", detail: "Final 60-minute sequence" },
  { item: "Salary negotiation system", detail: "Scripts and email templates" },
  { item: "30 templates, checklists & trackers", detail: "The operational layer" },
];

export default function PricingSection() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => observeSection(ref.current, "Pricing_View", { section: "pricing" }), []);

  const mailto = supportMailto(`Question about ${siteConfig.PRODUCT_NAME}`);
  const whatsapp = whatsappLink(`Hi, I have a question about ${siteConfig.PRODUCT_NAME}.`);

  return (
    <section ref={ref} id="pricing" className="section scroll-mt-16 bg-white">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">One purchase</p>
          <h2 className="h2 mt-3">
            {siteConfig.TOTAL_PRODUCTS} resources. One payment. Yours to keep.
          </h2>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-[1fr_0.85fr]">
          {/* Value stack */}
          <div className="card p-6 sm:p-8">
            <h3 className="text-fluid-lg font-bold text-navy-950">
              All {siteConfig.TOTAL_PRODUCTS} resources included
            </h3>
            <ul className="mt-5 divide-y divide-navy-100">
              {valueStack.map((entry) => (
                <li key={entry.item} className="flex items-start gap-3 py-3">
                  <svg
                    className="mt-1 h-4 w-4 shrink-0 text-teal-600"
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
                  <div>
                    <p className="text-fluid-sm font-semibold text-navy-950">{entry.item}</p>
                    <p className="text-fluid-xs text-ink-soft">{entry.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-5 rounded-lg bg-sand p-4 text-center text-fluid-sm font-semibold text-navy-950">
              {siteConfig.TOTAL_PRODUCTS} resources · {siteConfig.TOTAL_PAGES} pages · one purchase
            </p>
          </div>

          {/* Pricing card */}
          <div>
            <div className="sticky top-6 overflow-hidden rounded-xl2 border-2 border-navy-950 bg-navy-950 text-white shadow-lift">
              <div className="p-6 sm:p-8">
                <p className="text-fluid-xs font-semibold uppercase tracking-[0.14em] text-teal-300">
                  {siteConfig.BRAND_NAME}
                </p>
                <h3 className="mt-2 text-fluid-2xl font-bold text-white">
                  {siteConfig.PRODUCT_NAME}
                </h3>
                <p className="mt-1.5 text-fluid-sm text-navy-200">
                  {siteConfig.TOTAL_PRODUCTS}-resource digital interview preparation system ·{" "}
                  {siteConfig.TOTAL_PAGES} pages
                </p>

                <div className="mt-6 border-t border-white/10 pt-6">
                  {/*
                    Price hierarchy (§5). The two "combined individual" figures
                    are labelled sums of separate items — never presented as the
                    bundle's own former price. Only the regular BUNDLE price is
                    struck through, because only it is a price this bundle
                    genuinely sells at.
                  */}
                  {pricing.SHOW_INDIVIDUAL_REGULAR_VALUE && (
                    <dl className="mb-4 space-y-1.5 text-fluid-xs">
                      <div className="flex items-baseline justify-between gap-2">
                        <dt className="text-navy-300">{priceLabels.individualRegular}</dt>
                        <dd className="font-medium text-navy-200">
                          {displayPrices.individualRegular}
                        </dd>
                      </div>
                      {pricing.SHOW_BUNDLE_REGULAR_PRICE && (
                        <div className="flex items-baseline justify-between gap-2">
                          <dt className="text-navy-300">{priceLabels.bundleRegular}</dt>
                          <dd className="font-medium text-navy-200 line-through decoration-navy-400">
                            {displayPrices.bundleRegular}
                          </dd>
                        </div>
                      )}
                    </dl>
                  )}

                  <p className="text-fluid-xs font-semibold uppercase tracking-[0.14em] text-teal-300">
                    {priceLabels.special}
                  </p>
                  <p className="mt-1 text-fluid-4xl font-bold leading-none text-white">
                    {siteConfig.PRICE}
                  </p>
                  <p className="mt-2 text-fluid-sm font-semibold uppercase tracking-wide text-amber-400">
                    One-time payment · No subscription
                  </p>
                  {pricing.SHOW_BUNDLE_REGULAR_PRICE && (
                    <p className="mt-3 inline-flex rounded-lg bg-amber-500/15 px-3 py-1.5 text-fluid-sm font-bold text-amber-400">
                      Save {displayPrices.savings} vs the regular bundle price
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <CheckoutButton
                    label={`Get instant access — ${displayPrices.special}`}
                    location="pricing_card"
                    fullWidth
                    showTrustLine
                    trustLineOnDark
                  />
                </div>

                <ul className="mt-5 space-y-2 text-fluid-xs text-navy-200">
                  <li className="flex items-start gap-2">
                    <Tick /> Secure checkout via Razorpay
                  </li>
                  <li className="flex items-start gap-2">
                    <Tick /> Digital product — PDF files
                  </li>
                  <li className="flex items-start gap-2">
                    <Tick /> Access after successful verified payment
                  </li>
                  <li className="flex items-start gap-2">
                    <Tick /> Support available if access fails
                  </li>
                </ul>

                {pricing.SHOW_INDIVIDUAL_SPECIAL_TOTAL && (
                  <p className="mt-4 border-t border-white/10 pt-4 text-fluid-xs leading-relaxed text-navy-300">
                    {SEPARATE_PURCHASE_NOTE}
                  </p>
                )}
              </div>

              {/* Checkout trust block (§32) */}
              <div className="border-t border-white/10 bg-white/[0.04] p-6">
                <p className="text-fluid-xs font-semibold uppercase tracking-wider text-teal-300">
                  Before you pay
                </p>
                <dl className="mt-3 space-y-2.5 text-fluid-xs">
                  <TrustRow label="You are paying">
                    {isPlaceholder(siteConfig.LEGAL_BUSINESS_NAME)
                      ? siteConfig.BRAND_NAME
                      : `${siteConfig.BRAND_NAME} (${siteConfig.LEGAL_BUSINESS_NAME})`}
                  </TrustRow>
                  <TrustRow label="What you get">
                    {siteConfig.TOTAL_PRODUCTS} PDF resources ({siteConfig.TOTAL_PAGES} pages)
                  </TrustRow>
                  <TrustRow label="Is it a subscription?">No. One-time payment.</TrustRow>
                  <TrustRow label="When">Immediately after payment is verified</TrustRow>
                  <TrustRow label="Where">
                    On the access page, and via your Google Drive bundle link
                  </TrustRow>
                  <TrustRow label="If something fails">
                    {mailto || whatsapp ? (
                      <span className="flex flex-wrap gap-x-3">
                        {mailto && (
                          <a
                            href={mailto}
                            onClick={() => track("Support_Click", { location: "pricing" })}
                            className="font-semibold text-amber-400 underline"
                          >
                            Email support
                          </a>
                        )}
                        {whatsapp && (
                          <a
                            href={whatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => track("Support_Click", { location: "pricing_whatsapp" })}
                            className="font-semibold text-amber-400 underline"
                          >
                            WhatsApp
                          </a>
                        )}
                      </span>
                    ) : (
                      "[SUPPORT CONTACT — configure SUPPORT_EMAIL]"
                    )}
                  </TrustRow>
                </dl>

                <p className="mt-4 text-[0.65rem] leading-relaxed text-navy-400">
                  Payments are processed by Razorpay. Razorpay is a payment processor and does not
                  endorse this product.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap gap-x-2">
      <dt className="shrink-0 font-medium text-navy-300">{label}:</dt>
      <dd className="text-white">{children}</dd>
    </div>
  );
}

function Tick() {
  return (
    <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
