import Link from "next/link";
import { siteConfig, isPlaceholder, supportMailto } from "@/lib/site-config";

/**
 * Shared shell for the legal pages (§49).
 *
 * ── WHY THESE PAGES ARE DELIBERATELY UNFINISHED ───────────────────────────────
 * The routes exist so the footer has no dead links and Razorpay onboarding can
 * find them — but the BODY of each policy is your business's legal content, and
 * inventing it would be worse than leaving it blank: an invented refund policy
 * is a term you could be held to, and an invented privacy policy misstates what
 * you actually do with customer data.
 *
 * So each page renders a clearly-marked notice in place of the missing content.
 * `requiredContent` lists what the real policy must cover, so whoever writes it
 * knows what is expected. Replace <LegalNotice> with real content before launch.
 */

interface Props {
  title: string;
  /** Short line under the heading explaining the page's purpose. */
  intro: string;
  /** Points the real policy must address. */
  requiredContent: string[];
  /** Real content, once written. When present the placeholder notice is hidden. */
  children?: React.ReactNode;
}

export default function LegalPage({ title, intro, requiredContent, children }: Props) {
  const mailto = supportMailto(`${title} enquiry`);
  const hasRealContent = Boolean(children);

  return (
    <main id="main" className="min-h-screen bg-sand">
      <div className="container-page py-10 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="text-fluid-sm font-semibold text-teal-700 hover:underline"
          >
            ← Back to {siteConfig.BRAND_NAME}
          </Link>

          <h1 className="mt-5 text-fluid-3xl font-bold text-navy-950">{title}</h1>
          <p className="lede mt-3">{intro}</p>

          <div className="card mt-8 p-6 sm:p-8">
            {hasRealContent ? (
              <div className="prose-legal space-y-4 text-fluid-sm leading-relaxed text-ink">
                {children}
              </div>
            ) : (
              <LegalNotice title={title} requiredContent={requiredContent} />
            )}
          </div>

          <div className="mt-8 rounded-xl2 border border-navy-100 bg-white p-6">
            <h2 className="text-fluid-base font-bold text-navy-950">Contact</h2>
            <p className="mt-2 text-fluid-sm text-ink-soft">
              {mailto ? (
                <>
                  Questions about this page? Email{" "}
                  <a href={mailto} className="font-semibold text-teal-700 underline">
                    {siteConfig.SUPPORT_EMAIL}
                  </a>
                  .
                </>
              ) : (
                <span className="rounded bg-amber-50 px-2 py-1 text-amber-900">
                  [Configure SUPPORT_EMAIL in src/lib/site-config.ts]
                </span>
              )}
            </p>
            {isPlaceholder(siteConfig.LEGAL_BUSINESS_NAME) ? (
              <p className="mt-2 rounded bg-amber-50 px-2 py-1 text-fluid-xs text-amber-900">
                [Configure LEGAL_BUSINESS_NAME — the registered merchant name on your
                Razorpay account, which may differ from the brand name.]
              </p>
            ) : (
              <p className="mt-2 text-fluid-xs text-ink-faint">
                {siteConfig.LEGAL_BUSINESS_NAME}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function LegalNotice({
  title,
  requiredContent,
}: {
  title: string;
  requiredContent: string[];
}) {
  return (
    <div>
      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-5">
        <p className="text-fluid-base font-bold text-amber-900">
          This policy has not been published yet.
        </p>
        <p className="mt-2 text-fluid-sm leading-relaxed text-amber-900">
          The {title} for {siteConfig.BRAND_NAME} must be written and reviewed by the
          business before launch. No policy text has been auto-generated here, because an
          invented policy would be a term you could be held to.
        </p>
      </div>

      <div className="mt-6">
        <h2 className="text-fluid-base font-bold text-navy-950">
          What the published {title.toLowerCase()} needs to cover
        </h2>
        <ul className="mt-3 space-y-2">
          {requiredContent.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-fluid-sm text-ink-soft">
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500"
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-5 rounded-lg bg-navy-50 p-3 text-fluid-xs text-ink-soft">
          Developer note: replace this placeholder by passing real content as children to{" "}
          <code className="rounded bg-white px-1.5 py-0.5">&lt;LegalPage&gt;</code> in this
          route&apos;s page file.
        </p>
      </div>
    </div>
  );
}
