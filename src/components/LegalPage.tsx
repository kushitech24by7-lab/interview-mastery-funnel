import Link from "next/link";
import { siteConfig, isPlaceholder, supportMailto } from "@/lib/site-config";

/**
 * Shared shell for the published legal pages.
 *
 * These are real, crawlable routes — not modals — because Meta's landing-page
 * review fetches them directly, and a policy that only exists behind a click
 * handler reads as missing.
 *
 * Content discipline: nothing on these pages may assert a fact the business
 * has not supplied. No registration number, GSTIN, PAN, registered address,
 * phone number, customer statistics or security certification appears
 * anywhere, and no claim is made that a lawyer reviewed the text.
 */

interface Props {
  title: string;
  /** Short line under the heading explaining the page's purpose. */
  intro: React.ReactNode;
  children: React.ReactNode;
}

export default function LegalPage({ title, intro, children }: Props) {
  const mailto = supportMailto(`${title} enquiry`);

  return (
    <main id="main" className="min-h-screen bg-sand">
      <div className="container-page py-10 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="inline-flex min-h-[2.75rem] items-center text-fluid-sm font-semibold text-teal-700 hover:underline"
          >
            ← Back to {siteConfig.BRAND_NAME}
          </Link>

          {/* Single H1 per page (SEO requirement). */}
          <h1 className="mt-5 text-fluid-3xl font-bold text-navy-950">{title}</h1>

          <p className="mt-2 text-fluid-sm text-ink-faint">
            Last Updated: {siteConfig.POLICY_LAST_UPDATED}
          </p>

          <div className="lede mt-4">{intro}</div>

          <article className="legal-body mt-8">{children}</article>

          {/* Contact block, repeated on every policy page. */}
          <section
            aria-labelledby="legal-contact"
            className="mt-10 rounded-xl2 border border-navy-100 bg-white p-6"
          >
            <h2 id="legal-contact" className="text-fluid-lg font-bold text-navy-950">
              Contact
            </h2>
            <dl className="mt-3 space-y-1.5 text-fluid-sm">
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium text-ink-soft">Business:</dt>
                <dd className="text-navy-950">{siteConfig.LEGAL_BUSINESS_NAME}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium text-ink-soft">Product:</dt>
                <dd className="text-navy-950">{siteConfig.PRODUCT_NAME}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium text-ink-soft">Website:</dt>
                <dd>
                  <a href={siteConfig.SITE_URL} className="text-teal-700 underline">
                    {siteConfig.SITE_URL}
                  </a>
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium text-ink-soft">Email:</dt>
                <dd>
                  {mailto ? (
                    <a href={mailto} className="font-semibold text-teal-700 underline">
                      {siteConfig.SUPPORT_EMAIL}
                    </a>
                  ) : (
                    <span className="text-ink-soft">[SUPPORT_EMAIL not configured]</span>
                  )}
                </dd>
              </div>
            </dl>
          </section>

          <nav aria-label="Other policies" className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
            {[
              { href: siteConfig.PRIVACY_URL, label: "Privacy Policy" },
              { href: siteConfig.REFUND_POLICY_URL, label: "Refund Policy" },
              { href: siteConfig.TERMS_URL, label: "Terms & Conditions" },
              { href: siteConfig.DISCLAIMER_URL, label: "Disclaimer" },
              { href: siteConfig.CONTACT_URL, label: "Contact" },
            ]
              .filter((l) => !isPlaceholder(l.href))
              .map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-fluid-sm font-medium text-teal-700 hover:underline"
                >
                  {l.label}
                </Link>
              ))}
          </nav>
        </div>
      </div>
    </main>
  );
}
