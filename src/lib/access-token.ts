import "server-only";
import crypto from "node:crypto";
import { serverConfig, ACCESS_TOKEN_TTL_SECONDS } from "./server-config";

/**
 * Short-lived, HMAC-signed access token (brief §33 step 10, §34).
 *
 * This token is what the success/access pages present to prove a verified
 * purchase. It is signed with a server secret, so it cannot be forged by a
 * visitor who simply navigates to /access directly.
 *
 * SECURITY NOTE, stated plainly: this protects the *access page*. If your
 * Google Drive folder is shared as "anyone with the link", then anyone who
 * receives the Drive link can open it. That is a property of Drive sharing,
 * not of this token — and the copy on the site does not claim otherwise
 * (brief §34). To genuinely restrict per-buyer access you would need
 * per-email Drive permissions or a file proxy; see DEPLOYMENT.md.
 */

export interface AccessTokenPayload {
  orderId: string;
  paymentId: string;
  /**
   * The buyer's address, as recorded on the verified Razorpay order, and
   * whether the delivery email was accepted.
   *
   * These ride inside the SIGNED token rather than the URL so the success page
   * can show "sent to you@example.com" without trusting a query string. Editing
   * either value invalidates the HMAC, so the page cannot be made to claim a
   * delivery that did not happen, or name an address that was never used.
   */
  email?: string;
  delivered?: boolean;
  /** Issued-at, epoch seconds. */
  iat: number;
  /** Expiry, epoch seconds. */
  exp: number;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64url(input: string): Buffer {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function sign(data: string): string {
  return base64url(
    crypto.createHmac("sha256", serverConfig.accessTokenSecret).update(data).digest()
  );
}

export function createAccessToken(
  orderId: string,
  paymentId: string,
  extra?: { email?: string; delivered?: boolean }
): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: AccessTokenPayload = {
    orderId,
    paymentId,
    ...(extra?.email ? { email: extra.email } : {}),
    ...(extra?.delivered !== undefined ? { delivered: extra.delivered } : {}),
    iat: now,
    exp: now + ACCESS_TOKEN_TTL_SECONDS,
  };
  const body = base64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function verifyAccessToken(token: string | undefined | null): AccessTokenPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [body, signature] = parts;
  const expected = sign(body);

  // Constant-time comparison to avoid leaking signature bytes via timing.
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;

  try {
    const payload = JSON.parse(fromBase64url(body).toString("utf8")) as AccessTokenPayload;
    if (!payload.orderId || !payload.paymentId) return null;
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
