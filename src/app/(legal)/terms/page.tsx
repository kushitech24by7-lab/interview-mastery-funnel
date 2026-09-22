import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Terms & Conditions | ${siteConfig.BRAND_NAME}`,
  description: `Terms and conditions for purchasing ${siteConfig.PRODUCT_NAME}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      intro={`The terms that apply when you purchase ${siteConfig.PRODUCT_NAME}.`}
      requiredContent={[
        "Who the seller is — the registered business name, address and contact details",
        "What is being sold: 12 digital PDF resources totalling 619 pages, delivered via Google Drive",
        "That it is a one-time purchase with no subscription or recurring charge",
        "Licence terms — personal use, and that resale or redistribution is not permitted",
        "How and when access is delivered after payment verification",
        "Limitation of liability, and that no employment outcome is guaranteed",
        "Governing law and jurisdiction",
      ]}
    />
  );
}
