"use client";

import CheckoutButton from "./CheckoutButton";
import { PRIMARY_FINAL_CTA } from "@/lib/variants";
import { siteConfig } from "@/lib/site-config";
import { pricing, displayPrices, ctaLabels } from "@/lib/pricing";

/**
 * Final emotional close (brief §51 + §52).
 *
 * The persuasion here is control, not fear. It concedes plainly what cannot be
 * promised — the question list, the interviewer, the result — which is what
 * earns the right to claim the part that CAN be controlled.
 */

const controllables = [
  "Researched the role properly",
  "Built your evidence bank",
  "Structured your answers",
  "Practised aloud",
  "Tested yourself with scored mocks",
  "Prepared the difficult questions",
  "Planned interview day",
  "Prepared what happens next",
];

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-navy-950 py-16 text-white sm:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(55% 45% at 50% 0%, rgba(47,153,146,0.25) 0%, transparent 65%)",
        }}
      />

      <div className="container-page relative">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-fluid-3xl font-bold leading-[1.15] text-white">
            You cannot control every interview question.
            <br />
            <span className="text-amber-400">You can control how you prepare.</span>
          </h2>

          <div className="mx-auto mt-8 max-w-md space-y-2 text-left sm:text-center">
            <p className="text-fluid-sm text-navy-300">
              You cannot know every question in advance. You cannot control the interviewer. You
              cannot guarantee the result.
            </p>
            <p className="text-fluid-base font-semibold text-white">
              But you can walk in having:
            </p>
          </div>

          <ul className="mx-auto mt-6 grid max-w-2xl gap-2 text-left sm:grid-cols-2">
            {controllables.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 text-fluid-sm text-navy-100"
              >
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-teal-400"
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
                {item}
              </li>
            ))}
          </ul>

          <p className="mx-auto mt-8 max-w-xl text-fluid-lg font-medium text-white">
            {PRIMARY_FINAL_CTA.headline}
          </p>

          {/* Price integrated into the close without shouting (§70). */}
          <div className="mx-auto mt-8 flex max-w-xs flex-col items-center gap-1 rounded-xl2 border border-white/10 bg-white/[0.05] px-6 py-4">
            {pricing.SHOW_BUNDLE_REGULAR_PRICE && (
              <span className="text-fluid-xs text-navy-300">
                Regular bundle price{" "}
                <span className="line-through decoration-navy-500">
                  {displayPrices.bundleRegular}
                </span>
              </span>
            )}
            <span className="text-fluid-3xl font-bold leading-none text-amber-400">
              {displayPrices.special}
            </span>
            <span className="text-fluid-xs font-medium text-white">
              One-time payment · No subscription
            </span>
          </div>

          <div className="mt-6 flex justify-center">
            <CheckoutButton
              label={ctaLabels.primary}
                shortLabel={ctaLabels.short}
              location="final_cta"
              showTrustLine
              trustLineOnDark
            />
          </div>

          <p className="mt-4 text-fluid-xs text-navy-300">
            {siteConfig.TOTAL_PRODUCTS} digital resources · {siteConfig.TOTAL_PAGES} pages · secure
            Razorpay checkout
          </p>
        </div>
      </div>
    </section>
  );
}
