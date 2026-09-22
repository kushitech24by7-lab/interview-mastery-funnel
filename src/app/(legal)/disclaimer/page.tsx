import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Disclaimer | ${siteConfig.BRAND_NAME}`,
  description: `Educational-use disclaimer for ${siteConfig.PRODUCT_NAME}.`,
  alternates: { canonical: "/disclaimer" },
  robots: { index: true, follow: true },
};

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer"
      intro={<>What {siteConfig.PRODUCT_NAME} is, and what it does not promise.</>}
    >
      <h2 id="educational">A. Educational Resource</h2>
      <p>
        <strong>{siteConfig.PRODUCT_NAME}</strong> is an educational
        interview-preparation resource. It is designed to help candidates prepare more
        systematically, build clearer evidence-based answers, practise their communication
        and organise their preparation before an interview.
      </p>

      <h2 id="no-guarantee">B. No Guaranteed Outcome</h2>
      <p>
        Interview and employment outcomes depend on many factors — including the role, the
        competition, the interviewer and timing — and cannot be guaranteed. Nothing in this
        product or on this website should be read as a promise of a job, an interview, a
        selection decision, a particular salary or a promotion.
      </p>

      <h2 id="not-a-service">C. Not Placement or Counselling</h2>
      <p>
        This product does not provide job placement, recruitment services or individual
        career counselling. It does not include a live human interviewer, and
        role-specific technical preparation may still be required separately.
      </p>

      <h2 id="payments">D. Payment Processing</h2>
      <p>
        Payments are processed securely by Razorpay. Razorpay is an independent payment
        processor and does not endorse this product.
      </p>

      <h2 id="affiliation">E. No Affiliation</h2>
      <p>
        {siteConfig.BRAND_NAME} is not endorsed by, sponsored by, or affiliated with Meta
        Platforms, Inc., Facebook, or Instagram.
      </p>
    </LegalPage>
  );
}
