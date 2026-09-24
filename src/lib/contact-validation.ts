/**
 * Email and phone validation, shared by the browser and the server.
 *
 * ── WHY THIS FILE IS SHARED ───────────────────────────────────────────────────
 * The modal validates on the client for fast feedback, and /api/razorpay/create-order
 * validates again before it will create an order. Both import THESE functions,
 * so the two can never drift into disagreeing about what a valid input is —
 * which is how a buyer ends up blocked by a server rule the form never showed.
 *
 * Client-side validation here is purely UX. The server call is the one that
 * matters, because anything the browser does can be bypassed with devtools.
 *
 * This file must stay free of secrets and server-only imports: it is bundled
 * into the browser.
 */

/** Razorpay notes values are capped at 256 chars; stay well inside that. */
export const MAX_EMAIL_LENGTH = 200;

export interface ValidationResult<T> {
  ok: boolean;
  value?: T;
  error?: string;
}

/*
 * Deliberately permissive, anchored, and free of nested quantifiers.
 *
 * A stricter "RFC-correct" pattern rejects real addresses (plus-tags, long new
 * TLDs, dotted locals) and every false rejection here is a lost sale on a page
 * whose entire job is to take payment. Deliverability is proven by the email
 * actually arriving, not by a regex.
 */
const EMAIL_PATTERN = /^[^\s@,;:<>()[\]\\"]+@[^\s@.]+(\.[^\s@.]+)+$/;

/**
 * Characters that could forge extra SMTP headers if an address were ever
 * interpolated into a raw header. We send via a JSON API rather than raw SMTP,
 * but rejecting them costs nothing and removes the class of bug entirely.
 */
const HEADER_INJECTION = /[\r\n\t]/;

export function validateEmail(raw: unknown): ValidationResult<string> {
  if (typeof raw !== "string") return { ok: false, error: "Please enter your email address." };

  const value = raw.trim();
  if (!value) return { ok: false, error: "Please enter your email address." };
  if (HEADER_INJECTION.test(raw)) return { ok: false, error: "Please enter a valid email address." };
  if (value.length > MAX_EMAIL_LENGTH) {
    return { ok: false, error: "That email address is too long." };
  }
  if (!EMAIL_PATTERN.test(value)) {
    return { ok: false, error: "Please enter a valid email address, e.g. you@example.com" };
  }

  // Lower-casing the domain is always safe. The local part is left alone:
  // it is technically case-sensitive, and rewriting it could misdeliver.
  const at = value.lastIndexOf("@");
  const normalised = value.slice(0, at) + "@" + value.slice(at + 1).toLowerCase();
  return { ok: true, value: normalised };
}

/**
 * Indian mobile validation.
 *
 * Accepts the formats buyers actually type — "9876543210", "+91 98765 43210",
 * "091-9876543210" — and normalises them all to E.164 (+919876543210) so the
 * value stored on the Razorpay order and prefilled into checkout is consistent.
 *
 * Indian mobile numbers are 10 digits starting 6–9. Numbers starting 0–5 are
 * landline or invalid ranges and cannot receive the SMS Razorpay may send.
 */
export function validatePhone(raw: unknown): ValidationResult<string> {
  if (typeof raw !== "string") return { ok: false, error: "Please enter your mobile number." };
  if (HEADER_INJECTION.test(raw)) return { ok: false, error: "Please enter a valid mobile number." };

  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, error: "Please enter your mobile number." };

  // Keep a leading +, drop spaces, dashes, brackets and dots.
  const digits = trimmed.replace(/[^\d]/g, "");
  if (!digits) return { ok: false, error: "Please enter a valid mobile number." };

  let local: string;
  if (digits.length === 10) {
    local = digits;
  } else if (digits.length === 11 && digits.startsWith("0")) {
    local = digits.slice(1); // trunk prefix, e.g. 09876543210
  } else if (digits.length === 12 && digits.startsWith("91")) {
    local = digits.slice(2); // 919876543210 or +91 9876543210
  } else if (digits.length === 13 && digits.startsWith("091")) {
    local = digits.slice(3);
  } else {
    return {
      ok: false,
      error: "Enter a 10-digit Indian mobile number, e.g. 9876543210",
    };
  }

  if (!/^[6-9]\d{9}$/.test(local)) {
    return {
      ok: false,
      error: "That does not look like a valid Indian mobile number.",
    };
  }

  return { ok: true, value: `+91${local}` };
}

/** Formats an E.164 number for display, e.g. +919876543210 → +91 98765 43210. */
export function formatPhoneForDisplay(e164: string): string {
  const m = /^\+91(\d{5})(\d{5})$/.exec(e164);
  return m ? `+91 ${m[1]} ${m[2]}` : e164;
}
