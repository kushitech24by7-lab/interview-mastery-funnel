"use client";

import { siteConfig, isPlaceholder, supportMailto, whatsappLink } from "@/lib/site-config";
import { track } from "@/lib/analytics";

/**
 * Legal / trust footer (brief §50).
 *
 * Policy links render as visible "[not configured]" placeholders rather than
 * dead links or invented policy text. An Indian buyer checking for a real
 * business behind the page should find contact details and a clear disclaimer.
 */

export default function Footer() {
  const mailto = supportMailto(`Support — ${siteConfig.PRODUCT_NAME}`);
  const whatsapp = whatsappLink(`Hi, I have a question about ${siteConfig.PRODUCT_NAME}.`);

  const legalLinks = [
    { label: "Terms & Conditions", url: siteConfig.TERMS_URL },
    { label: "Privacy Policy", url: siteConfig.PRIVACY_URL },
    { label: "Refund Policy", url: siteConfig.REFUND_POLICY_URL },
    { label: "Disclaimer", url: siteConfig.DISCLAIMER_URL },
    { label: "Contact", url: siteConfig.CONTACT_URL },
  ];

  return (
    <footer className="border-t border-navy-800 bg-navy-950 text-navy-300">
      <div className="container-page py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <p className="text-fluid-lg font-bold text-white">{siteConfig.BRAND_NAME}</p>
            <p className="mt-2 max-w-sm text-fluid-sm">
              {siteConfig.PRODUCT_NAME} — a {siteConfig.TOTAL_PRODUCTS}-resource,{" "}
              {siteConfig.TOTAL_PAGES}-page digital interview preparation system.
            </p>
            <p className="mt-3 text-fluid-xs font-medium text-navy-400">
              {siteConfig.PRIMARY_DOMAIN}
            </p>
            {!isPlaceholder(siteConfig.LEGAL_BUSINESS_NAME) && (
              <p className="mt-1 text-fluid-xs text-navy-400">{siteConfig.LEGAL_BUSINESS_NAME}</p>
            )}
          </div>

          {/* Support */}
          <div>
            <h3 className="text-fluid-sm font-semibold uppercase tracking-wider text-white">
              Support
            </h3>
            <ul className="mt-3 space-y-2 text-fluid-sm">
              <li>
                {mailto ? (
                  <a
                    href={mailto}
                    onClick={() => track("Support_Click", { location: "footer_email" })}
                    className="hover:text-white hover:underline"
                  >
                    {siteConfig.SUPPORT_EMAIL}
                  </a>
                ) : (
                  <span className="text-amber-400">[SUPPORT_EMAIL]</span>
                )}
              </li>
              {whatsapp && (
                <li>
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track("Support_Click", { location: "footer_whatsapp" })}
                    className="hover:text-white hover:underline"
                  >
                    WhatsApp support
                  </a>
                </li>
              )}
              {!isPlaceholder(siteConfig.SUPPORT_HOURS) && (
                <li className="text-fluid-xs text-navy-400">{siteConfig.SUPPORT_HOURS}</li>
              )}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-fluid-sm font-semibold uppercase tracking-wider text-white">
              Legal
            </h3>
            <ul className="mt-3 space-y-2 text-fluid-sm">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  {isPlaceholder(link.url) ? (
                    <span className="text-navy-500">
                      {link.label} <span className="text-amber-500/70">[not configured]</span>
                    </span>
                  ) : (
                    <a
                      href={link.url}
                      className="inline-flex min-h-[2.75rem] items-center text-navy-200 underline-offset-2 hover:text-white hover:underline"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
              <li>
                <a
                  href="/#faq"
                  className="inline-flex min-h-[2.75rem] items-center text-navy-200 underline-offset-2 hover:text-white hover:underline"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer (§50) */}
        <div className="mt-10 border-t border-navy-800 pt-6">
          <p className="max-w-3xl text-fluid-xs leading-relaxed text-navy-400">
            <strong className="text-navy-300">Disclaimer:</strong> {siteConfig.PRODUCT_NAME} is an
            educational interview-preparation resource. Interview and employment outcomes depend on
            many factors and cannot be guaranteed. This product does not provide job placement,
            recruitment services or individual career counselling.
          </p>
          <p className="mt-3 text-fluid-xs text-navy-400">
            Payments are processed securely by Razorpay. Razorpay is an independent payment
            processor and does not endorse this product.
          </p>
          <p className="mt-4 text-fluid-xs text-navy-500">
            © 2026 {siteConfig.LEGAL_BUSINESS_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
