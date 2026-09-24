/**
 * SINGLE SOURCE OF TRUTH for business configuration (brief §53).
 *
 * ── HOW TO GO LIVE ────────────────────────────────────────────────────────────
 * Every value below reading "[SOMETHING]" is a placeholder that must be replaced
 * before you run ads to this page. Placeholders are detected at runtime by
 * `isPlaceholder()` and surfaced as a visible build warning in development, so
 * nothing silently ships as "[PRICE]".
 *
 * ── WHAT MUST NEVER LIVE IN THIS FILE ─────────────────────────────────────────
 * This file is bundled into the browser. It must NEVER contain:
 *   • RAZORPAY_KEY_SECRET
 *   • The Google Drive delivery URL
 *   • Any webhook secret or admin token
 * Those are server-only and read from process.env in src/lib/server-config.ts.
 */

export const PLACEHOLDER_PATTERN = /^\[.*\]$/;

/** True when a config value is still an unreplaced placeholder such as "[PRICE]". */
export function isPlaceholder(value: string | undefined | null): boolean {
  return !value || PLACEHOLDER_PATTERN.test(value.trim());
}

export const siteConfig = {
  // ── Brand ─────────────────────────────────────────────────────────────────
  // Hierarchy: BRAND = Interview Mastery, PRODUCT = Complete Interview Mastery.
  // Keep them distinct — do not print both in every section (§2).
  BRAND_NAME: "Interview Mastery",
  PRODUCT_NAME: "Complete Interview Mastery",
  PRODUCT_TAGLINE: "12-Resource Interview Preparation System",
  PRIMARY_DOMAIN: "interviewmastery.shop",

  // ── Verified product facts (brief §2 — do not change these numbers) ────────
  TOTAL_PAGES: 619,
  TOTAL_PRODUCTS: 12,
  TOTAL_QUESTIONS: 500,
  TOTAL_FRAMEWORKS: 14,
  TOTAL_STAR_EXAMPLES: 100,
  TOTAL_SPOKEN_DRILLS: 30,
  TOTAL_TEMPLATES: 30,

  // ── Pricing ───────────────────────────────────────────────────────────────
  /**
   * Display price. The authoritative charged amount is PRODUCT_PRICE_PAISE on
   * the server; these must agree. Full hierarchy lives in src/lib/pricing.ts.
   */
  PRICE: "₹699",
  /** ₹699 => 69900 paise. Used for the analytics conversion value. */
  PRICE_IN_PAISE: 69900,
  CURRENCY: "INR",
  /**
   * The genuine regular bundle price, eligible for strikethrough because the
   * bundle really does sell at this price outside the current offer.
   * NOTE: this is ₹2,499 — never ₹5,688, which is a sum of separate items.
   */
  REFERENCE_PRICE: "₹2,499",

  // ── Support (brief §32 — buyers must see who to contact) ──────────────────
  /**
   * NOTE: main set this to "suport@interviewmastery.com". The missing "p" in
   * "suport" is corrected here — every policy page and the checkout trust
   * block point at this address, so a typo silently blackholes refund
   * requests. The .com domain from main is kept (it has live MX records);
   * confirm whether .com or .shop is the intended support mailbox.
   */
  SUPPORT_EMAIL: "support@interviewmastery.com",
  /** Digits only with country code, e.g. "919876543210". Leave placeholder to hide WhatsApp UI. */
  SUPPORT_WHATSAPP: "[SUPPORT_WHATSAPP]",
  SUPPORT_HOURS: "[e.g. Mon–Sat, 10am–7pm IST]",

  // ── Legal (brief §50 — placeholders, never invented policies) ─────────────
  /**
   * The business name shown on legal pages and in the checkout trust block.
   * No registration number, GSTIN, PAN or registered address is recorded here
   * because none has been supplied — and inventing one would be a false
   * statutory disclosure.
   */
  LEGAL_BUSINESS_NAME: "Interview Mastery",
  /** Published legal routes. See src/app/(legal)/. */
  TERMS_URL: "/terms",
  PRIVACY_URL: "/privacy-policy",
  REFUND_POLICY_URL: "/refund-policy",
  CONTACT_URL: "/contact",
  DISCLAIMER_URL: "/disclaimer",
  /** One-line summary shown in the FAQ; the full terms live at /refund-policy. */
  REFUND_POLICY_SUMMARY:
    "Complete Interview Mastery is a digital product delivered immediately after payment. If you are charged twice, or you pay but cannot access the files and support cannot resolve it, contact us within 7 days and we will review a refund. Because the material is downloadable, change-of-mind requests may not qualify once the files have been substantially accessed.",

  // ── Payments (public key only) ────────────────────────────────────────────
  /**
   * PUBLIC key id — safe in the browser bundle. This is a TEST key; swap it for
   * the live `rzp_live_*` key when you go live.
   *
   * The key actually used by the checkout modal is the one the SERVER returns
   * from /api/razorpay/create-order (read from the RAZORPAY_KEY_ID env var).
   * This copy exists only so the CTA can tell, before any network call, whether
   * payments are configured at all. The KEY SECRET never appears here.
   */
  RAZORPAY_KEY_ID: "rzp_test_TfnnDtRJp0Z4S9",

  // ── Analytics (brief §46) ─────────────────────────────────────────────────
  META_PIXEL_ID: "[META_PIXEL_ID]",
  GA4_ID: "[GA4_ID]",

  // ── SEO / Open Graph (brief §59 items 21–22) ──────────────────────────────
  SITE_URL: "https://interviewmastery.shop",
  OG_IMAGE: "/og/complete-interview-mastery.jpg",
  /** Apex domain is canonical; www redirects to it (§34). */
  CANONICAL_HOST: "interviewmastery.shop",
  /** Shown on the legal pages. Update when a policy materially changes. */
  POLICY_LAST_UPDATED: "September 23, 2026",

  // ── Feature flags ─────────────────────────────────────────────────────────
  /**
   * Brief §29 + §45: testimonials render ONLY from genuine supplied data.
   * The section hides itself automatically when the testimonial array is empty,
   * so this flag is a second safety catch, not the only one.
   */
  SHOW_TESTIMONIALS: false,
  /** Shows clearly-labelled dev placeholders for testimonials in development only. */
  SHOW_TESTIMONIAL_DEV_PLACEHOLDERS: false,
} as const;

export type SiteConfig = typeof siteConfig;

/** Formats the display price, falling back to the placeholder so gaps stay obvious. */
export function displayPrice(): string {
  return siteConfig.PRICE;
}

/** WhatsApp is only rendered when a real number has been configured. */
export function whatsappLink(message?: string): string | null {
  if (isPlaceholder(siteConfig.SUPPORT_WHATSAPP)) return null;
  const digits = siteConfig.SUPPORT_WHATSAPP.replace(/\D/g, "");
  if (!digits) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

/** Support email link, or null when still unconfigured. */
export function supportMailto(subject?: string): string | null {
  if (isPlaceholder(siteConfig.SUPPORT_EMAIL)) return null;
  const s = subject ? `?subject=${encodeURIComponent(subject)}` : "";
  return `mailto:${siteConfig.SUPPORT_EMAIL}${s}`;
}

/** Config keys that still need real values, for the dev-only launch checklist. */
export function pendingConfigKeys(): string[] {
  const checks: Array<[string, string | number]> = [
    ["SUPPORT_EMAIL", siteConfig.SUPPORT_EMAIL],
    ["SUPPORT_WHATSAPP", siteConfig.SUPPORT_WHATSAPP],
    ["LEGAL_BUSINESS_NAME", siteConfig.LEGAL_BUSINESS_NAME],
    ["TERMS_URL", siteConfig.TERMS_URL],
    ["PRIVACY_URL", siteConfig.PRIVACY_URL],
    ["REFUND_POLICY_URL", siteConfig.REFUND_POLICY_URL],
    ["REFUND_POLICY_SUMMARY", siteConfig.REFUND_POLICY_SUMMARY],
    ["RAZORPAY_KEY_ID", siteConfig.RAZORPAY_KEY_ID],
    ["META_PIXEL_ID", siteConfig.META_PIXEL_ID],
    ["GA4_ID", siteConfig.GA4_ID],
  ];
  return checks
    .filter(([, v]) => (typeof v === "number" ? v <= 0 : isPlaceholder(v)))
    .map(([k]) => k);
}
