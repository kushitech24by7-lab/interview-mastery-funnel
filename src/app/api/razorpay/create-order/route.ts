import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { serverConfig } from "@/lib/server-config";
import { store } from "@/lib/order-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * STEP 2–3 of the payment flow (brief §33): the frontend asks the backend to
 * create an order; the backend creates it with Razorpay.
 *
 * CRITICAL: the amount is read from server configuration, never from the
 * request body. If the browser could send the amount, a visitor could edit it
 * to ₹1 in devtools and legitimately pay that amount.
 */

interface CreateOrderBody {
  name?: string;
  email?: string;
  phone?: string;
  attribution?: Record<string, string>;
}

// Very small in-process rate limit to blunt trivial order-spam.
// Replace with a shared limiter (Upstash/Redis) in production.
const recentByIp = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

/** Razorpay's documented minimum order amount: 100 paise (₹1). */
const MIN_AMOUNT_PAISE = 100;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (recentByIp.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  hits.push(now);
  recentByIp.set(ip, hits);
  return hits.length > RATE_LIMIT_MAX;
}

function sanitise(value: unknown, max = 120): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, max);
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function POST(request: Request) {
  try {
    if (!serverConfig.isConfigured) {
      return NextResponse.json(
        {
          error: "payment_not_configured",
          message:
            "Payments are not configured on this deployment. Set the Razorpay environment variables — see DEPLOYMENT.md.",
        },
        { status: 503 }
      );
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (rateLimited(ip)) {
      return NextResponse.json(
        { error: "rate_limited", message: "Too many attempts. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    let body: CreateOrderBody = {};
    try {
      body = (await request.json()) as CreateOrderBody;
    } catch {
      body = {};
    }

    const amount = serverConfig.pricePaise; // server-authoritative
    const currency = serverConfig.currency;

    // Razorpay rejects anything below 100 paise (₹1). Catching it here gives a
    // clear operator-facing error instead of an opaque gateway rejection that
    // the buyer would see as a generic "could not start payment".
    if (amount < MIN_AMOUNT_PAISE) {
      console.error(
        `[create-order] PRODUCT_PRICE_PAISE is ${amount}, below Razorpay's ${MIN_AMOUNT_PAISE} paise minimum.`
      );
      return NextResponse.json(
        {
          error: "invalid_amount",
          message:
            "Checkout is misconfigured and cannot accept payments right now. Please contact support.",
        },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: serverConfig.razorpayKeyId,
      key_secret: serverConfig.razorpayKeySecret,
    });

    // Razorpay notes: max 15 keys, values must be strings and are capped at 256 chars.
    const attribution = body.attribution || {};
    const notes: Record<string, string> = {
      product: "complete-interview-mastery",
    };
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"]) {
      const value = sanitise(attribution[key], 200);
      if (value) notes[key] = value;
    }

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `cim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      notes,
    });

    await store.create({
      orderId: order.id,
      amount,
      currency,
      status: "created",
      createdAt: new Date().toISOString(),
      customerEmail: sanitise(body.email),
      customerName: sanitise(body.name),
      customerPhone: sanitise(body.phone, 20),
      attribution: attribution as never,
      notes,
    });

    // Only non-sensitive fields are returned to the browser.
    return NextResponse.json({
      orderId: order.id,
      amount,
      currency,
      keyId: serverConfig.razorpayKeyId, // public key — safe to expose
      // Lets the UI show an unmistakable "TEST MODE" badge, so nobody mistakes
      // a test transaction for a real one (or vice versa) during a launch.
      mode: serverConfig.razorpayMode,
    });
  } catch (error) {
    console.error("[create-order] failed:", error);

    // Razorpay returns 401 when the key id/secret pair is wrong, revoked, or a
    // test key is used against live mode. This is by far the most common setup
    // error, so it gets its own branch — a generic 500 sends the operator
    // hunting through application code when the fix is an env var.
    const status = (error as { statusCode?: number })?.statusCode;
    if (status === 401) {
      console.error(
        "[create-order] Razorpay authentication failed. Check RAZORPAY_KEY_ID / " +
          "RAZORPAY_KEY_SECRET, and that both belong to the same (test or live) mode."
      );
      return NextResponse.json(
        {
          error: "payment_auth_failed",
          message:
            "We could not reach the payment gateway. No amount has been charged. Please try again shortly or contact support.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "order_creation_failed",
        message: "We could not start the payment. Please try again, or contact support if it persists.",
      },
      { status: 500 }
    );
  }
}
