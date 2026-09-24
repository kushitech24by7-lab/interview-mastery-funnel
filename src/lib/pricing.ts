import {
  COMBINED_INDIVIDUAL_REGULAR_VALUE,
  COMBINED_INDIVIDUAL_SPECIAL_VALUE,
} from "./products";

/**
 * PRICING — single source of truth for every rupee figure on the site.
 *
 * ── THE FOUR NUMBERS AND WHAT EACH ONE MEANS ──────────────────────────────────
 * These are NOT interchangeable, and mislabelling them would be a misleading
 * price claim. Each has exactly one correct label, given by `label` below:
 *
 *   ₹5,688  Combined individual REGULAR value  — the 12 listed regular prices
 *                                                summed. NOT an MRP, and never
 *                                                the bundle's normal price.
 *   ₹2,608  Total at individual SPECIAL prices — the 12 listed special prices
 *                                                summed.
 *   ₹2,499  Regular BUNDLE price               — what the bundle normally sells
 *                                                for. The only figure eligible
 *                                                for strikethrough.
 *   ₹699    Current SPECIAL bundle price       — what the customer pays today.
 *
 * ── THE ONLY HEADLINE SAVINGS CLAIM ───────────────────────────────────────────
 * "Save ₹1,800 vs the regular bundle price" (2499 − 699). We deliberately do
 * NOT headline "save ₹4,989 / 88% off" against ₹5,688, because that compares
 * the bundle to twelve separate purchases nobody was going to make — the exact
 * pattern that makes a sceptical buyer distrust the whole page.
 *
 * ── AUTHORITATIVE AMOUNT ──────────────────────────────────────────────────────
 * The amount actually charged comes from PRODUCT_PRICE_PAISE on the SERVER
 * (see server-config.ts). BUNDLE_SPECIAL_PRICE here is for display and for the
 * analytics conversion value only. They must agree; DEPLOYMENT.md says so too.
 */

export const pricing = {
  /** What the customer pays today, in whole rupees. */
  BUNDLE_SPECIAL_PRICE: 699,
  /** The bundle's normal price. Genuine, so it may use strikethrough. */
  BUNDLE_REGULAR_PRICE: 2499,
  /** Sum of the 12 listed individual regular prices. Computed from product data. */
  COMBINED_INDIVIDUAL_REGULAR_VALUE,
  /** Sum of the 12 listed individual special prices. Computed from product data. */
  COMBINED_INDIVIDUAL_SPECIAL_VALUE,
  CURRENCY: "INR",
  CURRENCY_SYMBOL: "₹",

  // ── Display toggles (§7) ───────────────────────────────────────────────────
  // Each comparison can be withdrawn through config without rewriting sections.
  SHOW_INDIVIDUAL_REGULAR_VALUE: true,
  SHOW_INDIVIDUAL_SPECIAL_TOTAL: true,
  SHOW_BUNDLE_REGULAR_PRICE: true,
  SHOW_DISCOUNT_PERCENTAGE: true,
} as const;

/** Rupees → "₹2,499" using Indian digit grouping. */
export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** The headline savings figure: regular bundle price minus what you pay today. */
export const SAVINGS_VS_REGULAR_BUNDLE =
  pricing.BUNDLE_REGULAR_PRICE - pricing.BUNDLE_SPECIAL_PRICE;

/** Discount % against the regular BUNDLE price (not against ₹5,688). */
export const DISCOUNT_PERCENT_VS_BUNDLE = Math.round(
  (SAVINGS_VS_REGULAR_BUNDLE / pricing.BUNDLE_REGULAR_PRICE) * 100
);

/** Price of the bundle in paise, for display parity with the server amount. */
export const BUNDLE_SPECIAL_PRICE_PAISE = pricing.BUNDLE_SPECIAL_PRICE * 100;

/**
 * The approved label for each figure. Components read these rather than writing
 * their own wording, so no section can accidentally call ₹5,688 an "MRP" or
 * present it as the bundle's usual price.
 */
export const priceLabels = {
  special: "Current special price",
  bundleRegular: "Regular bundle price",
  individualRegular: "Combined individual regular value",
  individualSpecial: "Total at individual special prices",
} as const;

/** Formatted, ready-to-render figures. */
export const displayPrices = {
  special: formatINR(pricing.BUNDLE_SPECIAL_PRICE),
  bundleRegular: formatINR(pricing.BUNDLE_REGULAR_PRICE),
  individualRegular: formatINR(pricing.COMBINED_INDIVIDUAL_REGULAR_VALUE),
  individualSpecial: formatINR(pricing.COMBINED_INDIVIDUAL_SPECIAL_VALUE),
  savings: formatINR(SAVINGS_VS_REGULAR_BUNDLE),
} as const;

/** The one-line supporting statement about buying separately (§23). */
export const SEPARATE_PURCHASE_NOTE = `If purchased separately at their listed individual special prices, the 12 resources would total ${displayPrices.individualSpecial}.`;

/**
 * Build-time sanity checks. A wrong figure here is a misleading price claim,
 * so these run in every environment and fail the build rather than warn.
 */
if (pricing.BUNDLE_SPECIAL_PRICE >= pricing.BUNDLE_REGULAR_PRICE) {
  throw new Error(
    "Pricing error: the special price must be below the regular bundle price, " +
      "otherwise the savings claim and any strikethrough would be false."
  );
}
if (SAVINGS_VS_REGULAR_BUNDLE !== 1800) {
  throw new Error(
    `Pricing error: savings vs the regular bundle computed to ₹${SAVINGS_VS_REGULAR_BUNDLE}, ` +
      `but the site advertises ₹1,800. Update the copy or the prices.`
  );
}

/**
 * CANONICAL CTA LABELS.
 *
 * Every purchase CTA on the site uses one of these two. Mid-page buttons
 * previously said "Get the question bank + frameworks", "Start practising
 * properly" and "Get all 12 resources", which read as three different offers
 * to a scanning visitor and hid the price until the pricing section. One
 * repeated, priced phrase is easier to act on than five clever ones.
 *
 *   ctaLabels.primary → full name + price. Use in the hero and the final CTA.
 *   ctaLabels.short   → price-led. Use mid-page and anywhere space is tight.
 */
export const ctaLabels = {
  primary: `Get Complete Interview Mastery — ${displayPrices.special}`,
  short: `Get Instant Access — ${displayPrices.special}`,
} as const;

/**
 * Narrow-screen label for the hero CTA.
 *
 * At 375px the full "Get Complete Interview Mastery — ₹699" wraps onto three
 * lines, which makes the single most important control on the page look
 * broken. The short label keeps the price — the part that does the work — and
 * fits on one line. Components swap on a media query, not on user agent.
 */
export const ctaLabelsResponsive = {
  narrow: ctaLabels.short,
  wide: ctaLabels.primary,
} as const;
