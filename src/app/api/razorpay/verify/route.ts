import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { serverConfig, ACCESS_COOKIE, ACCESS_TOKEN_TTL_SECONDS } from "@/lib/server-config";
import { store, STORE_IS_EPHEMERAL } from "@/lib/order-store";
import { createAccessToken } from "@/lib/access-token";

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

    await store.markPaid(orderId, paymentId);

    const token = createAccessToken(orderId, paymentId);

    const cookieStore = await cookies();
    cookieStore.set(ACCESS_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TOKEN_TTL_SECONDS,
    });

    return NextResponse.json({
      verified: true,
      orderId,
      paymentId,
      amount: record?.amount ?? serverConfig.pricePaise,
      currency: record?.currency ?? serverConfig.currency,
      // NOTE: no download URL here — see /api/access.
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
