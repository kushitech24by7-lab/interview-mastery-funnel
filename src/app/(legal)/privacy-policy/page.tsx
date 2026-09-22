import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteConfig.BRAND_NAME}`,
  description:
    "Learn how Interview Mastery collects, uses and protects information when you visit interviewmastery.shop or purchase Complete Interview Mastery.",
  alternates: { canonical: "/privacy-policy" },
  robots: { index: true, follow: true },
};

const EMAIL = siteConfig.SUPPORT_EMAIL;

/**
 * Privacy Policy.
 *
 * ACCURACY NOTE — the advertising and analytics wording below is conditional
 * ("may use") on purpose. At the time of writing, the Meta Pixel and GA4
 * integrations exist in the codebase but are gated behind unset IDs, so
 * nothing is actually collected by them. Claiming an active pixel would be a
 * false privacy disclosure; claiming none at all would become false the moment
 * an ID is configured. Razorpay and Vercel ARE named, because their use is
 * verifiable from the code and the live response headers.
 */
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={
        <>
          {siteConfig.BRAND_NAME} respects your privacy. This Privacy Policy explains what
          information may be collected, why it is collected, how it may be used, and what
          choices you have when you visit {siteConfig.PRIMARY_DOMAIN} or purchase{" "}
          {siteConfig.PRODUCT_NAME}.
        </>
      }
    >
      <h2 id="information-we-collect">A. Information We Collect</h2>
      <p>
        Depending on how you use the website, the information collected may include:
      </p>
      <ul>
        <li>Your name</li>
        <li>Your email address</li>
        <li>Your phone number, if you provide one during checkout</li>
        <li>Billing and contact details supplied during a transaction</li>
        <li>Purchase and order information</li>
        <li>Payment transaction status and identifiers (such as an order or payment ID)</li>
        <li>Communications you send to customer support</li>
        <li>IP address</li>
        <li>Browser and device information</li>
        <li>Pages visited on this website</li>
        <li>Referral information (how you arrived at the website)</li>
        <li>Website interaction and conversion information</li>
        <li>Cookies and similar technologies</li>
      </ul>
      <p>
        <strong>
          {siteConfig.BRAND_NAME} does not receive or store full card numbers, UPI PINs, CVV
          codes, OTPs or other sensitive payment authentication credentials.
        </strong>{" "}
        Those details are submitted directly to the payment provider when a payment is
        processed.
      </p>

      <h2 id="how-we-use-information">B. How We Use Information</h2>
      <p>Information may be used for purposes including:</p>
      <ul>
        <li>Processing and confirming your purchase</li>
        <li>Delivering the digital product you bought</li>
        <li>Providing customer support</li>
        <li>Sending transactional emails relating to your order or access</li>
        <li>Preventing fraud and abuse</li>
        <li>Maintaining the security of the website</li>
        <li>Troubleshooting technical problems</li>
        <li>Improving the website experience</li>
        <li>Measuring website and advertising performance</li>
        <li>Maintaining transaction and accounting records where required</li>
        <li>Complying with applicable legal requirements</li>
      </ul>
      <p>
        <strong>{siteConfig.BRAND_NAME} does not sell your personal information.</strong>
      </p>

      <h2 id="payments">C. Payments</h2>
      <p>
        Payments on this website are processed by <strong>Razorpay</strong>. When you pay,
        your payment details may be submitted directly to Razorpay and are handled in
        accordance with Razorpay&apos;s own terms and privacy practices.{" "}
        {siteConfig.BRAND_NAME} does not control Razorpay&apos;s systems and is not
        responsible for how Razorpay processes information under its own policies.
      </p>
      <p>
        What {siteConfig.BRAND_NAME} typically receives back from the payment process is
        limited information such as whether a payment succeeded or failed, and the
        associated order and payment identifiers needed to deliver your purchase and provide
        support.
      </p>

      <h2 id="meta-advertising">D. Meta / Facebook / Instagram Advertising</h2>
      <p>
        This website may use Meta advertising technologies, such as the Meta Pixel and
        related conversion-measurement technologies. Where these are enabled, they may be
        used to:
      </p>
      <ul>
        <li>Measure visits and conversions</li>
        <li>Understand how advertisements are performing</li>
        <li>Build advertising audiences where permitted</li>
        <li>Improve the relevance of advertising</li>
        <li>Measure actions taken after viewing or clicking an advertisement</li>
      </ul>
      <p>
        Where such technologies are active, Meta may process information in accordance with
        its own policies. You can review and adjust your advertising preferences through the
        settings offered by Meta and by your browser or device.
      </p>
      <p>
        <strong>
          {siteConfig.BRAND_NAME} is not endorsed by, sponsored by, or affiliated with Meta
          Platforms, Inc., Facebook, or Instagram.
        </strong>
      </p>

      <h2 id="cookies">E. Cookies and Similar Technologies</h2>
      <p>
        Cookies, browser storage, pixels and similar technologies may be used on this
        website for purposes including:
      </p>
      <ul>
        <li>Core website functionality</li>
        <li>Security</li>
        <li>Checkout functionality, including confirming a completed purchase</li>
        <li>Remembering preferences</li>
        <li>Analytics</li>
        <li>Advertising measurement</li>
      </ul>
      <p>
        Most browsers let you block or delete cookies through their settings. Blocking some
        cookies may affect parts of the website, including the checkout and the delivery of
        your purchase.
      </p>

      <h2 id="third-party-services">F. Third-Party Services</h2>
      <p>
        This website relies on third-party providers to operate. Depending on the activity,
        these may include providers for website hosting, payment processing, email delivery,
        analytics, advertising and conversion measurement, and digital product delivery.
      </p>
      <p>Providers currently used include:</p>
      <ul>
        <li>
          <strong>Razorpay</strong> — payment processing
        </li>
        <li>
          <strong>Vercel</strong> — website hosting and delivery
        </li>
        <li>
          <strong>Google Drive</strong> — hosting the digital files delivered after purchase
        </li>
      </ul>
      <p>
        Each third-party provider handles information under its own terms and privacy
        practices.
      </p>

      <h2 id="data-retention">G. Data Retention</h2>
      <p>
        Information is retained only for as long as is reasonably necessary for the purposes
        described in this policy, including completing transactions, providing the purchased
        product, providing support, maintaining required business records, resolving
        disputes, preventing fraud, and satisfying applicable legal obligations.
      </p>

      <h2 id="data-security">H. Data Security</h2>
      <p>
        Reasonable administrative and technical safeguards are used to help protect
        information handled by this website. However, no website, server or internet-based
        system can be guaranteed to be completely secure, and{" "}
        {siteConfig.BRAND_NAME} cannot guarantee absolute security of information transmitted
        over the internet.
      </p>

      <h2 id="your-choices">I. Your Choices and Privacy Requests</h2>
      <p>
        You can contact <a href={`mailto:${EMAIL}`}>{EMAIL}</a> with reasonable
        privacy-related requests, including, where applicable:
      </p>
      <ul>
        <li>Requesting access to information held about you</li>
        <li>Requesting correction of inaccurate information</li>
        <li>Requesting deletion of information</li>
        <li>Withdrawing consent, where consent is the basis for processing</li>
        <li>Asking questions about how your information is handled</li>
      </ul>
      <p>
        Some information may need to be retained where it is required to complete or
        evidence a transaction, to prevent fraud, to handle a dispute, or to meet a legal
        obligation.
      </p>

      <h2 id="childrens-privacy">J. Children&apos;s Privacy</h2>
      <p>
        This website and {siteConfig.PRODUCT_NAME} are intended for people preparing for job
        interviews and are not intentionally directed at children.{" "}
        {siteConfig.BRAND_NAME} does not knowingly seek to collect personal information from
        children. If you believe a child has provided personal information, please contact{" "}
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a> so it can be reviewed.
      </p>

      <h2 id="external-links">K. External Links</h2>
      <p>
        This website may link to third-party websites. Those websites have their own privacy
        practices, and {siteConfig.BRAND_NAME} is not responsible for the content or privacy
        policies of third-party websites.
      </p>

      <h2 id="changes">L. Changes to This Privacy Policy</h2>
      <p>
        This Privacy Policy may be updated from time to time. When a material update is
        made, the &quot;Last Updated&quot; date at the top of this page will be revised.
        Please review this page periodically.
      </p>

      <h2 id="contact-section">M. Contact</h2>
      <p>
        If you have questions about this Privacy Policy or about how your information is
        handled, contact <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. Full contact details are
        listed below.
      </p>
    </LegalPage>
  );
}
