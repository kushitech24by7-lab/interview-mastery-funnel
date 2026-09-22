import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverConfig, ACCESS_COOKIE } from "@/lib/server-config";
import { verifyAccessToken } from "@/lib/access-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * STEP 10 of the payment flow (brief §33 + §34): release the product link
 * ONLY against a valid, unexpired, server-signed access token.
 *
 * The Google Drive URL exists in exactly one place in this codebase — the
 * PRODUCT_DOWNLOAD_URL environment variable, read here on the server. It is
 * never placed in HTML, never in a client bundle, and never in a
 * NEXT_PUBLIC_* variable.
 */

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const url = new URL(request.url);

  // Token may arrive via the httpOnly cookie (normal flow) or the `t` query
  // parameter (e.g. the buyer opened the access link in another browser).
  const token = cookieStore.get(ACCESS_COOKIE)?.value || url.searchParams.get("t") || null;
  const payload = verifyAccessToken(token);

  if (!payload) {
    return NextResponse.json(
      {
        error: "no_verified_purchase",
        message:
          "We could not confirm a verified purchase for this session. If you have paid, contact support with your payment ID.",
      },
      { status: 403 }
    );
  }

  if (!serverConfig.isConfigured) {
    return NextResponse.json(
      { error: "not_configured", message: "Delivery is not configured on this deployment." },
      { status: 503 }
    );
  }

  return NextResponse.json({
    downloadUrl: serverConfig.productDownloadUrl,
    orderId: payload.orderId,
    paymentId: payload.paymentId,
    expiresAt: new Date(payload.exp * 1000).toISOString(),
  });
}
