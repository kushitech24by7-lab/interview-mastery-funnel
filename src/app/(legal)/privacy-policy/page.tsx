import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteConfig.BRAND_NAME}`,
  description: `How ${siteConfig.BRAND_NAME} handles your personal data.`,
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="What data is collected, why, and what happens to it."
      requiredContent={[
        "What is collected at checkout (name, email, phone) and by whom",
        "That payment details go directly to Razorpay and are never stored by this site",
        "Analytics and advertising: Meta Pixel and Google Analytics 4, and what they track",
        "Cookies and similar storage used by the site",
        "How long data is retained and who it is shared with (e.g. Razorpay, Google)",
        "User rights — access, correction and deletion — and how to exercise them",
        "The contact address for privacy enquiries",
      ]}
    />
  );
}
