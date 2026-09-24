import "server-only";

/**
 * Post-payment fulfilment: the ONE place that delivers the product.
 *
 * ── WHY A SINGLE MODULE ───────────────────────────────────────────────────────
 * Two independent paths can reach a verified payment: the browser calling
 * /api/razorpay/verify, and Razorpay's webhook posting payment.captured when
 * the buyer closed the tab. If each sent its own email, a normal purchase
 * would deliver twice. Both call `fulfilOrder()` instead, so there is one
 * implementation and — critically — one idempotency key per payment.
 *
 * ── WHERE THE CUSTOMER'S EMAIL COMES FROM ─────────────────────────────────────
 * From the Razorpay ORDER, fetched server-side by order id. It is never taken
 * from the verify request body. If the browser could name the recipient after
 * payment, anyone who observed an order id could redirect somebody else's
 * purchase to their own inbox.
 */

import Razorpay from "razorpay";
import { serverConfig } from "./server-config";
import {
  sendEmail,
  deliveryEmail,
  purchaseNotificationEmail,
  idempotency,
  emailConfig,
  rupeeLabel,
  maskEmail,
  maskPhone,
  type SendResult,
} from "./email";

export interface CustomerFromOrder {
  email?: string;
  phone?: string;
}

export interface FulfilmentResult {
  /** True when the customer's delivery email was accepted by the provider. */
  delivered: boolean;
  /** The recipient, for the success screen. Masked in logs, not here. */
  customerEmail?: string;
  /** Why delivery did not happen. Never shown verbatim to the buyer. */
  reason?: string;
}

function razorpayClient(): Razorpay {
  return new Razorpay({
    key_id: serverConfig.razorpayKeyId,
    key_secret: serverConfig.razorpayKeySecret,
  });
}

/**
 * Reads the customer details we attached to the order at creation time.
 *
 * Razorpay notes are set server-side in /api/razorpay/create-order and are not
 * modifiable by the browser, which makes them a trustworthy record in a
 * project that has no database.
 */
export async function customerFromOrder(orderId: string): Promise<CustomerFromOrder> {
  try {
    const order = await razorpayClient().orders.fetch(orderId);
    const notes = (order?.notes || {}) as Record<string, unknown>;
    const email = typeof notes.customer_email === "string" ? notes.customer_email : undefined;
    const phone = typeof notes.customer_phone === "string" ? notes.customer_phone : undefined;
    return { email, phone };
  } catch (error) {
    console.error("[fulfilment] could not fetch order from Razorpay", {
      orderId,
      reason: error instanceof Error ? error.message : "unknown",
    });
    return {};
  }
}

/**
 * Confirms with Razorpay that this payment is real, belongs to this order, and
 * is for the amount we expect.
 *
 * The HMAC signature already proves the callback came from Razorpay. This adds
 * the facts the signature does not carry: that the payment is captured (not
 * merely authorised or failed) and that the amount matches server config, so a
 * payment created against some other order or amount cannot trigger delivery.
 */
export async function verifyPaymentWithRazorpay(
  orderId: string,
  paymentId: string
): Promise<{ ok: boolean; reason?: string; amount?: number; currency?: string; status?: string }> {
  try {
    const payment = await razorpayClient().payments.fetch(paymentId);

    if (!payment) return { ok: false, reason: "payment_not_found" };
    if (payment.order_id !== orderId) {
      console.error("[fulfilment] payment/order mismatch", { orderId, paymentId });
      return { ok: false, reason: "order_mismatch" };
    }

    const amount = typeof payment.amount === "string" ? Number(payment.amount) : payment.amount;
    if (amount !== serverConfig.pricePaise) {
      console.error("[fulfilment] amount mismatch", {
        orderId,
        expected: serverConfig.pricePaise,
        actual: amount,
      });
      return { ok: false, reason: "amount_mismatch", amount, status: payment.status };
    }

    if (String(payment.currency).toUpperCase() !== serverConfig.currency.toUpperCase()) {
      return { ok: false, reason: "currency_mismatch", currency: String(payment.currency) };
    }

    // "captured" is settled money. "authorised" is a hold that may still be
    // voided, so it must not trigger delivery of a non-revocable digital good.
    if (payment.status !== "captured") {
      return { ok: false, reason: `status_${payment.status}`, status: payment.status };
    }

    return { ok: true, amount, currency: String(payment.currency), status: payment.status };
  } catch (error) {
    console.error("[fulfilment] payment fetch failed", {
      paymentId,
      reason: error instanceof Error ? error.message : "unknown",
    });
    return { ok: false, reason: "fetch_failed" };
  }
}

/**
 * Delivers the product and notifies support. Safe to call repeatedly.
 *
 * Both sends carry a deterministic `Idempotency-Key` derived from the payment
 * id, so Resend collapses retries within its 24-hour window to a single
 * delivered message. The two keys differ, so suppressing one never suppresses
 * the other.
 *
 * NEVER throws: the caller is always past the point where money changed hands.
 */
export async function fulfilOrder(args: {
  orderId: string;
  paymentId: string;
  /** Pass when already fetched, to avoid a second Razorpay round trip. */
  customer?: CustomerFromOrder;
  source: "verify" | "webhook";
}): Promise<FulfilmentResult> {
  const customer = args.customer ?? (await customerFromOrder(args.orderId));

  if (!emailConfig.isConfigured) {
    console.warn("[fulfilment] email not configured; cannot deliver", {
      orderId: args.orderId,
      source: args.source,
    });
    return { delivered: false, customerEmail: customer.email, reason: "email_not_configured" };
  }

  if (!customer.email) {
    // The buyer paid but we have no address — recoverable only by a human, so
    // make sure support hears about it.
    console.error("[fulfilment] no customer email on order; cannot deliver", {
      orderId: args.orderId,
      paymentId: args.paymentId,
      source: args.source,
    });
    await notifySupport({ ...args, customer, deliveryStatus: "FAILED — no email on order" });
    return { delivered: false, reason: "no_customer_email" };
  }

  let delivery: SendResult;
  try {
    const template = deliveryEmail(serverConfig.productDownloadUrl);
    delivery = await sendEmail({
      to: customer.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      replyTo: emailConfig.supportEmail,
      idempotencyKey: idempotency.delivery(args.paymentId),
    });
  } catch (error) {
    // sendEmail does not throw, but productDownloadUrl can if unset.
    console.error("[fulfilment] delivery threw", {
      orderId: args.orderId,
      reason: error instanceof Error ? error.message : "unknown",
    });
    delivery = { ok: false, error: "delivery_exception" };
  }

  if (delivery.ok) {
    console.info("[fulfilment] delivered", {
      orderId: args.orderId,
      paymentId: args.paymentId,
      to: maskEmail(customer.email),
      source: args.source,
    });
  } else {
    console.error("[fulfilment] DELIVERY FAILED — customer paid but has no email", {
      orderId: args.orderId,
      paymentId: args.paymentId,
      to: maskEmail(customer.email),
      reason: delivery.error,
      source: args.source,
    });
  }

  await notifySupport({
    ...args,
    customer,
    deliveryStatus: delivery.ok
      ? "Sent"
      : `FAILED (${delivery.error || "unknown"}) — resend manually`,
  });

  return {
    delivered: delivery.ok,
    customerEmail: customer.email,
    reason: delivery.ok ? undefined : delivery.error,
  };
}

/** Support notification for a verified purchase. Failures here are logged only. */
async function notifySupport(args: {
  orderId: string;
  paymentId: string;
  customer: CustomerFromOrder;
  deliveryStatus: string;
}): Promise<void> {
  try {
    const template = purchaseNotificationEmail({
      email: args.customer.email || "(not captured)",
      phone: args.customer.phone || "(not captured)",
      orderId: args.orderId,
      paymentId: args.paymentId,
      amountLabel: rupeeLabel(serverConfig.pricePaise),
      status: "Payment verified",
      deliveryStatus: args.deliveryStatus,
      timestamp: new Date().toISOString(),
    });

    const result = await sendEmail({
      to: emailConfig.supportEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      replyTo: args.customer.email,
      idempotencyKey: idempotency.purchaseNotification(args.paymentId),
    });

    if (!result.ok && !result.skipped) {
      console.error("[fulfilment] support notification failed", {
        orderId: args.orderId,
        reason: result.error,
      });
    }
  } catch (error) {
    console.error("[fulfilment] support notification threw", {
      orderId: args.orderId,
      reason: error instanceof Error ? error.message : "unknown",
    });
  }
}

export { maskEmail, maskPhone };
