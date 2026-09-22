import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Disclaimer | ${siteConfig.BRAND_NAME}`,
  description: `Educational-use disclaimer for ${siteConfig.PRODUCT_NAME}.`,
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer"
      intro="What this product is, and what it does not promise."
      requiredContent={[
        "That the product is educational interview-preparation material",
        "That interview and employment outcomes depend on many factors and cannot be guaranteed",
        "That it does not provide job placement, recruitment or individual career counselling",
        "That role-specific technical preparation may still be required separately",
        "That Razorpay is an independent payment processor and does not endorse this product",
      ]}
    >
      <p>
        <strong>{siteConfig.PRODUCT_NAME}</strong> is an educational interview-preparation
        resource. Interview and employment outcomes depend on many factors — including the
        role, the competition, the interviewer and timing — and cannot be guaranteed.
      </p>
      <p>
        This product does not provide job placement, recruitment services or individual
        career counselling. It primarily covers interview strategy, communication,
        behavioural and situational preparation, evidence building, company research,
        practice, interview day, follow-up and salary negotiation. Role-specific technical
        preparation may still be required separately.
      </p>
      <p>
        Payments are processed securely by Razorpay. Razorpay is an independent payment
        processor and does not endorse this product.
      </p>
    </LegalPage>
  );
}
