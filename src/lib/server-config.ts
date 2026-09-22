import "server-only";

/**
 * SERVER-ONLY configuration (brief §33 + §34).
 *
 * The `server-only` import above makes the build FAIL if any client component
 * ever imports this file. That is deliberate: it is the mechanism that stops
 * RAZORPAY_KEY_SECRET or the Google Drive delivery URL from being bundled into
 * the browser, which is the single most common way digital-product funnels leak
 * their paid deliverable.
 *
 * Required environment variables (see .env.example):
 *   RAZORPAY_KEY_ID          public key id (also exposed to client for checkout)
 *   RAZORPAY_KEY_SECRET      SECRET — server only, never sent to the browser
 *   RAZORPAY_WEBHOOK_SECRET  SECRET — validates Razorpay webhook callbacks
 *   PRODUCT_PRICE_PAISE      authoritative price in paise, e.g. 69900 for ₹699
 *   PRODUCT_DOWNLOAD_URL     Google Drive folder URL — released only after verification
 *   ACCESS_TOKEN_SECRET      SECRET — signs the short-lived access token
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    // Thrown at request time rather than build time so the marketing page can
    // still be built and previewed before payment credentials exist.
    throw new Error(
      `Missing required environment variable: ${name}. Copy .env.example to .env.local and fill it in.`
    );
  }
  return value;
}

export const serverConfig = {
  get razorpayKeyId() {
    return required("RAZORPAY_KEY_ID");
  },
  get razorpayKeySecret() {
    return required("RAZORPAY_KEY_SECRET");
  },
  get razorpayWebhookSecret() {
    return process.env.RAZORPAY_WEBHOOK_SECRET || "";
  },
  get accessTokenSecret() {
    return required("ACCESS_TOKEN_SECRET");
  },
  /**
   * The authoritative price. The browser NEVER sends an amount — it is read
   * here, server-side, so a tampered client cannot buy the bundle for ₹1.
   */
  get pricePaise() {
    const raw = required("PRODUCT_PRICE_PAISE");
    const paise = Number.parseInt(raw, 10);
    if (!Number.isInteger(paise) || paise <= 0) {
      throw new Error(`PRODUCT_PRICE_PAISE must be a positive integer of paise, got: ${raw}`);
    }
    return paise;
  },
  get currency() {
    return process.env.PRODUCT_CURRENCY || "INR";
  },
  /** Google Drive folder containing the 12 products. Released only post-verification. */
  get productDownloadUrl() {
    return required("PRODUCT_DOWNLOAD_URL");
  },
  get isConfigured() {
    return Boolean(
      process.env.RAZORPAY_KEY_ID &&
        process.env.RAZORPAY_KEY_SECRET &&
        process.env.PRODUCT_PRICE_PAISE &&
        process.env.PRODUCT_DOWNLOAD_URL &&
        process.env.ACCESS_TOKEN_SECRET
    );
  },
};

export const ACCESS_COOKIE = "ml_access";
/** Access token lifetime. Short enough to limit link sharing, long enough to be usable. */
export const ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
