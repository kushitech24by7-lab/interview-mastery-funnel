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

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
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
