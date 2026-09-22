/**
 * Meta Ads message match (brief §39) + final-CTA A/B config (brief §52).
 *
 * Usage: append ?v=english (or ?variant=english) to the ad's destination URL.
 * Campaign-level message match means the headline the visitor clicked is the
 * headline they land on, which is the single biggest driver of bounce on
 * cold Meta traffic.
 */

export type VariantKey =
  | "general"
  | "soon"
  | "questions"
  | "english"
  | "tmay"
  | "fresher"
  | "switcher"
  | "price";

export interface HeroVariant {
  key: VariantKey;
  /** Short label for reporting. */
  label: string;
  headline: string;
  /** Optional emphasised fragment rendered in the accent colour. */
  headlineAccent?: string;
  subheadline: string;
  /** Overrides the default eyebrow when the campaign has a sharper angle. */
  eyebrow?: string;
}

const DEFAULT_SUB =
  "Complete Interview Mastery is a 12-resource preparation system that helps you understand what interviewers may ask, build truthful structured answers, improve spoken communication, practise with mock interviews, prepare for interview day, and handle follow-up and salary conversations.";

export const heroVariants: Record<VariantKey, HeroVariant> = {
  general: {
    key: "general",
    label: "A — General",
    headline: "Stop preparing for interviews",
    headlineAccent: "one random question at a time.",
    subheadline: DEFAULT_SUB,
  },
  soon: {
    key: "soon",
    label: "B — Interview soon",
    headline: "Interview coming up?",
    headlineAccent: "Know exactly what to prepare next.",
    subheadline:
      "A 12-resource interview preparation system with 7-day, 24-hour and final-hour plans — so you know what to do with the time you actually have left.",
    eyebrow: "For candidates with an interview already scheduled",
  },
  questions: {
    key: "questions",
    label: "C — 500 questions",
    headline: "500 interview questions —",
    headlineAccent: "without memorising 500 answers.",
    subheadline:
      "Interview questions repeat patterns. Complete Interview Mastery gives you 500 questions, 14 answer frameworks and a 12-story evidence bank, so you prepare the pattern instead of the script.",
  },
  english: {
    key: "english",
    label: "D — English",
    headline: "Know what you want to say,",
    headlineAccent: "but struggle to say it clearly?",
    subheadline:
      "Interview English Mastery focuses on clarity, not accent. 30 spoken drills and a 14-day practice plan help you organise answers, reduce filler words and recover when you get stuck — inside a complete 12-resource preparation system.",
    eyebrow: "Clarity over perfection",
  },
  tmay: {
    key: "tmay",
    label: "E — Tell me about yourself",
    headline: "Still unsure how to answer",
    headlineAccent: "“Tell me about yourself”?",
    subheadline:
      "Get a Present–Past–Future structure, 30/60/90-second versions and 12 annotated examples — plus the complete 12-resource system behind every other question they will ask.",
  },
  fresher: {
    key: "fresher",
    label: "F — Fresh graduate",
    headline: "Your first interview shouldn't be",
    headlineAccent: "your first practice session.",
    subheadline:
      "Built for final-year students and fresh graduates: understand what interviewers test, build answers from your projects and internships, and run scored mock interviews before the real one.",
    eyebrow: "For final-year students & fresh graduates",
  },
  /**
   * For campaigns whose creative already states the price. Only use this where
   * the ad revealed ₹699 — leading with price on a cold audience that has not
   * seen the value yet converts worse than the problem/solution hero (§55).
   */
  price: {
    key: "price",
    label: "H — Price-led",
    headline: "The complete interview preparation system",
    headlineAccent: "for ₹699.",
    subheadline:
      "12 digital resources and 619 pages: 500 interview questions, 14 answer frameworks, 100 STAR examples, mock interview practice, company research, worksheets, checklists and salary negotiation. One-time payment.",
    eyebrow: "All 12 resources · one-time payment",
  },
  switcher: {
    key: "switcher",
    label: "G — Job switcher",
    headline: "Preparing to switch jobs?",
    headlineAccent: "Build better answers before the interview.",
    subheadline:
      "Explain your move clearly, rebuild your evidence for a new role, research the company properly and prepare the compensation conversation — in one 12-resource system.",
    eyebrow: "For working professionals & career switchers",
  },
};

export function resolveVariant(raw?: string | string[] | null): HeroVariant {
  const key = Array.isArray(raw) ? raw[0] : raw;
  if (key && key in heroVariants) return heroVariants[key as VariantKey];
  return heroVariants.general;
}

/** Final CTA headline options (brief §52). Option 1 is primary. */
export const finalCtaVariants = [
  {
    key: "decide",
    headline:
      "Don't wait until the interviewer asks the question to decide what your answer should be.",
  },
  { key: "performance", headline: "Your interview is the performance. Preparation happens before it." },
  { key: "structure", headline: "Less guessing. More structure. More practice." },
  { key: "pattern", headline: "Prepare the pattern. Build your evidence. Practise the answer." },
] as const;

export const PRIMARY_FINAL_CTA = finalCtaVariants[0];
