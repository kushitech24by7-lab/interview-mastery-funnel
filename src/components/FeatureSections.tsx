"use client";

import { useEffect, useRef } from "react";
import CheckoutButton from "./CheckoutButton";
import { frameworks, evidenceBank, questionCategories } from "@/lib/products";
import { observeSection } from "@/lib/analytics";

/**
 * Feature sections (brief §14–§21).
 *
 * Each one takes a single idea from the product and makes it visual. The
 * persuasion here is specificity: a visitor who can see the actual frameworks
 * and the actual recovery sequence believes the product exists in a way that
 * adjectives cannot achieve.
 *
 * NOTE ON DIAGRAMS: the flow diagrams below are visual explanations of concepts
 * taught in the product. They are NOT presented as screenshots of PDF pages
 * (brief §55). Real page previews live in <PreviewGallery>.
 */

// ── §14 — 500 questions ──────────────────────────────────────────────────────

export function QuestionFrameworkSection() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => observeSection(ref.current, "FrameworkSection_View", { section: "frameworks" }), []);

  return (
    <section ref={ref} className="section bg-sand">
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">P03 · 144 pages</p>
          <h2 className="h2 mt-3">
            500 questions.
            <br />
            <span className="text-teal-700">But you don't need 500 memorised answers.</span>
          </h2>
          <p className="lede mx-auto mt-4">
            Interview questions repeat patterns. Learn the pattern, build your evidence once, and
            adapt it to whatever version of the question you are actually asked.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Frameworks */}
          <div className="card p-6">
            <h3 className="text-fluid-lg font-bold text-navy-950">
              14 answer frameworks
            </h3>
            <p className="mt-1.5 text-fluid-sm text-ink-soft">
              Each framework tells you what shape the answer should take.
            </p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {frameworks.map((fw) => (
                <li
                  key={fw.name}
                  className="rounded-lg border border-navy-100 bg-white px-3 py-2.5"
                >
                  <p className="text-fluid-sm font-semibold leading-snug text-navy-900">{fw.name}</p>
                  <p className="mt-0.5 text-[0.7rem] text-ink-faint">{fw.use}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            {/* Evidence bank */}
            <div className="card bg-navy-950 p-6 text-white">
              <h3 className="text-fluid-lg font-bold text-white">12-story evidence bank</h3>
              <p className="mt-1.5 text-fluid-sm text-navy-200">
                One truthful experience can support several different questions, depending on what
                the interviewer is testing.
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {evidenceBank.map((story) => (
                  <li
                    key={story}
                    className="rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-fluid-xs font-medium text-navy-100"
                  >
                    {story}
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div className="card p-6">
              <h3 className="text-fluid-lg font-bold text-navy-950">
                500 questions across 11 categories
              </h3>
              <ul className="mt-4 space-y-1.5">
                {questionCategories.map((category) => (
                  <li key={category} className="flex items-center gap-2 text-fluid-sm text-ink-soft">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-teal-500" aria-hidden="true" />
                    {category}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <CheckoutButton label="Get the question bank + frameworks" location="frameworks" />
        </div>
      </div>
    </section>
  );
}

// ── §15 — STAR+ ──────────────────────────────────────────────────────────────

const starSteps = [
  { letter: "S", name: "Situation", detail: "Set the scene briefly.", weight: "brief" },
  { letter: "T", name: "Task", detail: "What were you responsible for?", weight: "brief" },
  { letter: "A", name: "Action", detail: "What did you personally do?", weight: "most" },
  { letter: "R", name: "Result", detail: "What changed because of it?", weight: "clear" },
  { letter: "+", name: "Reflection", detail: "What did you learn?", weight: "short" },
];

export function StarSection() {
  return (
    <section className="section bg-white">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">P04 · 53 pages · 100 worked examples</p>
          <h2 className="h2 mt-3">
            Don't just say you're good at something.
            <br />
            <span className="text-teal-700">Show the evidence.</span>
          </h2>
        </div>

        <ol className="mt-10 grid gap-3 sm:grid-cols-5">
          {starSteps.map((step) => (
            <li
              key={step.letter}
              className={`rounded-xl2 border p-5 text-center ${
                step.weight === "most"
                  ? "border-amber-300 bg-amber-50 ring-2 ring-amber-200 sm:scale-[1.04]"
                  : "border-navy-100 bg-sand"
              }`}
            >
              <span
                className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-fluid-xl font-bold ${
                  step.weight === "most" ? "bg-amber-500 text-navy-950" : "bg-navy-950 text-white"
                }`}
                aria-hidden="true"
              >
                {step.letter}
              </span>
              <h3 className="mt-3 text-fluid-base font-bold text-navy-950">{step.name}</h3>
              <p className="mt-1 text-fluid-xs leading-snug text-ink-soft">{step.detail}</p>
            </li>
          ))}
        </ol>

        <div className="mx-auto mt-8 max-w-3xl rounded-xl2 border-l-4 border-amber-500 bg-navy-50 p-5 sm:p-6">
          <p className="text-fluid-lg font-semibold text-navy-950">
            Action should do most of the work.
          </p>
          <p className="mt-2 text-fluid-sm leading-relaxed text-ink-soft">
            Most weak behavioural answers spend too long on background and rush what the candidate
            actually did. The 100 worked examples across 10 competency areas show the balance that
            works — achievement, leadership, teamwork, communication, conflict, problem solving,
            initiative, failure, adaptability and stakeholders.
          </p>
          <p className="mt-4 inline-flex rounded-lg bg-navy-950 px-4 py-2 text-fluid-sm font-bold text-amber-400">
            Borrow the structure. Replace the story.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── §16 — Interview English ──────────────────────────────────────────────────

const clarityChain = ["Message", "Structure", "Evidence", "Language", "Delivery"];

const englishSkills = [
  "Shorten long sentences",
  "Reduce filler words",
  "Speak at a manageable pace",
  "Pause naturally",
  "Ask for clarification professionally",
  "Buy thinking time",
  "Explain responsibilities clearly",
  "Recover when you get stuck",
  "Handle virtual interview communication",
];

export function EnglishSection() {
  return (
    <section className="section bg-teal-900 text-white">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-teal-300">P02 · 71 pages · 18 chapters</p>
          <h2 className="h2 mt-3 text-white">
            You don't need fancy English.
            <br />
            <span className="text-amber-400">You need to be easy to follow.</span>
          </h2>
          <p className="lede mx-auto mt-4 text-teal-100">
            This is not accent training, and it is not a grammar textbook. It is about making your
            meaning clear when you are nervous and thinking in real time.
          </p>
        </div>

        {/* Clarity chain */}
        <ol className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {clarityChain.map((step, index) => (
            <li key={step} className="flex items-center gap-2 sm:gap-3">
              <span className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-fluid-sm font-bold uppercase tracking-wide sm:px-5 sm:py-3">
                {step}
              </span>
              {index < clarityChain.length - 1 && (
                <svg
                  className="h-4 w-4 shrink-0 text-amber-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M4 9h9.2l-3.1-3.1 1.4-1.4L17 10l-5.5 5.5-1.4-1.4L13.2 11H4V9z" />
                </svg>
              )}
            </li>
          ))}
        </ol>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl2 border border-white/10 bg-white/[0.06] p-6 lg:col-span-2">
            <h3 className="text-fluid-lg font-bold text-white">What you practise</h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {englishSkills.map((skill) => (
                <li key={skill} className="flex items-start gap-2 text-fluid-sm text-teal-50">
                  <svg
                    className="mt-1 h-3.5 w-3.5 shrink-0 text-amber-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {skill}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl2 bg-white p-6 text-navy-950">
              <p className="text-fluid-3xl font-bold text-teal-700">30</p>
              <p className="mt-1 text-fluid-sm font-medium">spoken interview practice drills</p>
            </div>
            <div className="rounded-xl2 bg-amber-500 p-6 text-navy-950">
              <p className="text-fluid-3xl font-bold">14</p>
              <p className="mt-1 text-fluid-sm font-medium">day interview English practice plan</p>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-fluid-sm text-teal-100">
          Clarity over perfection. The goal is an interviewer who follows your answer easily — not a
          different accent.
        </p>
      </div>
    </section>
  );
}

// ── §17 — Tell Me About Yourself ─────────────────────────────────────────────

const tmayParts = [
  {
    label: "Present",
    question: "Who are you professionally now?",
    tone: "bg-blue-600",
  },
  {
    label: "Past",
    question: "What experience makes you relevant?",
    tone: "bg-teal-600",
  },
  {
    label: "Future",
    question: "Why does this opportunity make sense next?",
    tone: "bg-amber-500",
  },
];

const careerStages = [
  "Fresh graduates",
  "Experienced professionals",
  "Managers & leaders",
  "Career switchers",
  "Career gap / return to work",
  "Internal promotions",
];

export function TellMeAboutYourselfSection() {
  return (
    <section className="section bg-white">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">P05 · 22 pages · 12 annotated examples</p>
          <h2 className="h2 mt-3">
            The first big question should not become your longest answer.
          </h2>
          <p className="lede mx-auto mt-4">
            Your introduction is not your autobiography. It is a short, deliberate answer to three
            questions.
          </p>
        </div>

        <ol className="mt-10 grid gap-4 sm:grid-cols-3">
          {tmayParts.map((part, index) => (
            <li key={part.label} className="relative card overflow-hidden p-6">
              <span
                className={`inline-flex items-center rounded-full ${part.tone} px-3 py-1 text-fluid-xs font-bold uppercase tracking-wider text-white`}
              >
                {index + 1}. {part.label}
              </span>
              <p className="mt-4 text-fluid-lg font-semibold leading-snug text-navy-950">
                {part.question}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="card bg-navy-950 p-6 text-white">
            <h3 className="text-fluid-lg font-bold text-white">Three lengths, ready to use</h3>
            <p className="mt-2 text-fluid-sm text-navy-200">
              Different interviews give you different room. Prepare all three and pick on the day.
            </p>
            <ul className="mt-5 grid grid-cols-3 gap-3">
              {["30 sec", "60 sec", "90 sec"].map((length) => (
                <li
                  key={length}
                  className="rounded-lg border border-white/15 bg-white/[0.07] py-3 text-center text-fluid-base font-bold text-amber-400"
                >
                  {length}
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6">
            <h3 className="text-fluid-lg font-bold text-navy-950">Written for your career stage</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {careerStages.map((stage) => (
                <li key={stage} className="chip">
                  {stage}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── §18 — Difficult questions ────────────────────────────────────────────────

const difficultQuestions = [
  "What is your biggest weakness?",
  "Explain this career gap.",
  "Why were you terminated?",
  "Why are your grades low?",
  "You don't have enough experience.",
  "Why did you leave your last job?",
  "What is the minimum salary you'll accept?",
];

const recoverySteps = ["Fact", "Context", "Ownership", "Action", "Readiness"];

export function DifficultQuestionsSection() {
  return (
    <section className="section bg-sand">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">P06 · 25 pages · 25 practice prompts</p>
          <h2 className="h2 mt-3">What will you say when the interview gets uncomfortable?</h2>
        </div>

        <ul className="swipe-rail mt-10 sm:grid sm:grid-cols-2 sm:gap-3 sm:overflow-visible lg:grid-cols-4">
          {difficultQuestions.map((question) => (
            <li
              key={question}
              className="w-[15rem] rounded-xl border border-navy-200 bg-white p-4 shadow-card sm:w-auto"
            >
              <p className="text-fluid-sm font-medium leading-snug text-navy-900">“{question}”</p>
            </li>
          ))}
        </ul>

        <div className="mt-10 rounded-xl2 bg-navy-950 p-6 sm:p-8">
          <p className="text-center text-fluid-sm font-semibold uppercase tracking-[0.14em] text-teal-300">
            The recovery framework
          </p>
          <ol className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {recoverySteps.map((step, index) => (
              <li key={step} className="flex items-center gap-2 sm:gap-3">
                <span className="rounded-lg bg-white/10 px-3 py-2 text-fluid-sm font-bold uppercase tracking-wide text-white sm:px-4">
                  {step}
                </span>
                {index < recoverySteps.length - 1 && (
                  <svg
                    className="h-4 w-4 shrink-0 text-amber-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M4 9h9.2l-3.1-3.1 1.4-1.4L17 10l-5.5 5.5-1.4-1.4L13.2 11H4V9z" />
                  </svg>
                )}
              </li>
            ))}
          </ol>
          <p className="mx-auto mt-6 max-w-xl text-center text-fluid-base font-medium text-white">
            You don't need a perfect past. You need a truthful, professional way to explain it.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── §19 — Answer builder ─────────────────────────────────────────────────────

const builderQuestions = [
  "What happened?",
  "What was my responsibility?",
  "What action did I personally take?",
  "What changed?",
  "What did I learn?",
];

export function AnswerBuilderSection() {
  return (
    <section className="section bg-white">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">P10 · 20 pages · 14+ worksheets</p>
          <h2 className="h2 mt-3">
            Don't memorise somebody else's story.
            <br />
            <span className="text-teal-700">Build your own.</span>
          </h2>
        </div>

        <div className="mx-auto mt-10 max-w-3xl">
          <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
            <div className="rounded-xl2 border-2 border-dashed border-navy-200 bg-sand p-5 text-center">
              <p className="text-fluid-xs font-semibold uppercase tracking-wider text-ink-faint">
                What you start with
              </p>
              <p className="mt-2 text-fluid-lg font-bold text-navy-950">A project you worked on</p>
              <p className="mt-1 text-fluid-sm text-ink-soft">Unstructured. Hard to explain quickly.</p>
            </div>

            <div className="flex justify-center sm:rotate-0" aria-hidden="true">
              <svg className="h-6 w-6 rotate-90 text-amber-500 sm:rotate-0" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 9h9.2l-3.1-3.1 1.4-1.4L17 10l-5.5 5.5-1.4-1.4L13.2 11H4V9z" />
              </svg>
            </div>

            <div className="rounded-xl2 border-2 border-teal-300 bg-teal-50 p-5 text-center">
              <p className="text-fluid-xs font-semibold uppercase tracking-wider text-teal-700">
                What you finish with
              </p>
              <p className="mt-2 text-fluid-lg font-bold text-navy-950">Interview-ready evidence</p>
              <p className="mt-1 text-fluid-sm text-ink-soft">Structured. Reusable across questions.</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl2 bg-navy-950 p-6">
            <p className="text-center text-fluid-sm font-semibold uppercase tracking-[0.14em] text-teal-300">
              The worksheet walks you through
            </p>
            <ol className="mt-5 space-y-2.5">
              {builderQuestions.map((question, index) => (
                <li key={question} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-fluid-xs font-bold text-amber-400">
                    {index + 1}
                  </span>
                  <span className="text-fluid-base text-white">{question}</span>
                </li>
              ))}
            </ol>
          </div>

          <p className="mt-6 text-center text-fluid-sm text-ink-soft">
            Build strong ingredients first. You are not trying to write a perfect script in every box.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── §20 — Mock interview system ──────────────────────────────────────────────

const mockRounds = [
  { number: "01", name: "Baseline", detail: "Where are you starting from?" },
  { number: "02", name: "Behavioural", detail: "STAR answers under pressure" },
  { number: "03", name: "Difficult questions", detail: "The ones you avoid" },
  { number: "04", name: "Role fit", detail: "Why you, why here" },
  { number: "05", name: "Final simulation", detail: "Full interview conditions" },
];

const scoringDimensions = ["Relevance", "Structure", "Evidence", "Communication", "Delivery"];

const practiceCycle = ["Perform", "Score", "Diagnose", "Change one thing", "Repeat"];

export function MockInterviewSection() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => observeSection(ref.current, "BundleSection_View", { section: "mock" }), []);

  return (
    <section ref={ref} className="section bg-navy-950 text-white">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-teal-300">P08 · 35 pages · 17 chapters</p>
          <h2 className="h2 mt-3 text-white">
            Reading about interviews is not the same as practising one.
          </h2>
          <p className="lede mx-auto mt-4 text-navy-200">
            This is what turns everything you have read into something you can actually do out loud.
          </p>
        </div>

        {/* Deliberate practice cycle */}
        <ol className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {practiceCycle.map((step, index) => (
            <li key={step} className="flex items-center gap-2">
              <span className="rounded-full border border-teal-400/40 bg-teal-500/10 px-4 py-2 text-fluid-sm font-semibold text-teal-100">
                {step}
              </span>
              {index < practiceCycle.length - 1 && (
                <svg className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M4 9h9.2l-3.1-3.1 1.4-1.4L17 10l-5.5 5.5-1.4-1.4L13.2 11H4V9z" />
                </svg>
              )}
            </li>
          ))}
        </ol>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h3 className="text-fluid-lg font-bold text-white">Five guided mock interviews</h3>
            <ol className="mt-4 space-y-2.5">
              {mockRounds.map((round) => (
                <li
                  key={round.number}
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.05] p-4"
                >
                  <span className="text-fluid-xl font-bold text-teal-400">{round.number}</span>
                  <div>
                    <p className="text-fluid-base font-semibold text-white">{round.name}</p>
                    <p className="text-fluid-xs text-navy-300">{round.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl2 bg-white p-6 text-navy-950">
            <h3 className="text-fluid-lg font-bold">Score every answer out of 5</h3>
            <p className="mt-1.5 text-fluid-sm text-ink-soft">
              Five dimensions, so “that felt bad” becomes something you can actually fix.
            </p>
            <ul className="mt-5 space-y-3">
              {scoringDimensions.map((dimension) => (
                <li key={dimension}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-fluid-sm font-semibold">{dimension}</span>
                    <span className="text-fluid-xs text-ink-faint">/ 5</span>
                  </div>
                  <div className="mt-1.5 flex gap-1" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className="h-2 flex-1 rounded-full bg-navy-100" />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-5 rounded-lg bg-amber-50 p-3 text-fluid-xs text-amber-900">
              Change one thing between attempts. That is what makes the improvement measurable.
            </p>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <CheckoutButton label="Start practising properly" location="mock_interview" />
        </div>
      </div>
    </section>
  );
}

// ── §21 — Company research ───────────────────────────────────────────────────

const researchBlocks = [
  { time: "0–5 min", focus: "Role", detail: "What is this job actually for?" },
  { time: "5–15 min", focus: "Company", detail: "Products, customers, business model" },
  { time: "15–25 min", focus: "Recent context", detail: "What has changed lately?" },
  { time: "25–35 min", focus: "Team / role", detail: "Where you would fit" },
  { time: "35–45 min", focus: "Convert to answers", detail: "Turn research into evidence" },
];

const researchOutputs = [
  "Why this company",
  "Why this role",
  "Likely questions",
  "Questions to ask",
  "Relevant evidence",
];

export function ResearchSection() {
  return (
    <section className="section bg-white">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">P09 · 20 pages · 12 chapters</p>
          <h2 className="h2 mt-3">Walk in knowing more than the job title.</h2>
          <p className="lede mx-auto mt-4">
            Company research is not memorising the website. It is turning information into evidence
            you can actually use in an answer.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl">
          <p className="text-center text-fluid-sm font-bold uppercase tracking-[0.14em] text-teal-700">
            The 45-minute company research system
          </p>

          <ol className="mt-5 space-y-2">
            {researchBlocks.map((block) => (
              <li
                key={block.time}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-navy-100 bg-sand p-4"
              >
                <span className="w-[5.5rem] shrink-0 text-fluid-xs font-bold text-teal-700">
                  {block.time}
                </span>
                <span className="text-fluid-base font-semibold text-navy-950">{block.focus}</span>
                <span className="w-full text-fluid-sm text-ink-soft sm:w-auto sm:flex-1">
                  {block.detail}
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-6 rounded-xl2 border-2 border-teal-200 bg-teal-50 p-5">
            <p className="text-fluid-xs font-bold uppercase tracking-wider text-teal-700">
              What you walk away with
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {researchOutputs.map((output) => (
                <li
                  key={output}
                  className="rounded-full bg-white px-3 py-1.5 text-fluid-sm font-medium text-navy-900 shadow-sm"
                >
                  {output}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
