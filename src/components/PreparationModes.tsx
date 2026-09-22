"use client";

import { useState } from "react";
import { siteConfig } from "@/lib/site-config";
import { track } from "@/lib/analytics";

/**
 * Three preparation modes (brief §22 + §38).
 *
 * This section does the single most important defensive job on the page: it
 * converts "619 pages" from an intimidating obligation into optional depth.
 * The tab interface is deliberate — the visitor self-selects their situation,
 * which makes the answer feel personal rather than generic.
 *
 * Accessibility: implemented as a proper ARIA tablist with arrow-key support
 * (brief §49), not a set of divs that merely look like tabs.
 */

type ModeKey = "week" | "tomorrow" | "now";

interface Mode {
  key: ModeKey;
  tab: string;
  headline: string;
  tool: string;
  intro: string;
  steps: { label: string; detail: string }[];
  footnote: string;
}

const modes: Mode[] = [
  {
    key: "week",
    tab: "I have a week",
    headline: "Seven days is enough to prepare properly.",
    tool: "7-Day Preparation Planner (included in P12)",
    intro: "One focused task per day, so nothing is left to the last evening.",
    steps: [
      { label: "Day 7", detail: "Understand the role and decode the job description" },
      { label: "Day 6", detail: "Company research using the 45-minute system" },
      { label: "Day 5", detail: "Build your evidence bank and core stories" },
      { label: "Day 4", detail: "Prepare your core answers, including Tell Me About Yourself" },
      { label: "Day 3", detail: "Work through your difficult questions" },
      { label: "Day 2", detail: "Run a scored mock interview" },
      { label: "Day 1", detail: "Final review, logistics and interview-day plan" },
    ],
    footnote: "You will use perhaps a quarter of the library — the quarter that matters for this interview.",
  },
  {
    key: "tomorrow",
    tab: "My interview is tomorrow",
    headline: "You have one evening. Spend it on the right things.",
    tool: "24-Hour Planner (included in P12)",
    intro: "Not everything. Just the five things that change tomorrow's outcome.",
    steps: [
      { label: "Five stories", detail: "Pick and rehearse five experiences that cover most questions" },
      { label: "Three fit points", detail: "Why this role, why this company, why you" },
      { label: "Five questions", detail: "Prepare what you will ask them" },
      { label: "Logistics", detail: "Route, timing, documents, or your virtual setup" },
      { label: "Backup plan", detail: "What you do if the technology fails" },
    ],
    footnote: "Open three resources, not twelve. The planner tells you which three.",
  },
  {
    key: "now",
    tab: "My interview is about to start",
    headline: "The final hour has its own sequence.",
    tool: "Final 60-Minute sequence (P11) + Final 10-Minute Revision Card (P12)",
    intro: "Designed to be opened on your phone while you wait, not studied in advance.",
    steps: [
      { label: "Final 60 minutes", detail: "A structured sequence for the last hour before you go in" },
      { label: "Final 10 minutes", detail: "One revision card: your stories, your fit points, your questions" },
      { label: "Five-minute reset", detail: "A short routine for when nerves spike" },
      { label: "During the interview", detail: "Listen, clarify, think, answer directly, use evidence, stop" },
    ],
    footnote: "Nothing to read cover-to-cover. Two pages, right when you need them.",
  },
];

export default function PreparationModes() {
  const [active, setActive] = useState<ModeKey>("week");
  const activeMode = modes.find((m) => m.key === active)!;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const index = modes.findIndex((m) => m.key === active);
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setActive(modes[(index + 1) % modes.length].key);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      setActive(modes[(index - 1 + modes.length) % modes.length].key);
    }
  };

  return (
    <section id="how-to-use" className="section bg-sand">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Using it realistically</p>
          <h2 className="h2 mt-3">
            You do not have to read {siteConfig.TOTAL_PAGES} pages before your interview.
          </h2>
          <p className="lede mx-auto mt-4">
            The library contains teaching, reference material, examples, worksheets and trackers.
            You use the parts that match the time you actually have.
          </p>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Choose your preparation timeline"
          onKeyDown={handleKeyDown}
          className="mx-auto mt-10 flex max-w-3xl flex-col gap-2 sm:flex-row"
        >
          {modes.map((mode) => {
            const selected = mode.key === active;
            return (
              <button
                key={mode.key}
                role="tab"
                id={`tab-${mode.key}`}
                aria-selected={selected}
                aria-controls={`panel-${mode.key}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => {
                  setActive(mode.key);
                  track("BundleSection_View", { section: "prep_mode", mode: mode.key });
                }}
                className={`min-h-[3rem] flex-1 rounded-xl px-4 py-3 text-fluid-sm font-semibold transition-colors ${
                  selected
                    ? "bg-navy-950 text-white shadow-card"
                    : "border border-navy-200 bg-white text-navy-800 hover:border-navy-300"
                }`}
              >
                {mode.tab}
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <div
          role="tabpanel"
          id={`panel-${activeMode.key}`}
          aria-labelledby={`tab-${activeMode.key}`}
          className="mx-auto mt-6 max-w-3xl"
        >
          <div className="card overflow-hidden">
            <div className="border-b border-navy-100 bg-navy-950 p-6 text-white">
              <h3 className="text-fluid-xl font-bold text-white">{activeMode.headline}</h3>
              <p className="mt-2 text-fluid-sm text-navy-200">{activeMode.intro}</p>
              <p className="mt-3 inline-flex rounded-lg bg-white/10 px-3 py-1.5 text-fluid-xs font-semibold text-amber-400">
                {activeMode.tool}
              </p>
            </div>

            <ol className="divide-y divide-navy-100">
              {activeMode.steps.map((step) => (
                <li key={step.label} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 p-4 sm:p-5">
                  <span className="w-[6.5rem] shrink-0 text-fluid-sm font-bold text-teal-700">
                    {step.label}
                  </span>
                  <span className="flex-1 text-fluid-sm text-ink">{step.detail}</span>
                </li>
              ))}
            </ol>

            <p className="bg-sand p-4 text-center text-fluid-sm italic text-ink-soft sm:p-5">
              {activeMode.footnote}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
