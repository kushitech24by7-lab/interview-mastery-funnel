import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { serverConfig, ACCESS_COOKIE, ACCESS_TOKEN_TTL_SECONDS } from "@/lib/server-config";
import { store, STORE_IS_EPHEMERAL } from "@/lib/order-store";
import { createAccessToken } from "@/lib/access-token";
import {
  customerFromOrder,
  fulfilOrder,
  verifyPaymentWithRazorpay,
} from "@/lib/fulfilment";
import { maskEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * STEP 6–9 of the payment flow (brief §33).
 *
 * This is the ONLY place a payment becomes "paid". The browser cannot mark
 * itself as paid: it can only hand over the three identifiers Razorpay gave it,
 * and this route recomputes the HMAC signature using the key secret that lives
 * exclusively on the server.
 *
 * The response deliberately does NOT contain the Google Drive URL. It returns a
 * signed access token; the delivery URL is fetched separately by /api/access,
 * which re-validates that token. This keeps the deliverable out of any response
 * that a casual attacker might replay.
 */

interface VerifyBody {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

export async function POST(request: Request) {
  try {
    if (!serverConfig.isConfigured) {
      return NextResponse.json(
        { error: "payment_not_configured", message: "Payments are not configured on this deployment." },
        { status: 503 }
      );
    }

    console.info("[Payment] verification started");
    const body = (await request.json()) as VerifyBody;
    const orderId = body.razorpay_order_id;
    const paymentId = body.razorpay_payment_id;
    const signature = body.razorpay_signature;

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "missing_fields", message: "Incomplete payment details received." },
        { status: 400 }
      );
    }

    // Razorpay's documented signature: HMAC_SHA256(order_id + "|" + payment_id, key_secret)
    const expected = crypto
      .createHmac("sha256", serverConfig.razorpayKeySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const expectedBuf = Buffer.from(expected, "utf8");
    const receivedBuf = Buffer.from(signature, "utf8");

    const signatureValid =
      expectedBuf.length === receivedBuf.length && crypto.timingSafeEqual(expectedBuf, receivedBuf);

    if (!signatureValid) {
      console.error("[verify] SIGNATURE MISMATCH", { orderId, paymentId });
      await store.markFailed(orderId, "signature_mismatch");
      return NextResponse.json(
        {
          error: "verification_failed",
          message:
            "We could not verify this payment. If money has left your account, please contact support with your payment ID and we will sort it out.",
          paymentId,
        },
        { status: 400 }
      );
    }

    console.info("[Payment] signature valid", { orderId, paymentId });

    const record = await store.get(orderId);

    if (!record && !STORE_IS_EPHEMERAL) {
      // With a real database, a missing record means the order id was never issued here.
      console.error("[verify] unknown order id", { orderId });
      return NextResponse.json(
        { error: "unknown_order", message: "This order was not recognised. Please contact support." },
        { status: 404 }
      );
    }

    if (!record) {
      // In-memory store lost the record (cold start). The signature is still
      // cryptographic proof of payment, so we honour it — but log loudly.
      console.warn(
        "[verify] order record missing from ephemeral store; honouring valid signature.",
        { orderId, paymentId }
      );
    }

    /*
     * SECOND CHECK, AGAINST RAZORPAY ITSELF.
     *
     * The HMAC above proves the callback really came from Razorpay. It does
     * NOT prove the payment succeeded, that it belongs to this order, or that
     * it was for the right amount. Fetching the payment server-side confirms
     * all three before anything irreversible (delivering a digital product)
     * happens. An "authorised but not captured" payment is a hold that can
     * still be voided, so it does not qualify.
     */
    const gateway = await verifyPaymentWithRazorpay(orderId, paymentId);
    if (!gateway.ok) {
      console.error("[verify] gateway verification failed", {
        orderId,
        paymentId,
        reason: gateway.reason,
      });
      await store.markFailed(orderId, gateway.reason || "gateway_verification_failed");
      return NextResponse.json(
        {
          error: "verification_failed",
          message:
            "We could not confirm this payment with the payment gateway. If money has left your account, please contact support with your payment ID.",
          paymentId,
        },
        { status: 400 }
      );
    }

    await store.markPaid(orderId, paymentId);

    /*
     * FULFILMENT.
     *
     * The recipient comes from the Razorpay ORDER, fetched server-side — never
     * from this request body. If the browser could name the address after
     * payment, anyone who learned an order id could redirect somebody else's
     * purchase to their own inbox.
     *
     * Delivery is idempotent on the payment id, so a retried verify call, a
     * webhook retry or a refreshed success page all collapse to one email.
     */
    console.info("[Payment] gateway confirmed", {
      orderId,
      paymentId,
      status: gateway.status ?? null,
      amount: gateway.amount ?? null,
    });

    const customer = await customerFromOrder(orderId);
    console.info("[Payment] Razorpay order retrieved", {
      orderId,
      // Presence, not the address itself — production logs are widely readable.
      customerEmailFound: Boolean(customer.email),
    });
    const fulfilment = await fulfilOrder({
      orderId,
      paymentId,
      customer,
      source: "verify",
    });

    const token = createAccessToken(orderId, paymentId, {
      email: fulfilment.customerEmail,
      delivered: fulfilment.delivered,
    });

    const cookieStore = await cookies();
    cookieStore.set(ACCESS_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TOKEN_TTL_SECONDS,
    });

    console.info("[verify] payment verified", {
      orderId,
      paymentId,
      delivered: fulfilment.delivered,
      customer: fulfilment.customerEmail ? maskEmail(fulfilment.customerEmail) : "(unknown)",
    });

    return NextResponse.json({
      verified: true,
      orderId,
      paymentId,
      amount: gateway.amount ?? record?.amount ?? serverConfig.pricePaise,
      currency: gateway.currency ?? record?.currency ?? serverConfig.currency,
      /*
       * Payment success and email success are DIFFERENT states. The payment is
       * verified either way; `delivered` only tells the success screen whether
       * to say "sent to X" or "we are still sending it". The buyer must never
       * be told a verified payment failed because a mail provider blipped.
       *
       * The recipient is echoed so the success screen can show which inbox to
       * check. It is the server's trusted value, not the browser's.
       */
      delivered: fulfilment.delivered,
      customerEmail: fulfilment.customerEmail,
      // NOTE: no download URL here — the product is delivered by email.
    });
  } catch (error) {
    console.error("[verify] error:", error);
    return NextResponse.json(
      {
        error: "verification_error",
        message:
          "Something went wrong while verifying your payment. Please contact support with your payment ID.",
      },
      { status: 500 }
    );
  }
}
