import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Refund Policy | ${siteConfig.BRAND_NAME}`,
  description: `Refund terms for ${siteConfig.PRODUCT_NAME}.`,
  alternates: { canonical: "/refund-policy" },
};

export default function RefundPage() {
  return (
    <LegalPage
      title="Refund Policy"
      intro="Whether and when a refund is available for this digital product."
      requiredContent={[
        "Whether refunds are offered at all for this digital product, and on what grounds",
        "Any time window (e.g. within N days of purchase)",
        "How a refund is requested, and what information the buyer must provide",
        "How long a processed refund takes to reach the original payment method",
        "What happens when payment succeeded but access was never delivered — this case should always be resolved",
        "Any circumstances where a refund is not available, stated plainly",
      ]}
    />
  );
}
