import Link from "next/link";
import { siteConfig, isPlaceholder } from "@/lib/site-config";

/**
 * Shown when someone reaches /success or /access without a valid access token
 * (brief §59 item 24).
 *
 * The tone matters: a real buyer whose session expired or who opened the link
 * on a different device will land here, and they are already anxious about
 * money. So this page does not accuse or say "access denied" — it explains what
 * happened and points straight at support with their payment ID.
 */

export default function UnverifiedNotice({ paymentId }: { paymentId?: string }) {
  const supportHref = isPlaceholder(siteConfig.SUPPORT_EMAIL)
    ? null
    : `mailto:${siteConfig.SUPPORT_EMAIL}?subject=${encodeURIComponent(
        `Access help${paymentId ? ` — payment ${paymentId}` : ""}`
      )}`;

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
            We couldn't confirm a purchase for this session
          </h1>

          <p className="mt-3 text-fluid-sm leading-relaxed text-ink-soft">
            This can happen if your access link has expired, if you opened it in a different browser
            or device, or if the payment did not complete.
          </p>

          <div className="mt-6 rounded-xl border border-navy-100 bg-sand p-4 text-left">
            <p className="text-fluid-sm font-semibold text-navy-950">If you have already paid:</p>
            <p className="mt-1.5 text-fluid-sm text-ink-soft">
              Your payment is recorded on our side as soon as the gateway confirms it. Contact
              support with your payment ID and we will restore your access.
            </p>
            {paymentId && (
              <p className="mt-2 break-all rounded bg-white px-3 py-2 font-mono text-fluid-xs text-navy-900">
                Payment ID: {paymentId}
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {supportHref ? (
              <a href={supportHref} className="btn-primary">
                Contact support
              </a>
            ) : (
              <span className="rounded-lg bg-amber-50 px-4 py-3 text-fluid-xs text-amber-900">
                [Configure SUPPORT_EMAIL in site-config.ts]
              </span>
            )}
            <Link href="/" className="btn-secondary">
              Back to the main page
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
