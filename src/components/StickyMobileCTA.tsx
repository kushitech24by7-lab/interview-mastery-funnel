"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/site-config";
import { displayPrices } from "@/lib/pricing";
import { track } from "@/lib/analytics";

/**
 * Sticky mobile purchase bar (brief §41).
 *
 * Behaviour rules implemented here:
 *  • Hidden until the visitor scrolls past the hero — an instant sticky bar on
 *    a cold Meta click reads as pressure before any value has been shown.
 *  • Hidden while the pricing section is on screen, so it never covers the
 *    real pricing card or duplicates the CTA the visitor is already looking at.
 *  • Respects the iOS home-indicator inset, and the page reserves matching
 *    bottom padding so the bar never covers the final FAQ answer.
 *  • Mobile only — desktop has the sticky pricing card instead.
 */

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);
  const [pricingInView, setPricingInView] = useState(false);

  useEffect(() => {
    const hero = document.querySelector("section");
    const pricing = document.getElementById("pricing");

    const scrollObserver = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-120px 0px 0px 0px" }
    );
    if (hero) scrollObserver.observe(hero);

    const pricingObserver = new IntersectionObserver(
      ([entry]) => setPricingInView(entry.isIntersecting),
      { threshold: 0.15 }
    );
    if (pricing) pricingObserver.observe(pricing);

    return () => {
      scrollObserver.disconnect();
      pricingObserver.disconnect();
    };
  }, []);

  const shown = visible && !pricingInView;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-navy-800 bg-navy-950/95 backdrop-blur-sm transition-transform duration-200 lg:hidden ${
        shown ? "translate-y-0" : "translate-y-full"
      }`}
      // Hidden from assistive tech when off-screen so it is not announced twice.
      aria-hidden={!shown}
    >
      <div className="pb-safe">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-fluid-xs font-semibold text-white">
              {siteConfig.PRODUCT_NAME}
            </p>
            {/*
              Only the current price appears here. ₹5,688 / ₹2,608 / ₹2,499
              would be unreadable at this size and cannot be properly labelled
              in a bar this small, so they stay in the value section (§31).
            */}
            <p className="text-[0.7rem] text-navy-300">
              <span className="font-bold text-white">{displayPrices.special}</span> ·{" "}
              {siteConfig.TOTAL_PRODUCTS} resources · one-time
            </p>
          </div>

          <a
            href="#pricing"
            onClick={() => track("StickyCTA_Click", { location: "sticky_mobile" })}
            className="btn-primary shrink-0 px-5 py-2.5 text-fluid-sm"
          >
            Get access
          </a>
        </div>
      </div>
    </div>
  );
}
