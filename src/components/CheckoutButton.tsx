"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { siteConfig, isPlaceholder, supportMailto } from "@/lib/site-config";
import { track, getAttribution, trackInitiateCheckout } from "@/lib/analytics";
import ContactModal, { type ContactDetails } from "./ContactModal";

/**
 * Client half of the Razorpay flow (brief §33, steps 1–9).
 *
 * What this component does NOT do, deliberately:
 *  • It never decides that a payment succeeded. Razorpay's handler callback is
 *    treated as "probably paid, now go ask the server". Only the server's
 *    verify response moves the buyer forward.
 *  • It never fires the Purchase pixel. That happens on the success page, after
 *    server verification.
 *  • It never sees the price as an authoritative value — the server sets it.
 */

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void };
  }
}

type Status = "idle" | "loading" | "verifying" | "error";

interface Props {
  label?: string;
  /**
   * Optional shorter label used below `sm`. Both are rendered and one is
   * hidden by CSS, so there is no user-agent sniffing and no layout shift
   * after hydration. Use it where the full label would wrap on a phone.
   */
  shortLabel?: string;
  className?: string;
  location: string;
  fullWidth?: boolean;
  /**
   * Shows the "Secure payment • Digital delivery • Refund • Privacy" line.
   * Opt-in: this button appears ~9 times on the page, and repeating the trust
   * line under every one would be clutter rather than reassurance. Enable it
   * at the points where someone is actually deciding to pay.
   */
  showTrustLine?: boolean;
  /** Set on dark (navy) backgrounds so the trust line stays legible. */
  trustLineOnDark?: boolean;
}

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutButton({
  label = "Get Complete Interview Mastery",
  shortLabel,
  className = "",
  location,
  fullWidth = false,
  showTrustLine = false,
  trustLineOnDark = false,
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  /**
   * Synchronous re-entry guard.
   *
   * `disabled={busy}` alone is not enough: React state updates are async, so a
   * fast double-click (or a double-tap on mobile, which is common on payment
   * buttons) can enter handleClick twice before the re-render disables it.
   * That creates two Razorpay orders for one buyer. A ref flips immediately,
   * in the same tick, so the second click is dropped.
   */
  const inFlight = useRef(false);
  /** "test" once the server reports a test-mode key, so the UI can say so. */
  const [mode, setMode] = useState<string | null>(null);
  /**
   * The contact modal now stands between the CTA and Razorpay. The product is
   * delivered by email, so the address must be captured and validated before
   * an order exists — there is no database to attach it to afterwards.
   */
  const [contactOpen, setContactOpen] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  /**
   * The CTA now opens the contact modal rather than starting checkout.
   *
   * No InitiateCheckout here: opening a form is not starting a checkout, and
   * counting it as one would inflate the funnel with people who never paid.
   * It fires later, once a Razorpay order exists and the modal is about to
   * open (see `startCheckout`).
   */
  const handleClick = useCallback(() => {
    if (inFlight.current) return;
    setError(null);
    setContactError(null);
    track("PricingCTA_Click", { location });
    setContactOpen(true);
  }, [location]);

  const startCheckout = useCallback(async (contact: ContactDetails) => {
    // Drop the submit if a checkout attempt is already running (see `inFlight`).
    if (inFlight.current) return;
    inFlight.current = true;

    setError(null);
    setContactError(null);

    // Pre-launch guard: without a configured key, explain rather than fail silently.
    if (isPlaceholder(siteConfig.RAZORPAY_KEY_ID)) {
      inFlight.current = false;
      setStatus("error");
      setError(
        "Checkout is not configured yet. Set RAZORPAY_KEY_ID and the server environment variables — see DEPLOYMENT.md."
      );
      return;
    }

    setStatus("loading");

    try {
      const orderResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        /*
         * Only the contact details and attribution are sent. Product, amount
         * and currency are decided by the server — the browser never proposes
         * a price, so devtools cannot buy the bundle for ₹1.
         */
        body: JSON.stringify({
          email: contact.email,
          phone: contact.phone,
          attribution: getAttribution(),
        }),
      });

      // Parse defensively: a gateway/edge error can return HTML, and letting
      // .json() throw here would mask the real HTTP status in the logs.
      const orderData = await orderResponse.json().catch(() => null);

      /*
       * A rejected email/phone is the buyer's to fix, so it belongs inside the
       * modal next to the fields — not as a page-level error behind a closed
       * dialog. The modal stays open and shows the server's message.
       */
      if (orderResponse.status === 400 && orderData?.field) {
        inFlight.current = false;
        if (mounted.current) {
          setStatus("idle");
          setContactError(orderData.message || "Please check your details and try again.");
        }
        return;
      }

      if (!orderResponse.ok) {
        console.error("[checkout] create-order failed", {
          status: orderResponse.status,
          error: orderData?.error,
          code: orderData?.code,
        });
        throw new Error(
          orderData?.message ||
            `We could not start the payment (error ${orderResponse.status}). Please try again.`
        );
      }

      // Validate the order before handing it to Razorpay. Without this, a
      // malformed response surfaces as an opaque failure inside Razorpay's
      // iframe instead of a diagnosable error on our side.
      if (!orderData?.orderId || !String(orderData.orderId).startsWith("order_")) {
        throw new Error("The payment gateway returned an invalid order reference.");
      }
      if (!Number.isInteger(orderData.amount) || orderData.amount < 100) {
        throw new Error("The payment gateway returned an invalid amount.");
      }
      if (!orderData?.keyId || !String(orderData.keyId).startsWith("rzp_")) {
        throw new Error("The payment gateway returned an invalid key.");
      }
      if (!orderData?.currency) {
        throw new Error("The payment gateway returned no currency.");
      }

      if (orderData.mode) setMode(orderData.mode);

      // Only now load the SDK. Loading it before the order exists would mean a
      // failed order creation had already paid the cost of a third-party
      // script, and would open a window on state we do not yet have.
      const scriptOk = await loadRazorpayScript();
      if (!scriptOk) {
        throw new Error(
          "We could not load the secure payment window. Please check your connection and try again."
        );
      }

      // Step 7: confirm the SDK constructor is genuinely present. A script can
      // fire onload while a proxy/extension has served a body that never
      // defines window.Razorpay; the non-null assertion below would then throw
      // an unhelpful TypeError instead of a clear message.
      if (typeof window.Razorpay !== "function") {
        throw new Error(
          "The secure payment window did not initialise. Please disable any ad blocker for this site and try again."
        );
      }

      const razorpay = new window.Razorpay!({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: siteConfig.BRAND_NAME,
        description: siteConfig.PRODUCT_NAME,
        order_id: orderData.orderId,
        image: "/covers/brand-mark.png",
        theme: { color: "#1d2f4f" },
        notes: { product: "complete-interview-mastery" },
        /*
         * Prefilled from the values the buyer just gave us, already normalised
         * (phone as +91XXXXXXXXXX). Saves re-typing on a phone keypad at the
         * highest-abandonment moment in the flow, and keeps the contact shown
         * in Razorpay consistent with the one recorded on the order.
         */
        prefill: {
          email: contact.email,
          contact: contact.phone,
        },

        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          if (mounted.current) setStatus("verifying");
          try {
            const verifyResponse = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok && verifyData.verified) {
              track("PaymentSuccess", { location, orderId: verifyData.orderId });
              // Full navigation so the httpOnly access cookie is sent.
              window.location.href = `/thank-you?order_id=${encodeURIComponent(
                verifyData.orderId
              )}&payment_id=${encodeURIComponent(verifyData.paymentId)}`;
            } else {
              inFlight.current = false;
              track("PaymentFailure", { location, reason: verifyData?.error || "verification_failed" });
              if (mounted.current) {
                setStatus("error");
                setError(
                  `${verifyData?.message || "We could not verify your payment."} Payment ID: ${
                    response.razorpay_payment_id
                  }`
                );
              }
            }
          } catch {
            // Deliberately NOT releasing the guard: the payment may well have
            // succeeded and only the confirmation call failed. Re-enabling the
            // button here would invite a second charge for the same purchase.
            track("PaymentFailure", { location, reason: "verify_network_error" });
            if (mounted.current) {
              setStatus("error");
              setError(
                `Your payment may have gone through, but we could not confirm it from this device. Please contact support with Payment ID: ${response.razorpay_payment_id}`
              );
            }
          }
        },

        modal: {
          ondismiss: () => {
            // The buyer closed the modal without paying — release the guard so
            // they can retry. This is the normal "changed my mind" path.
            inFlight.current = false;
            if (mounted.current) setStatus("idle");
            track("PaymentFailure", { location, reason: "checkout_dismissed" });
          },
        },
      });

      razorpay.on("payment.failed", (resp: unknown) => {
        const failure = resp as {
          error?: {
            code?: string;
            description?: string;
            source?: string;
            step?: string;
            reason?: string;
          };
        };
        // Diagnostic fields only — never card, UPI or contact details.
        console.error("[checkout] Razorpay payment failed", {
          code: failure?.error?.code,
          description: failure?.error?.description,
          source: failure?.error?.source,
          step: failure?.error?.step,
          reason: failure?.error?.reason,
        });
        // Card declined / UPI timeout etc. Release so the buyer can try another method.
        inFlight.current = false;
        track("PaymentFailure", { location, reason: failure?.error?.description || "payment_failed" });
        if (mounted.current) {
          setStatus("error");
          setError(
            failure?.error?.description
              ? `Payment could not be completed: ${failure.error.description}`
              : "Payment could not be completed. No amount should have been deducted. Please try again."
          );
        }
      });

      /*
       * InitiateCheckout fires HERE — the order exists, the SDK is loaded and
       * the modal is about to open, so the event represents a checkout the
       * customer genuinely reached. Firing it on click instead would also count
       * attempts that died at order creation or a blocked SDK, overstating the
       * top of the funnel and teaching Meta to optimise for clicks that never
       * became checkouts.
       */
      trackInitiateCheckout({ orderId: orderData.orderId, location });
      track("RazorpayOpened", { location });
      // Close our dialog only now, so the buyer never sees a gap between the
      // form disappearing and Razorpay appearing.
      if (mounted.current) setContactOpen(false);
      razorpay.open();
      if (mounted.current) setStatus("idle");
    } catch (err) {
      // Script load or order creation failed; no Razorpay window is open, so release.
      inFlight.current = false;
      // Always log the underlying cause. A bare catch that only sets a friendly
      // string makes production failures undiagnosable — which is exactly how
      // the misconfiguration behind this bug stayed hidden.
      console.error("[checkout] Payment initialization failed:", err);
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      track("PaymentFailure", { location, reason: "checkout_init_error" });
      if (mounted.current) {
        setStatus("error");
        // The modal is still open at this point, so the message has to go
        // inside it — a page-level error would be hidden behind the dialog.
        setContactError(message);
        setError(message);
      }
    }
  }, [location]);

  const busy = status === "loading" || status === "verifying";
  const mailto = supportMailto(`Payment issue — ${siteConfig.PRODUCT_NAME}`);

  return (
    <div className={fullWidth ? "w-full" : ""}>
      <ContactModal
        open={contactOpen}
        submitting={busy}
        serverError={contactError}
        onClose={() => {
          if (busy) return;
          setContactOpen(false);
          setContactError(null);
        }}
        onSubmit={startCheckout}
      />

      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        aria-busy={busy}
        className={`btn-primary ${fullWidth ? "w-full" : ""} ${className}`}
      >
        {busy ? (
          <>
            <Spinner />
            {status === "verifying" ? "Verifying payment…" : "Opening secure checkout…"}
          </>
        ) : (
          <>
            {shortLabel ? (
              <>
                <span className="sm:hidden">{shortLabel}</span>
                <span className="hidden sm:inline">{label}</span>
              </>
            ) : (
              label
            )}
            <ArrowIcon />
          </>
        )}
      </button>

      {/*
        Trust line (§4). Deliberately small and single-line so it reassures
        without competing with the CTA — but the policy links are real <a>
        elements at readable contrast, not grey micro-text, because a buyer
        checking them is exactly the buyer worth reassuring.
      */}
      {showTrustLine && (
      <p
        className={`mt-2.5 text-center text-fluid-xs leading-relaxed ${
          trustLineOnDark ? "text-navy-200" : "text-ink-soft"
        }`}
      >
        Secure payment <span aria-hidden="true">•</span> Digital delivery{" "}
        <span aria-hidden="true">•</span>{" "}
        <Link
          href={siteConfig.REFUND_POLICY_URL}
          className={`link-inline font-medium ${trustLineOnDark ? "text-teal-300" : "text-teal-700"}`}
        >
          Refund Policy
        </Link>{" "}
        <span aria-hidden="true">•</span>{" "}
        <Link
          href={siteConfig.PRIVACY_URL}
          className={`link-inline font-medium ${trustLineOnDark ? "text-teal-300" : "text-teal-700"}`}
        >
          Privacy Policy
        </Link>
      </p>
      )}

      {mode === "test" && (
        <p className="mt-2 text-center text-fluid-xs font-semibold text-amber-700">
          Razorpay TEST mode — no real money will be charged.
        </p>
      )}

      {status === "verifying" && (
        <p role="status" className="mt-2 text-center text-fluid-xs text-ink-soft">
          Please do not close this window.
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-fluid-sm text-amber-900"
        >
          <p className="font-medium">{error}</p>
          {mailto && (
            <a href={mailto} className="mt-1 inline-block font-semibold underline">
              Contact support
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
        clipRule="evenodd"
      />
    </svg>
  );
}
