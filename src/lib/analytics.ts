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
 * ── META STANDARD-EVENT HELPERS ───────────────────────────────────────────────
 *
 * The funnel Meta expects is PageView → ViewContent → InitiateCheckout →
 * Purchase. Each of the three below sends the product payload Meta needs to
 * value the conversion, and each guards against firing twice.
 *
 * PageView is NOT here on purpose: the base pixel snippet in layout.tsx already
 * fires it exactly once, and its `if(f.fbq)return` guard prevents re-init. A
 * second manual PageView would double-count every session.
 *
 * All of these are safe when the pixel is blocked, unconfigured or still
 * loading — `track()` no-ops rather than throwing.
 */

/** Shared product payload so the three events describe the same thing. */
function productPayload(): Record<string, unknown> {
  return {
    content_name: siteConfig.PRODUCT_NAME,
    content_ids: [PRODUCT_CONTENT_ID],
    content_type: "product",
    value: purchaseValue(),
    currency: siteConfig.CURRENCY,
  };
}

const PRODUCT_CONTENT_ID = "complete-interview-mastery";

/** Rupee value of one purchase, derived from the single price source. */
function purchaseValue(): number {
  return siteConfig.PRICE_IN_PAISE > 0 ? siteConfig.PRICE_IN_PAISE / 100 : 0;
}

/**
 * Module-level guard for ViewContent.
 *
 * React 18 Strict Mode mounts effects twice in development, and the hero
 * remounts whenever the A/B variant changes. Both would send a second
 * ViewContent for what is really one product-page view. A module-level flag
 * survives remounts within the page lifetime; a ref or state would not.
 */
let viewContentSent = false;

/** Order ids already reported in this page lifetime (Strict Mode guard). */
const purchasesSent = new Set<string>();

/** Fire once per page view, when the visitor genuinely sees the product page. */
export function trackViewContent(extra: Record<string, unknown> = {}): void {
  if (typeof window === "undefined" || viewContentSent) return;
  viewContentSent = true;
  track("ViewContent", { ...productPayload(), ...extra });
}

/**
 * Fire when the customer actually starts checkout.
 *
 * Call this AFTER the Razorpay order has been created and immediately before
 * the modal opens — not on click. Firing on click would also count clicks that
 * never reach Razorpay because order creation failed or payments are
 * misconfigured, which inflates the funnel exactly where it should be honest.
 */
export function trackInitiateCheckout(args: {
  orderId: string;
  location: string;
}): void {
  if (typeof window === "undefined") return;
  track("InitiateCheckout", {
    ...productPayload(),
    num_items: 1,
    order_id: args.orderId,
    location: args.location,
  });
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

  /*
   * DUPLICATE-PURCHASE PREVENTION — three independent layers, because a
   * double-counted Purchase corrupts ad optimisation and ROAS reporting:
   *
   *  1. `purchasesSent` (module memory) stops React Strict Mode's double effect
   *     invocation and any remount inside the same page load. sessionStorage
   *     alone does NOT stop this reliably: both invocations can read the key
   *     before either writes it.
   *  2. localStorage survives reload, back/forward navigation and tab restore
   *     for the same browser — the realistic ways a buyer revisits a success
   *     page. sessionStorage would miss a reopened tab.
   *  3. `eventID: orderId` lets Meta itself discard a duplicate, including one
   *     arriving from the Conversions API, since the order id is stable and
   *     unique per transaction.
   */
  if (purchasesSent.has(args.orderId)) return;
  purchasesSent.add(args.orderId);

  const dedupeKey = `im_purchase_tracked_${args.orderId}`;
  try {
    if (localStorage.getItem(dedupeKey)) return;
    localStorage.setItem(dedupeKey, String(Date.now()));
  } catch {
    /* private mode — layers 1 and 3 still apply */
  }

  const payload = {
    ...productPayload(),
    // Server-verified figures win over the shared defaults.
    value: args.value,
    currency: args.currency,
    num_items: 1,
    order_id: args.orderId,
    payment_id: args.paymentId,
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
