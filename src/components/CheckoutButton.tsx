"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { siteConfig, isPlaceholder, supportMailto } from "@/lib/site-config";
import { track, getAttribution } from "@/lib/analytics";

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
  className?: string;
  location: string;
  fullWidth?: boolean;
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
  className = "",
  location,
  fullWidth = false,
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const handleClick = useCallback(async () => {
    setError(null);
    track("PricingCTA_Click", { location });
    track("InitiateCheckout", { location });

    // Pre-launch guard: without a configured key, explain rather than fail silently.
    if (isPlaceholder(siteConfig.RAZORPAY_KEY_ID)) {
      setStatus("error");
      setError(
        "Checkout is not configured yet. Set RAZORPAY_KEY_ID and the server environment variables — see DEPLOYMENT.md."
      );
      return;
    }

    setStatus("loading");

    try {
      const scriptOk = await loadRazorpayScript();
      if (!scriptOk) {
        throw new Error(
          "We could not load the secure payment window. Please check your connection and try again."
        );
      }

      const orderResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attribution: getAttribution() }),
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok) {
        throw new Error(orderData?.message || "We could not start the payment. Please try again.");
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
            if (mounted.current) setStatus("idle");
            track("PaymentFailure", { location, reason: "checkout_dismissed" });
          },
        },
      });

      razorpay.on("payment.failed", (resp: unknown) => {
        const failure = resp as { error?: { description?: string; metadata?: { payment_id?: string } } };
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

      track("RazorpayOpened", { location });
      razorpay.open();
      if (mounted.current) setStatus("idle");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      track("PaymentFailure", { location, reason: "checkout_init_error" });
      if (mounted.current) {
        setStatus("error");
        setError(message);
      }
    }
  }, [location]);

  const busy = status === "loading" || status === "verifying";
  const mailto = supportMailto(`Payment issue — ${siteConfig.PRODUCT_NAME}`);

  return (
    <div className={fullWidth ? "w-full" : ""}>
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
            {label}
            <ArrowIcon />
          </>
        )}
      </button>

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
