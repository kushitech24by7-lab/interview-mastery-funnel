"use client";

import { useEffect, useState } from "react";
import { siteConfig, isPlaceholder } from "@/lib/site-config";
import { track, trackVerifiedPurchase } from "@/lib/analytics";

/**
 * Client island on the verified success page (brief §34, §35, §46).
 *
 *  • Fires the Purchase pixel — this is the ONLY place it fires, and only after
 *    the server has already verified the signature to render this page.
 *  • Shows WHERE the product was emailed, and never the Drive link itself.
 *    Delivery moved to email, so the link exists only in the message sent to
 *    the verified buyer — not in this page's HTML, its JS bundle or a query
 *    string. (/api/access still exists, cookie-gated, as a support fallback;
 *    this component no longer calls it.)
 *  • Routes the buyer to the right starting point based on when their interview
 *    is, which turns a receipt into something immediately useful.
 */

interface Props {
  orderId: string;
  paymentId: string;
  /** Whether the provider accepted the delivery email. Server-decided. */
  delivered?: boolean;
  /**
   * The recipient, as recorded on the verified Razorpay order. Comes from the
   * server, never from the URL — so it cannot be spoofed by editing the query
   * string to make the page claim delivery to another address.
   */
  customerEmail?: string;
}

type TimingKey = "week" | "tomorrow" | "today" | "none";

const timings: { key: TimingKey; label: string; heading: string; steps: string[] }[] = [
  {
    key: "week",
    label: "7+ days away",
    heading: "Start with the 7-Day Preparation Planner",
    steps: [
      "Open P12 — Templates, Checklists & Trackers, and find the 7-Day Planner",
      "Use P09 — Company Research Workbook for the 45-minute research system",
      "Build your stories with P10 — Answer Builder Worksheets",
      "Book a scored mock with P08 on day 2",
    ],
  },
  {
    key: "tomorrow",
    label: "Tomorrow",
    heading: "Open the 24-Hour Planner",
    steps: [
      "Open P12 and go straight to the 24-Hour Planner",
      "Pick five stories from P04 — 100 STAR Answer Examples as models",
      "Prepare your Tell Me About Yourself answer with P05",
      "Run the logistics checklist in P11 tonight, not tomorrow morning",
    ],
  },
  {
    key: "today",
    label: "Today",
    heading: "Use the Interview Day Toolkit",
    steps: [
      "Open P11 — Interview Day + Follow-Up Toolkit and start the Final 60-Minute sequence",
      "Keep the Final 10-Minute Revision Card from P12 open on your phone",
      "Use the five-minute reset routine just before you go in",
      "Do not try to read anything new now — revise what you already know",
    ],
  },
  {
    key: "none",
    label: "Nothing scheduled yet",
    heading: "Build your foundation first",
    steps: [
      "Start with P01 — Complete Interview Mastery Handbook",
      "Build your evidence bank with P10 — Answer Builder Worksheets",
      "Work through the 14-day plan in P02 — Interview English Mastery",
      "You will be ready before the interview exists, which is the ideal position",
    ],
  },
];

export default function SuccessClient({ orderId, paymentId, delivered = false, customerEmail }: Props) {
  const [timing, setTiming] = useState<TimingKey | null>(null);

  // Purchase pixel — verified path only.
  useEffect(() => {
    const value = siteConfig.PRICE_IN_PAISE > 0 ? siteConfig.PRICE_IN_PAISE / 100 : 0;
    trackVerifiedPurchase({ orderId, paymentId, value, currency: siteConfig.CURRENCY });
    track("PaymentSuccess", { orderId });
  }, [orderId, paymentId]);

  const supportHref = isPlaceholder(siteConfig.SUPPORT_EMAIL)
    ? null
    : `mailto:${siteConfig.SUPPORT_EMAIL}?subject=${encodeURIComponent(
        `Access issue — order ${orderId}`
      )}`;

  return (
    <div className="mt-6 space-y-6">
      {/* ── Bundle delivery card ── */}
      <div className="overflow-hidden rounded-xl2 border-2 border-teal-600/25 bg-white shadow-lift">
        <div className="bg-gradient-to-br from-navy-950 to-navy-900 p-6 text-center sm:p-8">
          <span
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-500"
            aria-hidden="true"
          >
            <svg className="h-7 w-7 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <h2 className="mt-4 text-fluid-xl font-bold text-white">{siteConfig.PRODUCT_NAME}</h2>
          <p className="mt-1.5 text-fluid-sm text-navy-200">
            Your complete preparation system is ready.
          </p>

          <ul className="mx-auto mt-5 grid max-w-sm grid-cols-2 gap-x-4 gap-y-1.5 text-fluid-xs text-navy-100">
            <li>{siteConfig.TOTAL_PRODUCTS} resources</li>
            <li>{siteConfig.TOTAL_PAGES} pages</li>
            <li>{siteConfig.TOTAL_QUESTIONS} questions</li>
            <li>{siteConfig.TOTAL_STAR_EXAMPLES} STAR examples</li>
            <li>{siteConfig.TOTAL_FRAMEWORKS} answer frameworks</li>
            <li>{siteConfig.TOTAL_SPOKEN_DRILLS} practice drills</li>
          </ul>
        </div>

        <div className="p-6 text-center sm:p-8">
          {/*
            The CTA points at /api/access-bundle, NOT at Google Drive.
            That route re-checks the signed purchase cookie server-side and
            only then redirects. Putting the Drive URL in this href would ship
            the paid deliverable inside the page HTML and the JS bundle, where
            View Source is enough to take it without paying.
          */}
          <a
            href="/api/access-bundle"
            onClick={() => track("Access_Click", { orderId })}
            className="btn-primary w-full text-center sm:w-auto"
          >
            Open your Complete Interview bundle
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M11 3h6v6h-2V6.4l-7.3 7.3-1.4-1.4L13.6 5H11V3zM5 5h3v2H6v7h7v-2h2v4H5V5z" />
            </svg>
          </a>
          <p className="mt-2.5 text-fluid-xs text-ink-faint">Google Drive · Instant access</p>

          {/*
            Email status must reflect what the provider ACTUALLY reported.
            Saying "we've sent it" when the send failed would send the buyer
            hunting through a spam folder for a message that does not exist.
          */}
          <div className="mt-6 rounded-lg bg-sand p-4 text-left">
            {delivered ? (
              <>
                <p className="text-fluid-sm text-ink-soft">
                  We have also sent your access link to{" "}
                  {customerEmail ? (
                    <strong className="text-navy-950">{customerEmail}</strong>
                  ) : (
                    "your email address"
                  )}
                  .
                </p>
                <p className="mt-1.5 text-fluid-xs text-ink-faint">
                  Please check your Inbox, Promotions and Spam folders, and save the email so you
                  can return to your resources later.
                </p>
              </>
            ) : (
              <>
                <p className="text-fluid-sm font-semibold text-navy-950">
                  Your payment is confirmed and your bundle is available above.
                </p>
                <p className="mt-1.5 text-fluid-xs leading-relaxed text-ink-soft">
                  We could not confirm email delivery right now, so please open the bundle above
                  and save the Drive folder to your own account.
                  {supportHref && " If you need assistance, contact support."}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Start here ── */}
      <div className="card p-6 sm:p-8">
        <h2 className="text-fluid-lg font-bold text-navy-950">Start here</h2>
        <ol className="mt-4 space-y-2.5">
          {[
            "Open the Complete Interview Mastery bundle above.",
            "Begin with P01 — the Complete Interview Mastery Handbook.",
            "Build your evidence bank and STAR stories with P10.",
            "Follow the 7-day preparation plan in P12 before your interview.",
          ].map((step, i) => (
            <li key={step} className="flex gap-3 text-fluid-sm text-ink-soft">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-950 text-fluid-xs font-bold text-white">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>

        {supportHref && (
          <p className="mt-5 border-t border-navy-100 pt-4 text-fluid-sm text-ink-soft">
            Questions or access problems?{" "}
            <a href={supportHref} className="font-semibold text-teal-700 underline">
              {siteConfig.SUPPORT_EMAIL}
            </a>
          </p>
        )}
      </div>

      {/* ── Interview timing router (§35) ── */}
      <div className="card p-6 sm:p-8">
        <h2 className="text-fluid-xl font-bold text-navy-950">When is your interview?</h2>
        <p className="mt-1.5 text-fluid-sm text-ink-soft">
          Pick one and we will tell you exactly where to start.
        </p>

        <div className="mt-5 grid gap-2 sm:grid-cols-4">
          {timings.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => {
                setTiming(option.key);
                track("Access_Click", { timing: option.key });
              }}
              aria-pressed={timing === option.key}
              className={`min-h-[3rem] rounded-xl px-4 py-3 text-fluid-sm font-semibold transition-colors ${
                timing === option.key
                  ? "bg-navy-950 text-white"
                  : "border border-navy-200 bg-white text-navy-800 hover:border-navy-400"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {timing && (
          <div className="mt-5 rounded-xl2 border-2 border-teal-200 bg-teal-50 p-5">
            <h3 className="text-fluid-lg font-bold text-navy-950">
              {timings.find((t) => t.key === timing)!.heading}
            </h3>
            <ol className="mt-4 space-y-2.5">
              {timings
                .find((t) => t.key === timing)!
                .steps.map((step, index) => (
                  <li key={step} className="flex gap-3 text-fluid-sm text-ink">
                    <span className="font-bold text-teal-700">{index + 1}.</span>
                    {step}
                  </li>
                ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
