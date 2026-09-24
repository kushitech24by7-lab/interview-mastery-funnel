import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { serverConfig } from "@/lib/server-config";
import { store } from "@/lib/order-store";
import { fulfilOrder } from "@/lib/fulfilment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Razorpay webhook — the safety net behind the buyer-facing flow.
 *
 * WHY THIS EXISTS: the browser-based verify call fails if the buyer closes the
 * tab, loses signal on a train, or their phone kills the browser right after
 * paying. Razorpay still posts `payment.captured` here, so the order is marked
 * paid server-side regardless of what the buyer's device did. This is what
 * makes "what if I pay and don't get access?" (brief §6) an answerable question
 * rather than a support nightmare.
 *
 * Configure in Razorpay Dashboard → Settings → Webhooks:
 *   URL:    https://interviewmastery.shop/api/razorpay/webhook
 *   Events: payment.captured, payment.failed
 *   Secret: must equal RAZORPAY_WEBHOOK_SECRET
 *
 * The URL must include the trailing `/webhook` segment. Registering
 * `…/api/razorpay/` instead yields a 308 redirect, which Razorpay treats as a
 * failed delivery — this route never runs and the safety net above is silently
 * dead. See DEPLOYMENT.md §4 for how to verify the registered URL.
 *
 * Signature scheme: HMAC_SHA256(raw_request_body, webhook_secret), compared
 * against the `x-razorpay-signature` header. The RAW body must be used — do not
 * re-serialise the parsed JSON, or the signature will never match.
 */

export async function POST(request: Request) {
  const secret = serverConfig.razorpayWebhookSecret;
  if (!secret) {
    console.error("[webhook] RAZORPAY_WEBHOOK_SECRET is not set; rejecting.");
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 503 });
  }

  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const rawBody = await request.text();
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const receivedBuf = Buffer.from(signature, "utf8");
  const valid =
    expectedBuf.length === receivedBuf.length && crypto.timingSafeEqual(expectedBuf, receivedBuf);

  if (!valid) {
    console.error("[webhook] signature mismatch — ignoring payload.");
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string; error_description?: string } } };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const payment = event.payload?.payment?.entity;
  const orderId = payment?.order_id;
  const paymentId = payment?.id;

  if (!orderId || !paymentId) {
    // Acknowledge unrelated events so Razorpay stops retrying them.
    return NextResponse.json({ received: true });
  }

  if (event.event === "payment.captured") {
    await store.markPaid(orderId, paymentId);
    console.info("[webhook] payment captured", { orderId, paymentId });

    /*
     * Deliver from here too — this is the whole point of the webhook. If the
     * buyer closed the tab before /api/razorpay/verify ran, this is the only
     * path that reaches them.
     *
     * It is SAFE to call alongside the verify route because fulfilOrder keys
     * both sends on the Razorpay payment id, and Resend deduplicates on that
     * key. The normal case (verify succeeds, then the webhook arrives) sends
     * one email, not two.
     *
     * Not awaited into the response body: Razorpay needs a prompt 200 or it
     * retries, and a mail failure must not turn into a webhook retry storm.
     */
    try {
      await fulfilOrder({ orderId, paymentId, source: "webhook" });
    } catch (error) {
      console.error("[webhook] fulfilment threw", {
        orderId,
        reason: error instanceof Error ? error.message : "unknown",
      });
    }
  } else if (event.event === "payment.failed") {
    await store.markFailed(orderId, payment?.error_description || "payment_failed");
    console.info("[webhook] payment failed", { orderId, paymentId });
  }

  // Always 200 on a validated event, or Razorpay will keep retrying.
  return NextResponse.json({ received: true });
}
