"use client";

import { useState } from "react";
import { siteConfig, isPlaceholder, supportMailto } from "@/lib/site-config";
import { pricing, displayPrices } from "@/lib/pricing";
import { track } from "@/lib/analytics";

/**
 * FAQ (brief §36).
 *
 * Every objection listed in §6 is answered here, and the answers that matter
 * most for trust — guarantees, refunds, technical scope, what "500 questions"
 * really means — are answered honestly rather than optimistically. Native
 * <details>/<summary> gives keyboard and screen-reader behaviour for free.
 */

interface FaqItem {
  q: string;
  a: React.ReactNode;
}

export default function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null);
  const mailto = supportMailto(`Support — ${siteConfig.PRODUCT_NAME}`);

  const faqs: FaqItem[] = [
    {
      q: `Is ${displayPrices.special} for one book or the complete bundle?`,
      a: (
        <>
          {displayPrices.special} is the current special price for the{" "}
          <strong>complete {siteConfig.PRODUCT_NAME} bundle</strong> containing all{" "}
          {siteConfig.TOTAL_PRODUCTS} listed resources — {siteConfig.TOTAL_PAGES} pages in
          total. It is not the price of a single book.
        </>
      ),
    },
    {
      q: "Are all 12 resources included?",
      a: `Yes. All ${siteConfig.TOTAL_PRODUCTS} listed digital resources are included in the ${displayPrices.special} bundle. Nothing is held back as a separate upsell.`,
    },
    {
      q: `Is ${displayPrices.special} a one-time payment?`,
      a: "Yes. It is a single one-time purchase, not a subscription. There is no recurring charge, no renewal and no auto-debit.",
    },
    {
      q: "What is the combined individual regular value?",
      a: (
        <>
          The listed individual regular prices of the {siteConfig.TOTAL_PRODUCTS} resources
          total {displayPrices.individualRegular}. That figure is the sum of twelve separate
          listings — it is not a former price of the bundle itself. The bundle&apos;s own
          regular price is {displayPrices.bundleRegular}.
        </>
      ),
    },
    {
      q: "What would all 12 cost at the individual special prices?",
      a: `The ${siteConfig.TOTAL_PRODUCTS} listed individual special prices total ${displayPrices.individualSpecial}.`,
    },
    ...(pricing.SHOW_BUNDLE_REGULAR_PRICE
      ? [
          {
            q: "What is the regular bundle price?",
            a: `The regular ${siteConfig.PRODUCT_NAME} bundle price is ${displayPrices.bundleRegular}. The current special price is ${displayPrices.special}, so you save ${displayPrices.savings} against the regular bundle price.`,
          },
        ]
      : []),
    {
      q: "Will I receive physical books?",
      a: `No. ${siteConfig.PRODUCT_NAME} is a digital product delivered as PDF files. The 3D book images on this page are visual representations of the included digital guides, workbooks and toolkits — nothing is shipped.`,
    },
    {
      q: "What exactly do I receive?",
      a: (
        <>
          {siteConfig.TOTAL_PRODUCTS} digital resources totalling {siteConfig.TOTAL_PAGES} pages,
          delivered as PDF files in a Google Drive folder: a 166-page handbook, a 500-question bank
          with 14 frameworks, 100 STAR examples, an interview English guide, playbooks for “Tell me
          about yourself”, difficult questions and salary negotiation, plus mock interview, company
          research and answer-building workbooks and 30 templates, checklists and trackers.
        </>
      ),
    },
    {
      q: `Is it really ${siteConfig.TOTAL_PAGES} pages?`,
      a: "Yes, and the number is the sum of the actual files: 166 + 71 + 144 + 53 + 22 + 25 + 20 + 35 + 20 + 20 + 18 + 25 = 619 pages across 12 resources. The page counts for each resource are listed on this page.",
    },
    {
      q: `Do I need to read all ${siteConfig.TOTAL_PAGES} pages?`,
      a: "No, and you are not expected to. Much of the library is reference material, examples, worksheets and trackers that you dip into. There are 7-day, 24-hour and final-hour plans that tell you exactly which parts to use for the time you have.",
    },
    {
      q: "Is this useful for fresh graduates?",
      a: "Yes. The handbook, the STAR examples and the answer-building worksheets are specifically helpful when you do not yet have years of work experience — they help you build answers from projects, internships and coursework. The Tell Me About Yourself playbook has a dedicated fresh-graduate section.",
    },
    {
      q: "Is this useful for experienced professionals?",
      a: "Yes. Experienced candidates typically get the most from the evidence bank, the difficult-questions guide, the company research system and the salary negotiation guide — the areas where interviews are actually won or lost once basics are assumed.",
    },
    {
      q: "Can career switchers and return-to-work candidates use it?",
      a: "Yes. Both the Tell Me About Yourself playbook and the difficult-questions guide include specific guidance for career changes, career gaps and returning to work after a break.",
    },
    {
      q: "Does it contain 500 memorised scripts?",
      a: "No — and that is deliberate. It contains 500 questions plus 14 answer frameworks and a 12-story evidence bank. The approach is to prepare the pattern and your own evidence, then adapt, because memorised scripts fall apart the moment a question is phrased differently.",
    },
    {
      q: "What is STAR?",
      a: "STAR is a structure for answering behavioural questions: Situation, Task, Action, Result. This bundle uses STAR+, which adds a brief Reflection at the end. The 100 worked examples show the structure applied across 10 competency areas.",
    },
    {
      q: "Are the 100 STAR answers meant to be copied?",
      a: "No. They are there so you can see what a strong answer looks like structurally. The instruction throughout is: borrow the structure, replace the story. Copying someone else's experience into an interview is both dishonest and easy for an interviewer to unravel with one follow-up question.",
    },
    {
      q: "Will it help if my English isn't perfect?",
      a: "That is what Interview English Mastery is for. It focuses on being clearly understood — organising answers, shortening sentences, reducing filler words, managing pace, asking for clarification and recovering when stuck. It is not accent elimination, not a grammar textbook, and it will not make anyone instantly fluent.",
    },
    {
      q: "Does this cover technical interview preparation?",
      a: "Not directly. The system covers interview strategy, communication, behavioural and situational preparation, evidence building, company research, practice, interview day, follow-up and negotiation. Role-specific technical preparation — coding rounds, domain tests, case studies — will still be required separately.",
    },
    {
      q: "Does it include mock interviews?",
      a: "It includes a Mock Interview Workbook with five structured mock formats and a scoring system you use yourself or with a friend. It does not include a live human interviewer or any one-to-one session.",
    },
    {
      q: "Does it include salary negotiation?",
      a: "Yes — a 20-page guide covering compensation preparation, the target/workable-range/private-floor model, salary expectation questions, offer evaluation, counteroffer scripts and email templates, multiple offers, and how to accept or decline professionally.",
    },
    {
      q: "How do I receive the files, and can I download them?",
      a: "After your payment is verified you are taken to an access page with your bundle link. The files are in Google Drive, and you can download them to your device or keep them in Drive to read on your phone.",
    },
    {
      q: "Is payment secure?",
      a: "Payment is processed by Razorpay, a widely used Indian payment gateway. Your card or UPI details are entered on Razorpay's own secure checkout and are never seen or stored by us. Every payment is verified on our server before access is released.",
    },
    {
      q: "Will this guarantee I get a job?",
      a: "No. No interview preparation product can ethically guarantee an employment outcome, and anyone promising one is not being straight with you. Hiring decisions depend on the role, the competition, the interviewer, timing and many other factors outside your control. What this system is designed to do is help you prepare more systematically, build clearer evidence-based answers and practise before the interview.",
    },
    {
      q: "What if my payment succeeds but I cannot access the bundle?",
      a: (
        <>
          Contact support with your payment ID and we will restore your access manually. Your payment
          is recorded on our side as soon as Razorpay confirms it, independently of whether your
          browser completed the redirect — so a lost connection at the wrong moment does not lose
          your purchase.{" "}
          {mailto ? (
            <a href={mailto} className="font-semibold text-teal-700 underline">
              Email support
            </a>
          ) : (
            <span className="font-semibold">[Configure SUPPORT_EMAIL]</span>
          )}
        </>
      ),
    },
    {
      q: "What is the refund policy?",
      a: (
        <>
          {isPlaceholder(siteConfig.REFUND_POLICY_SUMMARY) ? (
            <span className="rounded bg-amber-50 px-2 py-1 text-amber-900">
              [ACTUAL REFUND POLICY — set REFUND_POLICY_SUMMARY in site-config.ts. Do not publish
              this page without a real policy.]
            </span>
          ) : (
            siteConfig.REFUND_POLICY_SUMMARY
          )}{" "}
          {!isPlaceholder(siteConfig.REFUND_POLICY_URL) && (
            <a
              href={siteConfig.REFUND_POLICY_URL}
              className="font-semibold text-teal-700 underline"
            >
              Read the full refund policy
            </a>
          )}
        </>
      ),
    },
  ];

  return (
    <section id="faq" className="section bg-sand">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Questions</p>
          <h2 className="h2 mt-3">Before you buy</h2>
        </div>

        <div className="mx-auto mt-10 max-w-3xl space-y-2">
          {faqs.map((faq, index) => {
            const id = `faq-${index}`;
            return (
              <details
                key={id}
                className="group card overflow-hidden"
                open={openId === id}
                onToggle={(e) => {
                  const open = (e.currentTarget as HTMLDetailsElement).open;
                  if (open) {
                    setOpenId(id);
                    track("FAQ_Open", { question: faq.q });
                  } else if (openId === id) {
                    setOpenId(null);
                  }
                }}
              >
                <summary className="flex min-h-[3rem] cursor-pointer list-none items-center justify-between gap-4 p-4 text-fluid-base font-semibold text-navy-950 marker:hidden sm:p-5">
                  {faq.q}
                  <svg
                    className="h-5 w-5 shrink-0 text-teal-600 transition-transform group-open:rotate-45"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M9 4h2v5h5v2h-5v5H9v-5H4V9h5V4z" />
                  </svg>
                </summary>
                <div className="border-t border-navy-100 p-4 text-fluid-sm leading-relaxed text-ink-soft sm:p-5">
                  {faq.a}
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}
