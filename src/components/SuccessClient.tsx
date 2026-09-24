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
      {/* ── Delivery status card ── */}
      <div className="card p-6 sm:p-8">
        <h2 className="text-fluid-xl font-bold text-navy-950">Your access is on its way</h2>

        {/*
          The Google Drive link is deliberately NOT rendered here. Delivery is
          by email, so the link lives only in the message sent to the verified
          buyer's address — never in this page's HTML, its JS bundle or a query
          string, any of which would make it shareable by anyone who reached
          this URL.
        */}
        {delivered ? (
          <p className="mt-3 text-fluid-sm leading-relaxed text-ink-soft">
            We have sent your {siteConfig.PRODUCT_NAME} access
            {customerEmail ? " to " : "."}
            {customerEmail && <strong className="text-navy-950">{customerEmail}</strong>}
            {customerEmail && "."}
          </p>
        ) : (
          <p className="mt-3 text-fluid-sm leading-relaxed text-ink-soft">
            Your purchase is confirmed. We are sending your {siteConfig.PRODUCT_NAME} access
            {customerEmail ? " to " : " to your email address"}
            {customerEmail && <strong className="text-navy-950">{customerEmail}</strong>}
            . If it has not arrived shortly, contact support and we will send it straight away.
          </p>
        )}

        <p className="mt-4 rounded-lg bg-navy-50 p-3 text-fluid-sm text-ink-soft">
          Please check your <strong className="text-navy-900">Inbox</strong>,{" "}
          <strong className="text-navy-900">Promotions</strong> and{" "}
          <strong className="text-navy-900">Spam</strong> folders. We recommend saving the email
          for future access.
        </p>

        {supportHref && (
          <p className="mt-4 text-fluid-sm text-ink-soft">
            Need help?{" "}
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
