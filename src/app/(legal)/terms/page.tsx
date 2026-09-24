import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { siteConfig } from "@/lib/site-config";
import { displayPrices } from "@/lib/pricing";

export const metadata: Metadata = {
  title: `Terms & Conditions | ${siteConfig.BRAND_NAME}`,
  description: `The terms that apply when you purchase ${siteConfig.PRODUCT_NAME} from Interview Mastery.`,
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

const EMAIL = siteConfig.SUPPORT_EMAIL;

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      intro={<>These terms apply when you purchase or use {siteConfig.PRODUCT_NAME}.</>}
    >
      <h2 id="what-you-are-buying">A. What You Are Buying</h2>
      <p>
        {siteConfig.PRODUCT_NAME} is a digital interview-preparation library of{" "}
        {siteConfig.TOTAL_PRODUCTS} resources totalling {siteConfig.TOTAL_PAGES} pages,
        delivered as PDF files. It is a one-time purchase at {displayPrices.special} (regular
        price {displayPrices.bundleRegular}). There is no subscription and no recurring
        charge.
      </p>

      <h2 id="delivery">B. Delivery</h2>
      <p>
        Access is provided electronically after a successful, verified payment. No physical
        product is shipped. If you cannot access your purchase, contact{" "}
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
      </p>

      <h2 id="licence">C. Permitted Use</h2>
      <p>
        Your purchase is for personal use. You may read, download and print the materials
        for your own interview preparation. You may not resell, redistribute, publish, share
        publicly or sub-licence the files or their contents.
      </p>

      <h2 id="no-guarantee">D. No Guarantee of Outcome</h2>
      <p>
        {siteConfig.PRODUCT_NAME} is educational material. Interview and employment outcomes
        depend on many factors outside anyone&apos;s control, including the role, the
        competition, the interviewer and timing. No employment, interview, selection, salary
        or promotion outcome is guaranteed.
      </p>
      <p>
        The material primarily covers interview strategy, communication, behavioural and
        situational preparation, evidence building, company research, practice, interview
        day, follow-up and salary negotiation. Role-specific technical preparation may still
        be required separately.
      </p>

      <h2 id="payments">E. Payments</h2>
      <p>
        Payments are processed by Razorpay. Prices are shown in Indian Rupees (INR). Your
        purchase is confirmed only after payment has been verified.
      </p>

      <h2 id="refunds">F. Refunds</h2>
      <p>
        Refunds are handled as described in the{" "}
        <a href={siteConfig.REFUND_POLICY_URL}>Refund Policy</a>.
      </p>

      <h2 id="liability">G. Liability</h2>
      <p>
        To the extent permitted by law, {siteConfig.BRAND_NAME}&apos;s liability in
        connection with the product is limited to the amount you paid for it. Nothing in
        these terms excludes or limits any rights that cannot lawfully be excluded under
        applicable consumer protection laws.
      </p>

      <h2 id="changes">H. Changes</h2>
      <p>
        These terms may be updated. The &quot;Last Updated&quot; date at the top of this page
        will reflect material changes.
      </p>
    </LegalPage>
  );
}
