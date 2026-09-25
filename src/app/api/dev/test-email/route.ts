import { NextResponse } from "next/server";
import { sendEmail, emailConfig, deliveryEmail, maskEmail } from "@/lib/email";
import { serverConfig } from "@/lib/server-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Development-only transactional email test.
 *
 * ── WHY THIS EXISTS ───────────────────────────────────────────────────────────
 * When a buyer does not receive their product it is not obvious whether the
 * fault is the mail provider, the sender domain, the Razorpay integration or
 * the fulfilment code. This route exercises the mail path ALONE — same
 * provider, same API key, same sender, same sendEmail() — so the provider can
 * be proven working or broken before anyone debugs payments.
 *
 * ── WHY IT IS SAFE ────────────────────────────────────────────────────────────
 * Three independent locks, because an unauthenticated "send mail" endpoint on
 * a production host is an open relay for spammers and a way to burn a sending
 * reputation that is very hard to rebuild:
 *
 *   1. Refuses to run on a real deployment (VERCEL_ENV / DEPLOY_ENV set).
 *   2. Requires DIAGNOSTICS_TOKEN, and 404s without it — so it does not exist
 *      unless an operator opted in.
 *   3. Sends ONLY to DEV_TEST_EMAIL from the environment. The recipient can
 *      never be supplied by the caller, so this cannot be pointed at a
 *      stranger's inbox.
 *
 * Usage:
 *   curl -X POST "http://localhost:3000/api/dev/test-email" \
 *     -H "x-diagnostics-token: $DIAGNOSTICS_TOKEN"
 *
 *   ?template=delivery  sends the real product email instead of a plain test,
 *                       to confirm the actual customer template renders and is
 *                       accepted by the provider.
 */

export async function POST(request: Request) {
  // Lock 1 — never on a real deployment.
  const isRealDeployment =
    Boolean(process.env.VERCEL_ENV) || process.env.DEPLOY_ENV === "production";
  if (isRealDeployment) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Lock 2 — must be explicitly enabled.
  const expected = process.env.DIAGNOSTICS_TOKEN;
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

  // Lock 3 — the recipient comes from config, never from the request.
  const to = process.env.DEV_TEST_EMAIL;
  if (!to) {
    return NextResponse.json(
      {
        ok: false,
        error: "DEV_TEST_EMAIL_not_set",
        message:
          "Set DEV_TEST_EMAIL in .env.local to the inbox that should receive the test. " +
          "The recipient is deliberately not accepted from the request.",
      },
      { status: 400 }
    );
  }

  if (!emailConfig.isConfigured) {
    return NextResponse.json(
      {
        ok: false,
        error: "email_not_configured",
        detail: {
          RESEND_API_KEY: process.env.RESEND_API_KEY ? "present" : "MISSING",
          EMAIL_FROM: process.env.EMAIL_FROM ? "present" : "MISSING",
        },
      },
      { status: 400 }
    );
  }

  const useDeliveryTemplate =
    new URL(request.url).searchParams.get("template") === "delivery";

  let subject: string;
  let html: string;
  let text: string;

  if (useDeliveryTemplate) {
    let url: string;
    try {
      url = serverConfig.productDownloadUrl;
    } catch {
      return NextResponse.json(
        { ok: false, error: "PRODUCT_DOWNLOAD_URL_not_set" },
        { status: 400 }
      );
    }
    const template = deliveryEmail(url);
    ({ subject, html, text } = template);
  } else {
    subject = "Interview Mastery Email Test";
    text = "Transactional email is working.";
    html = "<p>Transactional email is working.</p>";
  }

  const startedAt = Date.now();
  console.info("[dev/test-email] sending", {
    to: maskEmail(to),
    template: useDeliveryTemplate ? "delivery" : "plain",
  });

  const result = await sendEmail({ to, subject, html, text });
  const elapsedMs = Date.now() - startedAt;

  /*
   * Report BOTH outcomes explicitly. A 200 with ok:false is deliberate — the
   * request reached the provider and the provider answered; that is a
   * different situation from this route failing, and conflating them is how
   * "no exception was thrown" gets mistaken for "the email was sent".
   */
  if (!result.ok) {
    console.error("[dev/test-email] provider failure", {
      status: result.status ?? null,
      error: result.error,
      elapsedMs,
    });
    return NextResponse.json({
      ok: false,
      reachedProvider: !result.skipped,
      providerStatus: result.status ?? null,
      providerError: result.error,
      from: process.env.EMAIL_FROM,
      to: maskEmail(to),
      elapsedMs,
    });
  }

  console.info("[dev/test-email] provider accepted", {
    messageId: result.id,
    elapsedMs,
  });
  return NextResponse.json({
    ok: true,
    reachedProvider: true,
    messageId: result.id,
    from: process.env.EMAIL_FROM,
    to: maskEmail(to),
    elapsedMs,
  });
}
