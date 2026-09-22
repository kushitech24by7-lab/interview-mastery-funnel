/**
 * Analytics layer (brief §46).
 *
 * Design rules enforced here:
 *  1. `Purchase` (Meta) and `purchase` (GA4) fire ONLY from the success page,
 *     after the server has verified the Razorpay signature. There is no code
 *     path that fires Purchase from the checkout handler.
 *  2. Every event is a no-op until the corresponding ID is configured, so the
 *     page never throws on an unconfigured environment.
 *  3. UTM parameters are captured on first landing, persisted, and attached to
 *     the order so attribution survives checkout.
 */

import { siteConfig, isPlaceholder } from "./site-config";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const UTM_STORAGE_KEY = "ml_attribution_v1";

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  gclid?: string;
  landing_page?: string;
  referrer?: string;
  first_seen?: string;
}

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
] as const;

/**
 * Captures UTM/click IDs on landing. First-touch wins: we do not overwrite an
 * existing attribution record with an empty one on later navigations.
 */
export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  let stored: Attribution = {};
  try {
    stored = JSON.parse(sessionStorage.getItem(UTM_STORAGE_KEY) || "{}");
  } catch {
    stored = {};
  }

  const params = new URLSearchParams(window.location.search);
  const incoming: Attribution = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) incoming[key] = value.slice(0, 200);
  }

  const hasIncoming = Object.keys(incoming).length > 0;
  const hasStored = Object.keys(stored).length > 0;
  if (!hasIncoming && hasStored) return stored;

  const merged: Attribution = {
    ...stored,
    ...incoming,
    landing_page: stored.landing_page || window.location.pathname,
    referrer: stored.referrer || document.referrer || undefined,
    first_seen: stored.first_seen || new Date().toISOString(),
  };

  try {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(merged));
  } catch {
    /* private mode — attribution simply won't persist */
  }
  return merged;
}

export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(UTM_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

const metaEnabled = () => !isPlaceholder(siteConfig.META_PIXEL_ID);
const ga4Enabled = () => !isPlaceholder(siteConfig.GA4_ID);

/** Standard Meta events use fbq('track'); everything else is a custom event. */
const META_STANDARD = new Set([
  "PageView",
  "ViewContent",
  "InitiateCheckout",
  "Purchase",
  "Lead",
  "AddToCart",
]);

export type FunnelEvent =
  | "PageView"
  | "ViewContent"
  | "HeroCTA_Click"
  | "BundleSection_View"
  | "ProductPreview_Open"
  | "FrameworkSection_View"
  | "Pricing_View"
  | "PricingCTA_Click"
  | "InitiateCheckout"
  | "RazorpayOpened"
  | "PaymentSuccess"
  | "Purchase"
  | "PaymentFailure"
  | "FAQ_Open"
  | "Support_Click"
  | "Access_Click"
  | "StickyCTA_Click"
  // Post-V2 CRO events (§59)
  | "HeroPriceView"
  | "ProductGrid_View"
  | "BundleMockup_View"
  | "ValueStack_View"
  | "IndividualComparison_View"
  | "PricingSection_View"
  | "BundleCTA699_Click";

export function track(event: FunnelEvent, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;

  const payload = { ...params, ...getAttribution() };

  if (metaEnabled() && typeof window.fbq === "function") {
    if (META_STANDARD.has(event)) {
      window.fbq("track", event, payload);
    } else {
      window.fbq("trackCustom", event, payload);
    }
  }

  if (ga4Enabled() && typeof window.gtag === "function") {
    window.gtag("event", toSnakeCase(event), payload);
  }

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", event, payload);
  }
}

/**
 * Purchase — call ONLY after server-side signature verification.
 * `orderId` is used as the Meta deduplication key so a page refresh on the
 * success page does not double-count the conversion.
 */
export function trackVerifiedPurchase(args: {
  orderId: string;
  paymentId: string;
  value: number;
  currency: string;
}): void {
  if (typeof window === "undefined") return;

  const dedupeKey = `ml_purchase_tracked_${args.orderId}`;
  try {
    if (sessionStorage.getItem(dedupeKey)) return;
    sessionStorage.setItem(dedupeKey, "1");
  } catch {
    /* proceed without dedupe if storage is unavailable */
  }

  const payload = {
    content_name: siteConfig.PRODUCT_NAME,
    content_ids: ["complete-interview-mastery"],
    content_type: "product",
    value: args.value,
    currency: args.currency,
    ...getAttribution(),
  };

  if (metaEnabled() && typeof window.fbq === "function") {
    window.fbq("track", "Purchase", payload, { eventID: args.orderId });
  }

  if (ga4Enabled() && typeof window.gtag === "function") {
    window.gtag("event", "purchase", {
      transaction_id: args.orderId,
      value: args.value,
      currency: args.currency,
      items: [
        {
          item_id: "complete-interview-mastery",
          item_name: siteConfig.PRODUCT_NAME,
          price: args.value,
          quantity: 1,
        },
      ],
      ...getAttribution(),
    });
  }
}

function toSnakeCase(event: string): string {
  return event
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/__+/g, "_")
    .toLowerCase();
}

/**
 * Fires a one-time section-view event using IntersectionObserver.
 * Returns a cleanup function.
 */
export function observeSection(
  el: Element | null,
  event: FunnelEvent,
  params: Record<string, unknown> = {}
): () => void {
  if (!el || typeof IntersectionObserver === "undefined") return () => {};
  let fired = false;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !fired) {
          fired = true;
          track(event, params);
          observer.disconnect();
        }
      }
    },
    { threshold: 0.35 }
  );
  observer.observe(el);
  return () => observer.disconnect();
}
