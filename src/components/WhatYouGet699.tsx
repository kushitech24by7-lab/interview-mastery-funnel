"use client";

import CheckoutButton from "./CheckoutButton";
import ProductCover from "./ProductCover";
import { productByCode } from "@/lib/products";
import { displayPrices } from "@/lib/pricing";
import { siteConfig } from "@/lib/site-config";

/**
 * "What does ₹699 actually give you?" (§25).
 *
 * Each resource is introduced by the JOB it does, as a verb. The verb answers
 * the buyer's real question — "what will this let me do?" — where a list of
 * twelve titles only answers "what is in the box".
 */

const jobs: { verb: string; code: string }[] = [
  { verb: "Understand", code: "P01" },
  { verb: "Communicate", code: "P02" },
  { verb: "Prepare", code: "P03" },
  { verb: "See the pattern", code: "P04" },
  { verb: "Introduce yourself", code: "P05" },
  { verb: "Handle difficult questions", code: "P06" },
  { verb: "Prepare for compensation", code: "P07" },
  { verb: "Practise", code: "P08" },
  { verb: "Research", code: "P09" },
  { verb: "Personalise", code: "P10" },
  { verb: "Execute", code: "P11" },
  { verb: "Stay organised", code: "P12" },
];

export default function WhatYouGet699() {
  return (
    <section className="section bg-sand">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">One payment, twelve jobs done</p>
          <h2 className="h2 mt-3">
            What does {displayPrices.special} actually give you?
          </h2>
          <p className="lede mx-auto mt-4">
            Each resource has a specific job. Here is what each one lets you do.
          </p>
        </div>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map(({ verb, code }) => {
            const product = productByCode(code);
            if (!product) return null;
            return (
              <li key={code} className="card flex items-center gap-4 p-4">
                <div className="w-14 shrink-0 sm:w-16">
                  <ProductCover
                    product={product}
                    variant="compact"
                    sizes="(max-width: 640px) 56px, 64px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-fluid-xs font-bold uppercase tracking-wider text-teal-700">
                    {verb}
                  </p>
                  <p className="mt-1 text-fluid-sm font-semibold leading-snug text-navy-950">
                    {product.title}
                  </p>
                  <p className="mt-0.5 text-fluid-xs text-ink-faint">{product.pages} pages</p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mx-auto mt-10 max-w-xl rounded-xl2 bg-navy-950 p-6 text-center sm:p-8">
          <p className="text-fluid-sm font-semibold uppercase tracking-[0.14em] text-teal-300">
            All {siteConfig.TOTAL_PRODUCTS} digital resources
          </p>
          <p className="mt-2 text-fluid-4xl font-bold leading-none text-amber-400">
            {displayPrices.special}
          </p>
          <p className="mt-2 text-fluid-sm font-medium text-white">One-time payment</p>
          <div className="mt-6 flex justify-center">
            <CheckoutButton
              label={`Get instant access — ${displayPrices.special}`}
              location="what_you_get_699"
              showTrustLine
              trustLineOnDark
            />
          </div>
          <p className="mt-3 text-fluid-xs text-navy-300">
            {siteConfig.TOTAL_PAGES} pages · No subscription · Secure Razorpay checkout
          </p>
        </div>
      </div>
    </section>
  );
}
