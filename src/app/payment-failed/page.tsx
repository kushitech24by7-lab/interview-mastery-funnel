import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig, isPlaceholder } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Payment not completed | ${siteConfig.BRAND_NAME}`,
  robots: { index: false, follow: false },
};

/**
 * Payment failure page (§41).
 *
 * Tone is deliberately calm and non-accusatory: the most common reason a buyer
 * lands here is a bank OTP timeout, not anything they did wrong. The key
 * reassurance is that nothing was activated and retrying is safe.
 */
export default function PaymentFailedPage() {
  const supportEmail = isPlaceholder(siteConfig.SUPPORT_EMAIL)
    ? null
    : siteConfig.SUPPORT_EMAIL;

  return (
    <main id="main" className="flex min-h-screen items-center bg-sand">
      <div className="container-page py-12">
        <div className="mx-auto max-w-lg rounded-xl2 border border-navy-100 bg-white p-6 text-center shadow-card sm:p-10">
          <span
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100"
            aria-hidden="true"
          >
            <svg className="h-7 w-7 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v2h2v-2zm0-8H9v6h2V5z"
                clipRule="evenodd"
              />
            </svg>
          </span>

          <h1 className="mt-5 text-fluid-2xl font-bold text-navy-950">
            Payment was not completed
          </h1>

          <p className="mt-3 text-fluid-sm leading-relaxed text-ink-soft">
            No {siteConfig.PRODUCT_NAME} access was activated for this attempt. If any amount
            was debited, it is normally reversed by your bank automatically.
          </p>

          <p className="mt-3 text-fluid-sm font-medium text-navy-900">
            You can safely try again.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/#pricing" className="btn-primary">
              Try payment again
            </Link>
            <Link href="/contact" className="btn-secondary">
              Contact support
            </Link>
          </div>

          {supportEmail && (
            <p className="mt-5 text-fluid-xs text-ink-faint">
              If an amount was debited and not reversed within a few days, email{" "}
              <a href={`mailto:${supportEmail}`} className="font-semibold underline">
                {supportEmail}
              </a>{" "}
              with your payment ID.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
