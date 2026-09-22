"use client";

import ProductCover from "./ProductCover";
import { productByCode } from "@/lib/products";
import { formatINR, displayPrices } from "@/lib/pricing";

/**
 * Interview day, salary, toolkit, audience and fit (brief §23–§27).
 *
 * The "who this is NOT for" section is unusual on a sales page and is kept
 * deliberately honest: it disqualifies the wrong buyer, which raises trust with
 * the right one and reduces refund requests.
 */

const dayTimeline = [
  { stage: "One week before", detail: "Preparation plan, research, evidence" },
  { stage: "24 hours before", detail: "Core answers, logistics, documents" },
  { stage: "Final 60 minutes", detail: "A structured pre-interview sequence" },
  { stage: "Final 5 minutes", detail: "A short reset routine" },
  { stage: "The interview", detail: "Listen, clarify, answer with evidence, stop" },
  { stage: "Post-interview debrief", detail: "What worked, what to fix" },
  { stage: "Follow-up", detail: "Thank-you message and next-round preparation" },
];

export function InterviewDaySection() {
  const p11 = productByCode("P11");
  return (
    <section className="section bg-white">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">P11 · 18 pages</p>
          <h2 className="h2 mt-3">Preparation should not fall apart in the final hour.</h2>
        </div>

        {/* The real P11 cover anchors this section (§27). */}
        <div className="mx-auto mt-10 grid max-w-4xl items-start gap-8 lg:grid-cols-[260px_1fr]">
          <div className="mx-auto w-48 lg:w-full">
            {p11 && <ProductCover product={p11} sizes="(max-width: 1024px) 192px, 260px" />}
            {p11 && (
              <div className="mt-4 text-center lg:text-left">
                <p className="text-fluid-xs font-bold uppercase tracking-wider text-teal-700">
                  {p11.code} · {p11.pages} pages
                </p>
                <p className="mt-1 text-fluid-sm font-semibold text-navy-950">{p11.title}</p>
                <p className="mt-2 text-fluid-xs text-ink-faint">
                  Regular {formatINR(p11.regularPrice)} · Special{" "}
                  {formatINR(p11.specialPrice)}
                </p>
                <p className="mt-1.5 text-fluid-xs font-bold text-teal-700">
                  Included in the {displayPrices.special} bundle
                </p>
              </div>
            )}
          </div>

        <ol className="max-w-2xl">
          {dayTimeline.map((item, index) => (
            <li key={item.stage} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Connector line */}
              {index < dayTimeline.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[0.6875rem] top-6 h-full w-px bg-navy-200"
                />
              )}
              <span
                aria-hidden="true"
                className={`relative z-10 mt-1 h-6 w-6 shrink-0 rounded-full border-4 border-white ${
                  index === 4 ? "bg-amber-500" : "bg-teal-600"
                } shadow-sm`}
              />
              <div className="flex-1 pt-0.5">
                <p className="text-fluid-base font-semibold text-navy-950">{item.stage}</p>
                <p className="mt-0.5 text-fluid-sm text-ink-soft">{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
        </div>

        <ul className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-2">
          {[
            "Virtual interview checklist",
            "In-person checklist",
            "Technology backup",
            "Documents",
            "Questions to ask",
            "Thank-you planner",
            "Next-round tracker",
          ].map((item) => (
            <li key={item} className="chip">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ── §24 — Salary ─────────────────────────────────────────────────────────────

const negotiationFlow = ["Appreciation", "Interest", "Evidence", "Request", "Openness"];

const compensationElements = [
  "Base",
  "Variable pay",
  "Bonus",
  "Benefits",
  "Role scope",
  "Learning",
  "Flexibility",
  "Location",
  "Start date",
  "Other terms",
];

export function SalarySection() {
  return (
    <section className="section bg-navy-950 text-white">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-teal-300">P07 · 20 pages · 12 chapters</p>
          <h2 className="h2 mt-3 text-white">
            The interview may end.
            <br />
            <span className="text-amber-400">The decision isn't always over.</span>
          </h2>
          <p className="lede mx-auto mt-4 text-navy-200">
            Negotiate from preparation, not emotion. That starts with knowing your three numbers
            before anyone asks.
          </p>
        </div>

        {/* Three-number model */}
        <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
          {[
            { label: "Target", detail: "What you are aiming for", tone: "border-amber-400 bg-amber-500/10" },
            { label: "Workable range", detail: "What you would accept", tone: "border-teal-400 bg-teal-500/10" },
            { label: "Private floor", detail: "Your own limit — never stated aloud", tone: "border-white/20 bg-white/[0.05]" },
          ].map((item) => (
            <div key={item.label} className={`rounded-xl2 border-2 ${item.tone} p-5 text-center`}>
              <p className="text-fluid-lg font-bold uppercase tracking-wide text-white">{item.label}</p>
              <p className="mt-2 text-fluid-sm text-navy-200">{item.detail}</p>
            </div>
          ))}
        </div>

        {/* Conversation flow */}
        <ol className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {negotiationFlow.map((step, index) => (
            <li key={step} className="flex items-center gap-2">
              <span className="rounded-lg border border-white/15 bg-white/[0.07] px-3 py-2 text-fluid-sm font-semibold text-white">
                {step}
              </span>
              {index < negotiationFlow.length - 1 && (
                <svg className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M4 9h9.2l-3.1-3.1 1.4-1.4L17 10l-5.5 5.5-1.4-1.4L13.2 11H4V9z" />
                </svg>
              )}
            </li>
          ))}
        </ol>

        <div className="mx-auto mt-10 max-w-3xl rounded-xl2 border border-white/10 bg-white/[0.05] p-6">
          <p className="text-center text-fluid-sm font-semibold text-white">
            An offer is more than one number
          </p>
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {compensationElements.map((element) => (
              <li
                key={element}
                className="rounded-full border border-white/15 px-3 py-1.5 text-fluid-xs text-navy-100"
              >
                {element}
              </li>
            ))}
          </ul>
        </div>

        <p className="mx-auto mt-6 max-w-xl text-center text-fluid-xs text-navy-300">
          This guide helps you prepare for compensation conversations. It does not promise any
          particular salary outcome.
        </p>
      </div>
    </section>
  );
}

// ── §25 — Toolkit ────────────────────────────────────────────────────────────

const tools = [
  "7-Day Preparation Planner",
  "24-Hour Planner",
  "Interview Preparation Master Checklist",
  "Application / Interview Tracker",
  "Competency Matrix",
  "Story Bank Tracker",
  "STAR Story Index",
  "Job Description Decoder",
  "Company Research Checklist",
  "Questions-to-Ask Tracker",
  "Mock Interview Score Tracker",
  "Recording Review Checklist",
  "Improvement Log",
  "Virtual Interview Checklist",
  "In-Person Checklist",
  "Documents Checklist",
  "Follow-Up Tracker",
  "Thank-You Planner",
  "Next-Round Tracker",
  "Offer Comparison",
  "Negotiation Preparation Sheet",
  "Decision Checklist",
  "Answer Framework Quick Card",
  "Final 10-Minute Revision Card",
];

export function ToolkitSection() {
  return (
    <section className="section bg-sand">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">P12 · 25 pages · 8 sections</p>
          <h2 className="h2 mt-3">
            Theory is useful.
            <br />
            <span className="text-teal-700">Execution is what you take into the interview.</span>
          </h2>
        </div>

        <ul className="mt-10 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <li
              key={tool}
              className="flex items-center gap-2.5 rounded-lg border border-navy-100 bg-white px-4 py-3 text-fluid-sm text-navy-900"
            >
              <svg
                className="h-4 w-4 shrink-0 text-teal-600"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M4 3h12v2H4V3zm0 4h12v2H4V7zm0 4h8v2H4v-2zm0 4h8v2H4v-2z" />
              </svg>
              {tool}
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center text-fluid-base font-semibold text-navy-950">
          30 reusable templates, checklists and trackers included.
        </p>
      </div>
    </section>
  );
}

// ── §26 + §27 — Who it is (and isn't) for ────────────────────────────────────

const audiences = [
  { title: "Fresh graduates", detail: "Build answers from projects, internships and coursework." },
  { title: "Campus placement candidates", detail: "Prepare for structured placement rounds." },
  { title: "First-time interviewees", detail: "Understand what is actually being tested." },
  { title: "Working professionals", detail: "Sharpen evidence and stop under-selling your work." },
  { title: "Job switchers", detail: "Explain your move and rebuild your fit story." },
  { title: "Career switchers", detail: "Make a transition sound deliberate, not random." },
  { title: "Return-to-work candidates", detail: "Address a gap truthfully and confidently." },
  { title: "Candidates improving communication", detail: "Clearer spoken answers under pressure." },
  { title: "Managers preparing for senior roles", detail: "Leadership, conflict and scope questions." },
];

const notFor = [
  "Someone expecting guaranteed placement",
  "Someone expecting it to replace technical role knowledge",
  "Someone who wants to copy answers word-for-word",
  "Someone who does not intend to practise",
  "Someone expecting others to build their personal stories",
  "Someone expecting guaranteed interview outcomes",
];

export function AudienceSection() {
  return (
    <section className="section bg-white">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Fit check</p>
          <h2 className="h2 mt-3">Who is this for?</h2>
          <p className="lede mx-auto mt-4">
            Different career stages need different parts of the library. Use the parts relevant to
            yours.
          </p>
        </div>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map((audience) => (
            <li key={audience.title} className="card p-5">
              <h3 className="text-fluid-base font-bold text-navy-950">{audience.title}</h3>
              <p className="mt-1.5 text-fluid-sm text-ink-soft">{audience.detail}</p>
            </li>
          ))}
        </ul>

        {/* Honest disqualification */}
        <div className="mx-auto mt-10 max-w-2xl rounded-xl2 border-2 border-navy-200 bg-sand p-6">
          <h3 className="text-fluid-lg font-bold text-navy-950">
            This may not be the right purchase if…
          </h3>
          <ul className="mt-4 space-y-2.5">
            {notFor.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-fluid-sm text-ink-soft">
                <svg
                  className="mt-1 h-3.5 w-3.5 shrink-0 text-navy-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M5.3 5.3a1 1 0 011.4 0L10 8.6l3.3-3.3a1 1 0 111.4 1.4L11.4 10l3.3 3.3a1 1 0 01-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 01-1.4-1.4L8.6 10 5.3 6.7a1 1 0 010-1.4z" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-fluid-sm font-medium text-navy-900">
            We would rather you know that before you buy than after.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── §37 — "I can get this free" ──────────────────────────────────────────────

const chain = [
  { from: "Question bank", to: "Framework" },
  { from: "Framework", to: "Personal evidence" },
  { from: "Evidence", to: "Worksheet" },
  { from: "Worksheet", to: "Spoken practice" },
  { from: "Practice", to: "Mock scoring" },
  { from: "Mock", to: "Improvement" },
  { from: "Interview", to: "Follow-up" },
  { from: "Offer", to: "Negotiation" },
];

export function FreeContentObjection() {
  return (
    <section className="section bg-sand">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">A fair question</p>
          <h2 className="h2 mt-3">“Can't I find interview advice online for free?”</h2>
          <p className="lede mx-auto mt-4">
            Absolutely, and much of it is good. The challenge is not the existence of information —
            it is turning scattered information into a process you can follow with a specific
            interview on a specific date.
          </p>
        </div>

        <ul className="mx-auto mt-10 grid max-w-3xl gap-2 sm:grid-cols-2">
          {chain.map((link) => (
            <li
              key={link.from}
              className="flex items-center gap-3 rounded-xl border border-navy-100 bg-white p-4"
            >
              <span className="text-fluid-sm font-semibold text-navy-900">{link.from}</span>
              <svg
                className="h-4 w-4 shrink-0 text-amber-500"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M4 9h9.2l-3.1-3.1 1.4-1.4L17 10l-5.5 5.5-1.4-1.4L13.2 11H4V9z" />
              </svg>
              <span className="text-fluid-sm font-semibold text-teal-700">{link.to}</span>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-8 max-w-xl text-center text-fluid-base font-medium text-navy-950">
          That chain is the product. Each link is a finished resource, and they are designed to hand
          off to each other.
        </p>
      </div>
    </section>
  );
}
