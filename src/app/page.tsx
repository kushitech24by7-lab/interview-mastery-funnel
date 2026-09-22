import type { Metadata } from "next";
import Hero from "@/components/Hero";
import { TrustStrip, FactStrip } from "@/components/TrustStrip";
import PainSection from "@/components/PainSection";
import PreparationComparison from "@/components/PreparationComparison";
import SixStageSystem from "@/components/SixStageSystem";
import BundleGallery from "@/components/BundleGallery";
import {
  QuestionFrameworkSection,
  StarSection,
  EnglishSection,
  TellMeAboutYourselfSection,
  DifficultQuestionsSection,
  AnswerBuilderSection,
  MockInterviewSection,
  ResearchSection,
} from "@/components/FeatureSections";
import {
  InterviewDaySection,
  SalarySection,
  ToolkitSection,
  AudienceSection,
  FreeContentObjection,
} from "@/components/JourneySections";
import PreparationModes from "@/components/PreparationModes";
import ValueComparison from "@/components/ValueComparison";
import WhatYouGet699 from "@/components/WhatYouGet699";
import PreviewGallery from "@/components/PreviewGallery";
import Testimonials from "@/components/Testimonials";
import PricingSection from "@/components/PricingSection";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import Footer from "@/components/Footer";
import ConfigWarning from "@/components/ConfigWarning";
import { resolveVariant } from "@/lib/variants";
import { siteConfig } from "@/lib/site-config";
import { pricing } from "@/lib/pricing";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * The landing page (brief §59).
 *
 * SECTION ORDER — this is the argument the page makes, in order:
 *   1. Hero + proof        → what this is, and that it is real
 *   2. Pain                → you are in the right place
 *   3. Comparison          → why your current approach isn't working
 *   4. Six-stage system    → the central idea: a system, not a pile of PDFs
 *   5. Bundle gallery      → exactly what you receive
 *   6. Feature deep-dives  → proof of depth, one idea at a time
 *   7. Preparation modes   → defuses "619 pages is too much"
 *   8. Preview + audience  → see it, and check it fits you
 *   9. Pricing + FAQ       → decide, with objections answered
 *  10. Final CTA           → close on control, not fear
 *
 * CTA placement follows §47: after decision points only, never every two
 * paragraphs. They sit in the hero, the system section, the frameworks section,
 * the bundle, the mock section, pricing and the final close.
 */

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const variant = resolveVariant(params.v ?? params.variant);

  // Product schema for rich results. Price is omitted until it is real, because
  // structured data containing "[PRICE]" would be invalid and could be flagged.
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: siteConfig.PRODUCT_NAME,
    brand: { "@type": "Brand", name: siteConfig.BRAND_NAME },
    description: `A ${siteConfig.TOTAL_PRODUCTS}-resource, ${siteConfig.TOTAL_PAGES}-page interview preparation system covering interview questions, answer frameworks, STAR examples, spoken communication, mock interviews, company research, interview day, follow-up and salary negotiation.`,
    category: "Educational digital product",
    isFamilyFriendly: true,
    hasPart: products.map((p) => ({
      "@type": "Book",
      name: p.title,
      numberOfPages: p.pages,
      bookFormat: "https://schema.org/EBook",
    })),
    offers: {
      "@type": "Offer",
      url: siteConfig.SITE_URL,
      priceCurrency: pricing.CURRENCY,
      // The CURRENT selling price — never ₹5,688, which is a sum of separate items.
      price: pricing.BUNDLE_SPECIAL_PRICE,
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: siteConfig.BRAND_NAME },
    },
    // NOTE: aggregateRating / review are deliberately absent. Structured data
    // ratings must reflect genuine collected reviews; there are none yet.
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <ConfigWarning />

      <main id="main" className="pb-[var(--sticky-bar-height)] lg:pb-0">
        <Hero variant={variant} />
        <TrustStrip />
        <FactStrip />

        <PainSection />
        <PreparationComparison />

        {/* The signature section */}
        <SixStageSystem />

        <BundleGallery />
        <WhatYouGet699 />

        {/* Feature deep-dives */}
        <QuestionFrameworkSection />
        <StarSection />
        <EnglishSection />
        <TellMeAboutYourselfSection />
        <DifficultQuestionsSection />
        <AnswerBuilderSection />
        <MockInterviewSection />
        <ResearchSection />

        {/* Defusing the size objection */}
        <PreparationModes />

        <InterviewDaySection />
        <SalarySection />
        <ToolkitSection />

        <PreviewGallery />
        <FreeContentObjection />
        <AudienceSection />

        {/* Renders nothing until genuine testimonials exist */}
        <Testimonials />

        <ValueComparison />
        <PricingSection />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
      <StickyMobileCTA />
    </>
  );
}
