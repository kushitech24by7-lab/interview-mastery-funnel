"use client";

import { useEffect, useState } from "react";
import { siteConfig, isPlaceholder } from "@/lib/site-config";
import { track, trackVerifiedPurchase } from "@/lib/analytics";

/**
 * Client island on the verified success page (brief §34, §35, §46).
 *
 *  • Fires the Purchase pixel — this is the ONLY place it fires, and only after
 *    the server has already verified the signature to render this page.
 *  • Fetches the Google Drive link from /api/access, which re-validates the
 *    signed token server-side. The URL is never embedded in the page source.
 *  • Routes the buyer to the right starting point based on when their interview
 *    is, which turns a receipt into something immediately useful.
 */

interface Props {
  orderId: string;
  paymentId: string;
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

export default function SuccessClient({ orderId, paymentId }: Props) {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [timing, setTiming] = useState<TimingKey | null>(null);

  // Purchase pixel — verified path only.
  useEffect(() => {
    const value = siteConfig.PRICE_IN_PAISE > 0 ? siteConfig.PRICE_IN_PAISE / 100 : 0;
    trackVerifiedPurchase({ orderId, paymentId, value, currency: siteConfig.CURRENCY });
    track("PaymentSuccess", { orderId });
  }, [orderId, paymentId]);

  // Fetch the delivery link against the signed token.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/access", { credentials: "include" });
        const data = await response.json();
        if (cancelled) return;
        if (response.ok && data.downloadUrl) {
          setDownloadUrl(data.downloadUrl);
          setState("ready");
        } else {
          setState("error");
          setErrorMessage(data?.message || "We could not load your bundle link.");
        }
      } catch {
        if (!cancelled) {
          setState("error");
          setErrorMessage("We could not reach the server to load your bundle link.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const supportHref = isPlaceholder(siteConfig.SUPPORT_EMAIL)
    ? null
    : `mailto:${siteConfig.SUPPORT_EMAIL}?subject=${encodeURIComponent(
        `Access issue — order ${orderId}`
      )}`;

  return (
    <div className="mt-6 space-y-6">
      {/* ── Access card ── */}
      <div className="card p-6 sm:p-8">
        <h2 className="text-fluid-xl font-bold text-navy-950">Your bundle</h2>

        {state === "loading" && (
          <div className="mt-4 flex items-center gap-3 text-fluid-sm text-ink-soft" role="status">
            <svg className="h-5 w-5 animate-spin text-teal-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
            </svg>
            Preparing your access link…
          </div>
        )}

        {state === "ready" && downloadUrl && (
          <>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("Access_Click", { orderId })}
              className="btn-primary mt-4 w-full sm:w-auto"
            >
              Access Complete Interview Mastery
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M11 3h6v6h-2V6.4l-7.3 7.3-1.4-1.4L13.6 5H11V3zM5 5h3v2H6v7h7v-2h2v4H5V5z" />
              </svg>
            </a>

            {/* Delivery steps (§34) */}
            <ol className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { n: 1, title: "Open the bundle", detail: "The link opens your Google Drive folder." },
                { n: 2, title: "Save or download", detail: "Download the PDFs, or keep them in Drive for your phone." },
                { n: 3, title: "Choose your path", detail: "Pick the plan that matches your interview timing below." },
                { n: 4, title: "Start practising", detail: "Say your answers out loud — that is where it works." },
              ].map((step) => (
                <li key={step.n} className="flex gap-3 rounded-xl border border-navy-100 bg-sand p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-950 text-fluid-xs font-bold text-white">
                    {step.n}
                  </span>
                  <div>
                    <p className="text-fluid-sm font-semibold text-navy-950">{step.title}</p>
                    <p className="mt-0.5 text-fluid-xs text-ink-soft">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>

            <p className="mt-5 rounded-lg bg-navy-50 p-3 text-fluid-xs text-ink-soft">
              <strong className="text-navy-900">Tip:</strong> bookmark this page or save the Drive
              link now. Your access link on this page stays valid for 7 days.
            </p>
          </>
        )}

        {state === "error" && (
          <div role="alert" className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
            <p className="text-fluid-sm font-semibold text-amber-900">{errorMessage}</p>
            <p className="mt-1.5 text-fluid-sm text-amber-900">
              Your payment has been received and recorded. Please contact support with your payment
              ID and we will send your bundle link directly.
            </p>
            <p className="mt-2 font-mono text-fluid-xs text-amber-900">Payment ID: {paymentId}</p>
            {supportHref && (
              <a href={supportHref} className="btn-secondary mt-3">
                Contact support
              </a>
            )}
          </div>
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
