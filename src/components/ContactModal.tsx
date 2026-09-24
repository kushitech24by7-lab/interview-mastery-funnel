"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { siteConfig } from "@/lib/site-config";
import { validateEmail, validatePhone } from "@/lib/contact-validation";

/**
 * Pre-checkout contact capture.
 *
 * ── WHY THIS EXISTS ───────────────────────────────────────────────────────────
 * The product is delivered by email, so we must know the buyer's address
 * BEFORE Razorpay opens. Razorpay does collect contact details, but they are
 * not reliably returned to us on every payment method, and taking them here
 * also lets us prefill checkout — which removes typing on a phone at the exact
 * moment a buyer is most likely to abandon.
 *
 * ── WHY ONLY TWO FIELDS ───────────────────────────────────────────────────────
 * Every field added between "Buy" and "Pay" costs conversions. Email is
 * required to deliver the product; the mobile number is what Razorpay uses for
 * payment OTPs and what support needs to trace a failed payment. Nothing else
 * is asked.
 *
 * Accessibility: a real modal — focus is moved in and trapped, Escape closes,
 * the background is inert to screen readers, and focus returns to the button
 * that opened it. Errors are announced and tied to their inputs.
 */

export interface ContactDetails {
  email: string;
  phone: string;
}

interface Props {
  open: boolean;
  /** True while the order is being created, so the button can show progress. */
  submitting: boolean;
  /** Server-side error (e.g. a rejected address), shown above the form. */
  serverError?: string | null;
  onClose: () => void;
  onSubmit: (details: ContactDetails) => void;
}

export default function ContactModal({
  open,
  submitting,
  serverError,
  onClose,
  onSubmit,
}: Props) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});
  /** Errors appear only after a field is left or the form is submitted. */
  const [touched, setTouched] = useState<{ email?: boolean; phone?: boolean }>({});

  const dialogRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const ids = useId();
  const titleId = `${ids}-title`;
  const emailId = `${ids}-email`;
  const phoneId = `${ids}-phone`;
  const emailErrId = `${ids}-email-error`;
  const phoneErrId = `${ids}-phone-error`;
  const serverErrId = `${ids}-server-error`;

  // Move focus in on open; restore it on close.
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => emailRef.current?.focus(), 30);
    return () => {
      window.clearTimeout(timer);
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  // Escape to close, Tab cycles within the dialog, and the page cannot scroll.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  const validate = useCallback((): ContactDetails | null => {
    const emailCheck = validateEmail(email);
    const phoneCheck = validatePhone(phone);
    setErrors({ email: emailCheck.error, phone: phoneCheck.error });
    setTouched({ email: true, phone: true });
    if (!emailCheck.ok || !phoneCheck.ok) return null;
    // Submit the NORMALISED values, so what we send matches what we validated.
    return { email: emailCheck.value!, phone: phoneCheck.value! };
  }, [email, phone]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // The parent also guards, but stopping here avoids a wasted round trip.
    if (submitting) return;
    const details = validate();
    if (details) onSubmit(details);
  };

  if (!open) return null;

  const emailInvalid = Boolean(touched.email && errors.email);
  const phoneInvalid = Boolean(touched.phone && errors.phone);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-navy-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        // Close only on a click that both starts and ends on the backdrop, so
        // a drag that happens to end outside the panel does not discard input.
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-t-xl2 border border-navy-100 bg-white p-6 shadow-lift sm:rounded-xl2 sm:p-7"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-fluid-lg font-bold text-navy-950">
              Complete your details
            </h2>
            <p className="mt-1.5 text-fluid-sm leading-relaxed text-ink-soft">
              Enter your email and mobile number so we can send your{" "}
              {siteConfig.PRODUCT_NAME} access after successful payment.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="-mr-1.5 -mt-1.5 shrink-0 rounded-lg p-2.5 text-ink-soft hover:bg-navy-50 hover:text-navy-950 disabled:opacity-40"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M5.3 5.3a1 1 0 011.4 0L10 8.6l3.3-3.3a1 1 0 111.4 1.4L11.4 10l3.3 3.3a1 1 0 01-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 01-1.4-1.4L8.6 10 5.3 6.7a1 1 0 010-1.4z" />
            </svg>
          </button>
        </div>

        {serverError && (
          <p
            id={serverErrId}
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-fluid-xs font-medium text-red-700"
          >
            {serverError}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-5">
          <div>
            <label htmlFor={emailId} className="block text-fluid-sm font-semibold text-navy-950">
              Email address
            </label>
            <input
              ref={emailRef}
              id={emailId}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              disabled={submitting}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (touched.email) setErrors((e) => ({ ...e, email: validateEmail(event.target.value).error }));
              }}
              onBlur={() => {
                setTouched((t) => ({ ...t, email: true }));
                setErrors((e) => ({ ...e, email: validateEmail(email).error }));
              }}
              aria-invalid={emailInvalid}
              aria-describedby={emailInvalid ? emailErrId : undefined}
              placeholder="you@example.com"
              className={`mt-1.5 min-h-[2.75rem] w-full rounded-lg border px-3.5 text-fluid-sm text-navy-950 outline-none transition-colors focus:ring-2 focus:ring-teal-500/40 disabled:bg-navy-50 ${
                emailInvalid ? "border-red-400 focus:border-red-500" : "border-navy-200 focus:border-teal-600"
              }`}
            />
            {emailInvalid && (
              <p id={emailErrId} role="alert" className="mt-1.5 text-fluid-xs font-medium text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          <div className="mt-4">
            <label htmlFor={phoneId} className="block text-fluid-sm font-semibold text-navy-950">
              Mobile number
            </label>
            <input
              id={phoneId}
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              disabled={submitting}
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                if (touched.phone) setErrors((e) => ({ ...e, phone: validatePhone(event.target.value).error }));
              }}
              onBlur={() => {
                setTouched((t) => ({ ...t, phone: true }));
                setErrors((e) => ({ ...e, phone: validatePhone(phone).error }));
              }}
              aria-invalid={phoneInvalid}
              aria-describedby={phoneInvalid ? phoneErrId : undefined}
              placeholder="9876543210"
              className={`mt-1.5 min-h-[2.75rem] w-full rounded-lg border px-3.5 text-fluid-sm text-navy-950 outline-none transition-colors focus:ring-2 focus:ring-teal-500/40 disabled:bg-navy-50 ${
                phoneInvalid ? "border-red-400 focus:border-red-500" : "border-navy-200 focus:border-teal-600"
              }`}
            />
            {phoneInvalid && (
              <p id={phoneErrId} role="alert" className="mt-1.5 text-fluid-xs font-medium text-red-600">
                {errors.phone}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <>
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-navy-950/30 border-t-navy-950"
                />
                Starting secure payment…
              </>
            ) : (
              "Continue to Secure Payment"
            )}
          </button>

          <p className="mt-3 text-center text-fluid-xs leading-relaxed text-ink-faint">
            Your access details will be sent to this email after successful payment.
          </p>
        </form>
      </div>
    </div>
  );
}
