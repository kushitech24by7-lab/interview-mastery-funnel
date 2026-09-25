import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_COOKIE, serverConfig } from "@/lib/server-config";
import { verifyAccessToken } from "@/lib/access-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The bundle CTA target (brief Part 15).
 *
 * The thank-you page's "Open your bundle" button points HERE, not at Google
 * Drive. This route re-verifies the signed purchase cookie server-side and
 * only then issues a 302 to PRODUCT_DOWNLOAD_URL.
 *
 * ── WHY NOT JUST RENDER THE DRIVE LINK ────────────────────────────────────────
 * An <a href="https://drive.google.com/..."> on the thank-you page puts the
 * paid deliverable into the HTML and the JS bundle, where anyone can read it
 * with View Source — no purchase required. Redirecting instead means the URL
 * exists only in a Location header sent to a request that carried a valid
 * purchase cookie.
 *
 * ── WHAT THIS DOES AND DOES NOT PROTECT ───────────────────────────────────────
 * It stops the link leaking from our site. It cannot stop a buyer forwarding
 * the Drive URL after they land on it — that is a property of Google Drive
 * "anyone with the link" sharing, and no amount of gating here changes it.
 * The site does not claim otherwise.
 */
export async function GET() {
  const cookieStore = await cookies();
  const payload = verifyAccessToken(cookieStore.get(ACCESS_COOKIE)?.value);

  if (!payload) {
    // No valid purchase session: send them to the thank-you page, which
    // explains the situation and offers support. Deliberately NOT a 403 with
    // a bare message — a buyer whose cookie expired is not an attacker.
    return NextResponse.redirect(new URL("/thank-you", getOrigin()), { status: 302 });
  }

  let destination: string;
  try {
    destination = serverConfig.productDownloadUrl;
  } catch (error) {
    // PRODUCT_DOWNLOAD_URL missing: a real buyer is standing in front of a
    // broken door, so make the cause unmistakable in the logs.
    console.error("[access-bundle] PRODUCT_DOWNLOAD_URL is not set", {
      orderId: payload.orderId,
      reason: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.redirect(new URL("/thank-you?delivery=unavailable", getOrigin()), {
      status: 302,
    });
  }

  console.info("[access-bundle] released", {
    orderId: payload.orderId,
    paymentId: payload.paymentId,
  });

  const response = NextResponse.redirect(destination, { status: 302 });
  // Never let a shared cache hold a response whose Location is the paid asset.
  response.headers.set("Cache-Control", "no-store, private");
  return response;
}

/** Absolute origin for the relative redirects above. */
function getOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  return vercel ? `https://${vercel}` : "https://interviewmastery.shop";
}
