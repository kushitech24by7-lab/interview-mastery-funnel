import { NextResponse } from "next/server";
import { emailConfig } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Configuration diagnostics.
 *
 * ── WHY THIS EXISTS ───────────────────────────────────────────────────────────
 * The post-purchase email failed silently in production: `sendEmail` skips with
 * a console warning when RESEND_API_KEY / EMAIL_FROM are unset, and nothing on
 * the site surfaces that. Without a way to ask the running deployment what it
 * actually has, diagnosing it means guessing at Vercel's env from the outside.
 *
 * ── WHAT IT DELIBERATELY DOES NOT RETURN ──────────────────────────────────────
 * Only booleans, lengths and non-secret prefixes. No key, no secret, no Drive
 * URL, no customer data. Knowing that RESEND_API_KEY is 36 characters and
 * starts "re_" is enough to tell a missing variable from a malformed one, and
 * is useless to an attacker.
 *
 * Access is gated on DIAGNOSTICS_TOKEN. Without that variable set the route
 * returns 404, so it does not exist at all on a deployment that has not opted
 * in — a public config-state endpoint is an information leak even when every
 * individual field is safe.
 *
 *   curl https://interviewmastery.shop/api/diagnostics -H "x-diagnostics-token: ..."
 */

/** Describes a variable without revealing it. */
function describe(value: string | undefined, opts: { prefix?: number } = {}) {
  if (!value) return { set: false as const };
  return {
    set: true as const,
    length: value.length,
    ...(opts.prefix ? { startsWith: value.slice(0, opts.prefix) } : {}),
  };
}

export async function GET(request: Request) {
  const expected = process.env.DIAGNOSTICS_TOKEN;

  // No token configured → the route does not exist.
  if (!expected) {
    return new NextResponse("Not found", { status: 404 });
  }

  const provided =
    request.headers.get("x-diagnostics-token") ||
    new URL(request.url).searchParams.get("token") ||
    "";

  if (provided !== expected) {
    return new NextResponse("Not found", { status: 404 });
  }

  const from = process.env.EMAIL_FROM || "";
  // The domain half of the From address is what must be verified with the
  // provider, and it is public information (it appears in every email header).
  const fromDomain = from.includes("@")
    ? from.slice(from.lastIndexOf("@") + 1).replace(/>$/, "")
    : null;

  /*
   * A flat present/absent summary, in the exact shape an operator wants when
   * production email is failing. The structured detail below stays for
   * distinguishing "missing" from "malformed", but this block answers the
   * only question that matters first: is anything required not set?
   *
   * NOTE ON NAMES: the delivery URL variable is PRODUCT_DOWNLOAD_URL.
   * PRODUCT_DELIVERY_URL is NOT read anywhere in this codebase — setting that
   * name would be silently ignored and the delivery email would ship without
   * a link.
   */
  const required = {
    RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY),
    EMAIL_FROM: Boolean(process.env.EMAIL_FROM),
    SUPPORT_EMAIL: Boolean(process.env.SUPPORT_EMAIL),
    PRODUCT_DOWNLOAD_URL: Boolean(process.env.PRODUCT_DOWNLOAD_URL),
    RAZORPAY_KEY_ID: Boolean(process.env.RAZORPAY_KEY_ID),
    RAZORPAY_KEY_SECRET: Boolean(process.env.RAZORPAY_KEY_SECRET),
    ACCESS_TOKEN_SECRET: Boolean(process.env.ACCESS_TOKEN_SECRET),
    PRODUCT_PRICE_PAISE: Boolean(process.env.PRODUCT_PRICE_PAISE),
  };
  const missing = Object.entries(required)
    .filter(([, present]) => !present)
    .map(([name]) => name);

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    /** The headline: everything needed to take a payment AND deliver it. */
    ready: missing.length === 0 && emailConfig.isConfigured,
    present: required,
    missing,
    /** Set but ignored — a common cause of "I added it and nothing changed". */
    ignoredIfSet: process.env.PRODUCT_DELIVERY_URL
      ? ["PRODUCT_DELIVERY_URL is set but this codebase reads PRODUCT_DOWNLOAD_URL"]
      : [],
    deployment: {
      vercelEnv: process.env.VERCEL_ENV || null,
      nodeEnv: process.env.NODE_ENV || null,
    },
    email: {
      /** The single most important line: false here means nothing is delivered. */
      willSend: emailConfig.isConfigured,
      RESEND_API_KEY: describe(process.env.RESEND_API_KEY, { prefix: 3 }),
      EMAIL_FROM: { ...describe(from), domain: fromDomain },
      SUPPORT_EMAIL: describe(process.env.SUPPORT_EMAIL),
    },
    payments: {
      RAZORPAY_KEY_ID: describe(process.env.RAZORPAY_KEY_ID, { prefix: 9 }),
      RAZORPAY_KEY_SECRET: describe(process.env.RAZORPAY_KEY_SECRET),
      RAZORPAY_WEBHOOK_SECRET: describe(process.env.RAZORPAY_WEBHOOK_SECRET),
      PRODUCT_PRICE_PAISE: process.env.PRODUCT_PRICE_PAISE || null,
      PRODUCT_CURRENCY: process.env.PRODUCT_CURRENCY || null,
    },
    delivery: {
      // Length and host only — never the URL, which is the paid deliverable.
      PRODUCT_DOWNLOAD_URL: describe(process.env.PRODUCT_DOWNLOAD_URL),
      ACCESS_TOKEN_SECRET: describe(process.env.ACCESS_TOKEN_SECRET),
    },
  });
}
