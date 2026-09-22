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

/**
 * A deployment MISCONFIGURATION, as opposed to a gateway or network failure.
 *
 * These are distinguished because the two need opposite responses: a gateway
 * blip is worth retrying and the buyer should be told "try again", whereas a
 * config fault will fail identically forever until an operator changes an
 * environment variable. Telling a buyer to retry in that case wastes their
 * time and hides the real problem from whoever can fix it.
 */
export class PaymentConfigError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "PaymentConfigError";
    this.code = code;
  }
}

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
    const keyId = required("RAZORPAY_KEY_ID");

    /**
     * Guard against shipping a TEST key to production (and against a live key
     * in a dev environment). Razorpay key ids are prefixed `rzp_test_` or
     * `rzp_live_`, so the mode is knowable at startup.
     *
     * Without this, a deploy that forgets to swap the key fails silently: the
     * page looks fine, checkout opens, buyers "pay" with test cards and no
     * money ever arrives. That is usually discovered days later.
     */
    const allowTestInProd = process.env.ALLOW_TEST_KEY_IN_PROD === "1";

    /**
     * NOTE ON THE CONDITION: we deliberately do NOT key this off NODE_ENV.
     * `next start` sets NODE_ENV=production for ordinary local production
     * builds, so that check would block routine local testing with a test key.
     *
     * A real deployment is identified by the host injecting a deployment
     * marker (Vercel sets VERCEL_ENV=production; other hosts can set
     * DEPLOY_ENV=production). Only then is a test key an actual mistake.
     */
    const isRealDeployment =
      process.env.VERCEL_ENV === "production" || process.env.DEPLOY_ENV === "production";

    if (isRealDeployment && keyId.startsWith("rzp_test_") && !allowTestInProd) {
      throw new PaymentConfigError(
        "test_key_in_production",
        "Refusing to serve payments: a Razorpay TEST key (rzp_test_*) is configured " +
          "on a PRODUCTION deployment. No real money would be collected. Set the live " +
          "rzp_live_* key and its matching secret in your hosting provider's environment " +
          "variables and redeploy, or set ALLOW_TEST_KEY_IN_PROD=1 if this deployment is " +
          "a deliberate staging environment."
      );
    }
    return keyId;
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
  /** "test" | "live" | "unknown" — derived from the key id prefix. */
  get razorpayMode(): "test" | "live" | "unknown" {
    const keyId = process.env.RAZORPAY_KEY_ID || "";
    if (keyId.startsWith("rzp_test_")) return "test";
    if (keyId.startsWith("rzp_live_")) return "live";
    return "unknown";
  },
};

export const ACCESS_COOKIE = "ml_access";
/** Access token lifetime. Short enough to limit link sharing, long enough to be usable. */
export const ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
