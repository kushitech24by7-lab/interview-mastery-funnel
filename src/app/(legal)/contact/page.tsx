import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig, isPlaceholder, supportMailto, whatsappLink } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Contact | ${siteConfig.BRAND_NAME}`,
  description: `Get in touch with ${siteConfig.BRAND_NAME} about ${siteConfig.PRODUCT_NAME}.`,
  alternates: { canonical: "/contact" },
};

/**
 * Contact page (§35). A visible, working contact route is one of the things a
 * cautious Indian buyer checks before paying — and Razorpay expects one too.
 */
export default function ContactPage() {
  const mailto = supportMailto(`Enquiry — ${siteConfig.PRODUCT_NAME}`);
  const whatsapp = whatsappLink(`Hi, I have a question about ${siteConfig.PRODUCT_NAME}.`);

  return (
    <main id="main" className="min-h-screen bg-sand">
      <div className="container-page py-10 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <Link href="/" className="text-fluid-sm font-semibold text-teal-700 hover:underline">
            ← Back to {siteConfig.BRAND_NAME}
          </Link>

          <h1 className="mt-5 text-fluid-3xl font-bold text-navy-950">Contact us</h1>
          <p className="lede mt-3">
            Questions before buying, or trouble accessing your bundle after payment? Get in
            touch and we will help.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="card p-6">
              <h2 className="text-fluid-base font-bold text-navy-950">Email</h2>
              {mailto ? (
                <a href={mailto} className="mt-2 block font-semibold text-teal-700 underline">
                  {siteConfig.SUPPORT_EMAIL}
                </a>
              ) : (
                <p className="mt-2 rounded bg-amber-50 px-2 py-1 text-fluid-xs text-amber-900">
                  [Configure SUPPORT_EMAIL]
                </p>
              )}
              {!isPlaceholder(siteConfig.SUPPORT_HOURS) && (
                <p className="mt-2 text-fluid-xs text-ink-faint">{siteConfig.SUPPORT_HOURS}</p>
              )}
            </div>

            <div className="card p-6">
              <h2 className="text-fluid-base font-bold text-navy-950">WhatsApp</h2>
              {whatsapp ? (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block font-semibold text-teal-700 underline"
                >
                  Message us on WhatsApp
                </a>
              ) : (
                <p className="mt-2 text-fluid-xs text-ink-faint">
                  WhatsApp support is not currently offered.
                </p>
              )}
            </div>
          </div>

          <div className="card mt-4 p-6">
            <h2 className="text-fluid-base font-bold text-navy-950">
              Paid but cannot access your bundle?
            </h2>
            <p className="mt-2 text-fluid-sm leading-relaxed text-ink-soft">
              Include your <strong>payment ID</strong> (it starts with <code>pay_</code> and
              appears on your payment confirmation) and we will restore your access. Your
              payment is recorded as soon as the gateway confirms it, independently of
              whether your browser completed the redirect.
            </p>
          </div>

          <p className="mt-8 text-fluid-xs text-ink-faint">
            {siteConfig.BRAND_NAME} · {siteConfig.PRIMARY_DOMAIN}
          </p>
        </div>
      </div>
    </main>
  );
}
