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
    });
  } catch (error) {
    console.error("[create-order] failed:", error);
    return NextResponse.json(
      {
        error: "order_creation_failed",
        message: "We could not start the payment. Please try again, or contact support if it persists.",
      },
      { status: 500 }
    );
  }
}
