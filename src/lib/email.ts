import "server-only";

/**
 * Transactional email (Resend), server-only.
 *
 * ── WHY RESEND, AND WHY NO SDK ────────────────────────────────────────────────
 * The project had no email provider. Resend was chosen because it supports a
 * native `Idempotency-Key` header, which is the only thing that makes
 * exactly-once delivery achievable on this stack: there is no database, and
 * Vercel functions are ephemeral, so in-memory or storage-based deduplication
 * cannot be trusted across instances or retries.
 *
 * It is called over plain `fetch` rather than the `resend` npm package. The
 * REST call is a dozen lines, it adds no dependency to a funnel that currently
 * ships five, and it lets the idempotency header be set explicitly rather than
 * hoping a wrapper forwards it.
 *
 * ── WHAT NEVER LEAVES THE SERVER ──────────────────────────────────────────────
 * `server-only` above makes the build fail if a client component imports this.
 * RESEND_API_KEY and the product delivery URL are read here and nowhere else.
 */

import { serverConfig } from "./server-config";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export interface SendResult {
  ok: boolean;
  id?: string;
  /** Provider HTTP status, for diagnostics. */
  status?: number;
  /** Safe to log: contains no API key and no message body. */
  error?: string;
  /** True when email is not configured at all, as opposed to a send failure. */
  skipped?: boolean;
}

export const emailConfig = {
  get apiKey() {
    return process.env.RESEND_API_KEY || "";
  },
  /**
   * Must be an address on a domain verified in Resend. Until the domain is
   * verified, Resend only accepts sends to the account owner's own address.
   */
  get from() {
    return process.env.EMAIL_FROM || "";
  },
  get supportEmail() {
    return process.env.SUPPORT_EMAIL || "support@interviewmastery.shop";
  },
  get isConfigured() {
    return Boolean(this.apiKey && this.from);
  },
};

/** Escapes text before it is interpolated into an HTML email body. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Partially masks an address for logging.
 *
 * Production logs are widely readable and are retained; full customer
 * addresses do not belong in them. This keeps enough to correlate a support
 * ticket without writing the PII down.
 */
export function maskEmail(email: string): string {
  const at = email.lastIndexOf("@");
  if (at < 1) return "***";
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const head = local.slice(0, Math.min(2, local.length));
  return `${head}${"*".repeat(Math.max(1, local.length - head.length))}@${domain}`;
}

/** Masks a phone number the same way, keeping only the last 4 digits. */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length <= 4 ? "***" : `***${digits.slice(-4)}`;
}

interface SendArgs {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  /**
   * Deterministic key derived from the Razorpay payment id. Resend deduplicates
   * on this for 24 hours, so a retried verify call, a webhook retry and a
   * refreshed success page all collapse to one delivered email.
   */
  idempotencyKey?: string;
  replyTo?: string;
}

/**
 * Sends one email. NEVER throws.
 *
 * Every caller is on a payment path where the customer has already been
 * charged, so a mail failure must not become a payment failure. Callers get a
 * result object and decide what to show; the money is never in question.
 */
export async function sendEmail(args: SendArgs): Promise<SendResult> {
  if (!emailConfig.isConfigured) {
    /*
     * This is an ERROR, not a warning.
     *
     * It fired as console.warn before, which is why the missing configuration
     * went unnoticed in production: a warning in a Vercel function log looks
     * like noise, while buyers were paying and receiving nothing. Anything
     * that silently stops a paid product reaching its buyer deserves the
     * loudest level available and a message that names the fix.
     */
    console.error(
      "[email] NOT CONFIGURED — no email was sent. " +
        `RESEND_API_KEY ${process.env.RESEND_API_KEY ? "set" : "MISSING"}, ` +
        `EMAIL_FROM ${process.env.EMAIL_FROM ? "set" : "MISSING"}. ` +
        "Set both in Vercel → Settings → Environment Variables and redeploy."
    );
    return { ok: false, skipped: true, error: "email_not_configured" };
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${emailConfig.apiKey}`,
    "Content-Type": "application/json",
  };
  if (args.idempotencyKey) {
    // Resend caps this at 256 chars; our keys are far shorter.
    headers["Idempotency-Key"] = args.idempotencyKey.slice(0, 256);
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        from: emailConfig.from,
        to: Array.isArray(args.to) ? args.to : [args.to],
        subject: args.subject,
        html: args.html,
        text: args.text,
        ...(args.replyTo ? { reply_to: args.replyTo } : {}),
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { id?: string; message?: string; name?: string }
      | null;

    if (!response.ok) {
      /*
       * Provider diagnostics, safe to log: HTTP status, Resend's error `name`
       * and its human-readable message. Never the API key, the recipient or
       * the message body.
       *
       * The common failures each have a distinct signature here:
       *   403 + "domain is not verified"  → DNS not finished in Resend
       *   401 / "API key is invalid"      → wrong or rotated RESEND_API_KEY
       *   422 + "Invalid `from`"          → EMAIL_FROM not on a verified domain
       */
      const reason = payload?.message || payload?.name || `http_${response.status}`;
      console.error("[email] PROVIDER REJECTED SEND", {
        status: response.status,
        errorType: payload?.name || null,
        message: reason,
      });
      return { ok: false, error: reason, status: response.status };
    }

    console.info("[email] provider accepted", { messageId: payload?.id || null });
    return { ok: true, id: payload?.id };
  } catch (error) {
    console.error("[email] send threw", {
      reason: error instanceof Error ? error.message : "unknown",
    });
    return { ok: false, error: "network_error" };
  }
}

/* ────────────────────────────────────────────────────────────────────────────
 * Templates
 * ──────────────────────────────────────────────────────────────────────────── */

const BRAND = "Interview Mastery";
const PRODUCT = "Complete Interview Mastery";

function layout(bodyHtml: string): string {
  // Table-based and inline-styled: Gmail and Outlook strip <style> blocks.
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0b1424;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ef;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e6e2db;">
<tr><td style="background:#0b1424;padding:20px 28px;">
<span style="color:#ffffff;font-size:17px;font-weight:700;letter-spacing:.3px;">${BRAND}</span>
</td></tr>
<tr><td style="padding:28px;font-size:15px;line-height:1.65;">${bodyHtml}</td></tr>
<tr><td style="padding:16px 28px;background:#faf8f5;border-top:1px solid #e6e2db;font-size:12px;color:#6b7280;">
${BRAND} · <a href="mailto:${escapeHtml(emailConfig.supportEmail)}" style="color:#0f766e;">${escapeHtml(emailConfig.supportEmail)}</a>
</td></tr>
</table></td></tr></table></body></html>`;
}

/**
 * The delivery email — the thing the customer actually paid for.
 *
 * The Drive URL is passed in by the caller from server config. It is never
 * imported into any client component, never returned by an API route, and
 * never placed in a query string.
 */
export function deliveryEmail(deliveryUrl: string): { subject: string; html: string; text: string } {
  const safeUrl = escapeHtml(deliveryUrl);
  const support = escapeHtml(emailConfig.supportEmail);

  /*
   * Deliberately plain HTML: tables, inline styles, no web fonts, no images,
   * no background images, no media queries beyond what a single-column layout
   * needs. Gmail strips <style> blocks, Outlook ignores flexbox, and image-
   * heavy transactional mail is more likely to be classified as promotional —
   * which for a delivery email means the buyer never finds it.
   *
   * The link appears TWICE on purpose: as a button, and as visible text
   * underneath, so the email still works when images or buttons are blocked.
   */
  const proof = [
    "12 resources",
    "619 pages",
    "500 interview questions",
    "100 STAR examples",
    "14 answer frameworks",
    "30 spoken practice drills",
    "30 templates &amp; trackers",
  ];

  return {
    subject: `Your ${PRODUCT} Access`,
    html: layout(`
<p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#0f766e;letter-spacing:.6px;">PAYMENT CONFIRMED</p>
<p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#0b1424;">${PRODUCT}</p>
<p style="margin:0 0 20px;">Thank you for your purchase. Your complete interview preparation bundle is ready.</p>
<p style="margin:0 0 22px;">
  <a href="${safeUrl}" style="display:inline-block;background:#f0b429;color:#0b1424;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:8px;">Access your interview bundle</a>
</p>
<p style="margin:0 0 20px;font-size:13px;color:#6b7280;word-break:break-all;">
  If the button does not work, open this link:<br>
  <a href="${safeUrl}" style="color:#0f766e;">${safeUrl}</a>
</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#faf8f5;border-radius:8px;margin:0 0 20px;">
  <tr><td style="padding:14px 16px;font-size:13px;color:#4b5563;line-height:1.8;">
    ${proof.join(' &nbsp;&middot;&nbsp; ')}
  </td></tr>
</table>
<p style="margin:0 0 14px;">Save this email so you can return to your resources later.</p>
<p style="margin:0;">Need help? <a href="mailto:${support}" style="color:#0f766e;">${support}</a></p>
<p style="margin:18px 0 0;">Best,<br>${BRAND}</p>`),
    text: [
      "PAYMENT CONFIRMED",
      "",
      PRODUCT,
      "",
      "Thank you for your purchase. Your complete interview preparation bundle is ready.",
      "",
      "Access your bundle:",
      deliveryUrl,
      "",
      "12 resources · 619 pages · 500 interview questions · 100 STAR examples",
      "14 answer frameworks · 30 spoken practice drills · 30 templates & trackers",
      "",
      "Save this email so you can return to your resources later.",
      "",
      `Need help? ${emailConfig.supportEmail}`,
      "",
      "Best,",
      BRAND,
    ].join("\n"),
  };
}

interface OrderFacts {
  email: string;
  phone: string;
  orderId: string;
  paymentId?: string;
  amountLabel: string;
  status: string;
  timestamp: string;
  deliveryStatus?: string;
}

function factsTable(facts: OrderFacts): string {
  const rows: [string, string | undefined][] = [
    ["Email", facts.email],
    ["Mobile", facts.phone],
    ["Product", PRODUCT],
    ["Amount", facts.amountLabel],
    ["Razorpay Order ID", facts.orderId],
    ["Razorpay Payment ID", facts.paymentId],
    ["Status", facts.status],
    ["Delivery email", facts.deliveryStatus],
    ["Date/Time", facts.timestamp],
  ];
  return rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#6b7280;white-space:nowrap;">${escapeHtml(k)}</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(String(v))}</td></tr>`
    )
    .join("");
}

function factsText(facts: OrderFacts): string {
  return [
    `Email: ${facts.email}`,
    `Mobile: ${facts.phone}`,
    `Product: ${PRODUCT}`,
    `Amount: ${facts.amountLabel}`,
    `Razorpay Order ID: ${facts.orderId}`,
    facts.paymentId ? `Razorpay Payment ID: ${facts.paymentId}` : "",
    `Status: ${facts.status}`,
    facts.deliveryStatus ? `Delivery email: ${facts.deliveryStatus}` : "",
    `Date/Time: ${facts.timestamp}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Internal notification when a buyer starts checkout. Contains no secrets. */
export function checkoutStartedEmail(facts: OrderFacts) {
  return {
    subject: `New ${PRODUCT} Checkout Started`,
    html: layout(
      `<p style="margin:0 0 14px;font-weight:700;">A customer has started checkout.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;">${factsTable(facts)}</table>
<p style="margin:18px 0 0;font-size:13px;color:#6b7280;">This is not a confirmed payment. A separate notification is sent once payment is verified.</p>`
    ),
    text: `A customer has started checkout.\n\n${factsText(facts)}\n\nThis is not a confirmed payment.`,
  };
}

/** Internal notification after a VERIFIED payment. Contains no secrets. */
export function purchaseNotificationEmail(facts: OrderFacts) {
  return {
    subject: `New ${PRODUCT} Purchase — ${facts.amountLabel}`,
    html: layout(
      `<p style="margin:0 0 14px;font-weight:700;">Payment verified.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;">${factsTable(facts)}</table>`
    ),
    text: `Payment verified.\n\n${factsText(facts)}`,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Idempotency keys
 *
 * Both are derived from the Razorpay PAYMENT id, which is unique per
 * transaction and identical across every retry path (verify call, webhook
 * retry, success-page refresh). They are deliberately DIFFERENT strings, so
 * suppressing a duplicate customer email never suppresses the support
 * notification, or vice versa.
 * ──────────────────────────────────────────────────────────────────────────── */

export const idempotency = {
  delivery: (paymentId: string) => `interview-mastery-delivery-${paymentId}`,
  purchaseNotification: (paymentId: string) => `interview-mastery-purchase-notification-${paymentId}`,
  checkoutStarted: (orderId: string) => `interview-mastery-checkout-started-${orderId}`,
};

/** Rupee label from paise, e.g. 69900 → "₹699". */
export function rupeeLabel(paise: number): string {
  const rupees = paise / 100;
  return `₹${Number.isInteger(rupees) ? rupees : rupees.toFixed(2)}`;
}

/** The delivery URL, read from server config only. */
export function deliveryUrl(): string {
  return serverConfig.productDownloadUrl;
}
