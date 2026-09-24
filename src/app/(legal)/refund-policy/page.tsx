import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { siteConfig } from "@/lib/site-config";
import { displayPrices } from "@/lib/pricing";

export const metadata: Metadata = {
  title: `Refund Policy | ${siteConfig.BRAND_NAME}`,
  description:
    "Review the refund policy for the Complete Interview Mastery digital interview preparation system.",
  alternates: { canonical: "/refund-policy" },
  robots: { index: true, follow: true },
};

const EMAIL = siteConfig.SUPPORT_EMAIL;

/**
 * Refund Policy.
 *
 * Deliberately avoids "all sales are final": that phrasing is both hostile to
 * buyers and unenforceable against non-excludable consumer rights. Instead it
 * names the specific situations where a refund WILL be considered (duplicate
 * charge, paid-but-no-access, defective files, materially different product)
 * and is honest that change-of-mind on downloaded material may not qualify.
 *
 * Prices are read from src/lib/pricing.ts so this page can never drift from
 * the price actually charged at checkout.
 */
export default function RefundPage() {
  return (
    <LegalPage
      title="Refund Policy"
      intro={
        <>
          {siteConfig.PRODUCT_NAME} is a digital product delivered online. This page explains
          when a refund may be considered, how to request one, and what happens next.
        </>
      }
    >
      <h2 id="digital-product">A. This Is a Digital Product</h2>
      <ul>
        <li>
          {siteConfig.PRODUCT_NAME} is delivered digitally as downloadable files.
        </li>
        <li>No physical product is shipped, and there are no delivery charges.</li>
        <li>
          Access and download information is provided electronically after a successful,
          verified payment.
        </li>
        <li>
          Please use an accurate email address and contact details at checkout, so your
          access information and any support replies reach you.
        </li>
      </ul>
      <p>
        Current price: <strong>{displayPrices.special}</strong> (regular price{" "}
        {displayPrices.bundleRegular}). This is a one-time payment, not a subscription, and
        there is no recurring charge.
      </p>

      <h2 id="when-refund-considered">B. When a Refund May Be Considered</h2>
      <p>
        If you experience a genuine purchase-related problem, contact{" "}
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a> <strong>within 7 days of purchase</strong>. A
        refund request may be considered in circumstances such as:
      </p>
      <ul>
        <li>An accidental duplicate payment</li>
        <li>Being charged more than once for the same order</li>
        <li>
          Paying successfully but not receiving or being able to access the product, where
          support is unable to resolve the issue
        </li>
        <li>
          Files that are materially defective or inaccessible, where support cannot provide a
          working replacement
        </li>
        <li>
          The delivered product being materially different from what was described on the
          sales page
        </li>
      </ul>
      <p>
        Each request is reviewed individually. Contacting support does not automatically
        result in a refund, but genuine delivery and access problems will always be
        investigated.
      </p>

      <h2 id="change-of-mind">C. Change-of-Mind Requests</h2>
      <p>
        Because {siteConfig.PRODUCT_NAME} consists of downloadable digital content that can
        be kept permanently once accessed, refund requests based solely on the following may
        not qualify after the material has been substantially accessed or downloaded:
      </p>
      <ul>
        <li>A change of mind after purchase</li>
        <li>Deciding not to use the resources</li>
        <li>Not completing or working through the material</li>
        <li>Purchasing without reading the product description</li>
        <li>Expectations that were not stated on the sales page</li>
      </ul>
      <p>
        This is subject to applicable consumer law — see section J. If you are unsure whether
        the product suits your situation, the sales page lists exactly what is included,
        along with a section describing who the product may <em>not</em> be right for. You
        are welcome to email questions before buying.
      </p>

      <h2 id="before-requesting">D. Before Requesting a Refund</h2>
      <p>
        If your problem is that you cannot access or download the files, please contact{" "}
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a> first.{" "}
        {siteConfig.BRAND_NAME} will attempt to resolve technical delivery and access issues
        — in most cases this is quicker than a refund, and you keep the product.
      </p>

      <h2 id="how-to-request">E. How to Request a Refund</h2>
      <p>
        Email <a href={`mailto:${EMAIL}`}>{EMAIL}</a> with the subject line:
      </p>
      <p>
        <strong>Refund Request - {siteConfig.PRODUCT_NAME}</strong>
      </p>
      <p>Please include:</p>
      <ul>
        <li>The name used for the purchase</li>
        <li>The email address or phone number used at checkout</li>
        <li>Your payment or order ID, if available</li>
        <li>The date of purchase</li>
        <li>A description of the issue</li>
      </ul>
      <p>
        <strong>
          Never send your card number, CVV, UPI PIN, OTP, password or any other sensitive
          payment credentials by email.
        </strong>{" "}
        They are never required to process a refund, and no genuine member of support will
        ask you for them.
      </p>

      <h2 id="refund-review">F. How Requests Are Reviewed</h2>
      <p>Eligible refund requests are reviewed on the basis of:</p>
      <ul>
        <li>Transaction records</li>
        <li>Product delivery status</li>
        <li>Any access or delivery issues reported</li>
        <li>Whether a duplicate payment occurred</li>
        <li>The reason given for the request</li>
        <li>Applicable consumer law</li>
      </ul>
      <p>
        You will receive a reply to your request, including the outcome and the reason for
        it.
      </p>

      <h2 id="approved-refunds">G. Approved Refunds</h2>
      <p>
        Where a refund is approved, it will generally be initiated back through the original
        payment method via the payment provider, where that is possible.
      </p>
      <p>
        The time taken for a refunded amount to appear in your account depends on your bank,
        card issuer, UPI provider or payment processor, and is outside{" "}
        {siteConfig.BRAND_NAME}&apos;s control.
      </p>

      <h2 id="duplicate-payments">H. Duplicate Payments</h2>
      <p>
        If you believe you have been charged more than once for the same intended purchase,
        report it to <a href={`mailto:${EMAIL}`}>{EMAIL}</a> and it will be investigated. A
        confirmed duplicate charge for a single intended purchase will be refunded.
      </p>

      <h2 id="chargebacks">I. Chargebacks</h2>
      <p>
        If something has gone wrong with your payment or access, please contact{" "}
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a> first. Most payment and delivery problems can
        be investigated and resolved directly, and usually faster than a dispute raised
        through your bank.
      </p>
      <p>
        Nothing in this section prevents you from exercising any rights you have with your
        bank, card issuer or payment provider.
      </p>

      <h2 id="consumer-rights">J. Consumer Rights</h2>
      <p>
        <strong>
          Nothing in this Refund Policy is intended to exclude or limit any rights that
          cannot lawfully be excluded under applicable consumer protection laws.
        </strong>
      </p>

      <h2 id="contact-section">K. Contact</h2>
      <p>
        For any refund or billing question, contact{" "}
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. Full contact details are listed below.
      </p>
    </LegalPage>
  );
}
