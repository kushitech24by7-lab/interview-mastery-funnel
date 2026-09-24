"use client";

import { useEffect, useRef } from "react";
import { stages, productByCode } from "@/lib/products";
import { observeSection, track } from "@/lib/analytics";
import CheckoutButton from "./CheckoutButton";
import { ctaLabels } from "@/lib/pricing";

/**
 * THE SIGNATURE SECTION (brief §1 + §12).
 *
 * This is the idea the whole page hangs on: 12 resources are not 12 ebooks,
 * they are one journey where each resource has a job. The connector rail makes
 * the sequence legible at a glance; each stage names the resources that serve it,
 * which is what turns "a pile of PDFs" into "a system".
 */

export default function SixStageSystem() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => observeSection(ref.current, "BundleSection_View", { section: "six_stage" }), []);

  return (
    <section ref={ref} id="system" className="section bg-navy-950 text-white">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-teal-300">The system</p>
          <h2 className="h2 mt-3 text-white">
            Not 12 random PDFs.
            <br />
            <span className="text-amber-400">One interview preparation system.</span>
          </h2>
          <p className="lede mx-auto mt-4 text-navy-200">
            Each resource has a job. Together they take you from understanding the interview all the
            way through to the offer conversation.
          </p>
        </div>

        <ol className="relative mt-12 space-y-4 sm:space-y-5">
          {/* Vertical connector rail — decorative, hidden from screen readers */}
          <div
            aria-hidden="true"
            className="absolute left-[1.6rem] top-4 hidden h-[calc(100%-2rem)] w-px bg-gradient-to-b from-teal-400/60 via-blue-400/40 to-amber-400/60 sm:block"
          />

          {stages.map((stage, index) => (
            <li key={stage.key} className="relative">
              <div className="rounded-xl2 border border-white/10 bg-white/[0.05] p-5 transition-colors hover:bg-white/[0.08] sm:ml-16 sm:p-6">
                {/* Stage number badge */}
                <span
                  className="absolute left-0 top-5 hidden h-14 w-14 items-center justify-center rounded-full border-2 border-navy-950 bg-gradient-to-br from-teal-500 to-blue-600 text-fluid-lg font-bold text-white shadow-lg sm:flex"
                  aria-hidden="true"
                >
                  {stage.number}
                </span>

                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-fluid-xs font-bold text-amber-400 sm:hidden">
                    {stage.number}
                  </span>
                  <h3 className="text-fluid-xl font-bold uppercase tracking-wide text-white">
                    {stage.name}
                  </h3>
                  <p className="text-fluid-sm font-medium text-teal-300">{stage.headline}</p>
                </div>

                <p className="mt-2.5 max-w-prose text-fluid-sm leading-relaxed text-navy-200">
                  {stage.description}
                </p>

                <ul className="mt-4 flex flex-wrap gap-2">
                  {stage.resourceCodes.map((code) => {
                    const product = productByCode(code);
                    return (
                      <li key={code}>
                        <a
                          href={`#${code.toLowerCase()}`}
                          onClick={() => track("BundleSection_View", { jump_to: code })}
                          className="inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-full border border-white/15 bg-navy-900/60 px-3.5 py-2 text-[0.75rem] font-medium text-navy-100 transition-colors hover:border-teal-400/50 hover:text-white"
                        >
                          <span className="font-bold text-teal-300">{code}</span>
                          <span className="hidden sm:inline">{product?.shortTitle}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Down arrow between stages on mobile */}
              {index < stages.length - 1 && (
                <div aria-hidden="true" className="flex justify-center py-1 sm:hidden">
                  <svg className="h-4 w-4 text-teal-400/60" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 16l-5-6h10l-5 6z" />
                  </svg>
                </div>
              )}
            </li>
          ))}
        </ol>

        <div className="mt-12 flex justify-center">
          <CheckoutButton label={ctaLabels.short} location="six_stage_system" />
        </div>
      </div>
    </section>
  );
}
