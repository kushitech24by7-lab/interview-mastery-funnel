/**
 * Product catalogue — the source of truth for the bundle (brief §2).
 *
 * PAGE COUNTS ARE VERIFIED AND MUST NOT BE CHANGED.
 * 166+71+144+53+22+25+20+35+20+20+18+25 = 619 across 12 resources.
 *
 * `cover` points at a real cover image in /public/covers. Until the real PDF
 * covers are dropped in, <ProductCover> falls back to a typographic panel built
 * from this data — see the note in src/components/ProductCover.tsx. No invented
 * screenshot is ever presented as an actual page.
 */

export type Stage = "learn" | "build" | "practice" | "perform" | "followup" | "negotiate";

export type ProductGroup =
  | "Core system"
  | "Communication"
  | "Questions & examples"
  | "High-stakes answers"
  | "Practice & personalisation"
  | "Execution";

export interface Product {
  id: string;
  code: string;
  title: string;
  shortTitle: string;
  pages: number;
  group: ProductGroup;
  /** One-line job this resource does inside the system. */
  purpose: string;
  /** 3–4 specific, non-generic outcomes (brief §13). */
  outcomes: string[];
  /** Structural facts used as proof chips on the card. */
  facts: string[];
  stages: Stage[];
  cover: string;
  coverAccent: string;
  /** Listed individual regular price in INR (whole rupees). */
  regularPrice: number;
  /** Listed individual special price in INR (whole rupees). */
  specialPrice: number;
}

export const products: Product[] = [
  {
    id: "p01",
    code: "P01",
    title: "Complete Interview Mastery Handbook",
    shortTitle: "Mastery Handbook",
    pages: 166,
    group: "Core system",
    purpose: "The teaching spine of the whole system — what interviews actually test and how to prepare for them.",
    outcomes: [
      "Understand interviews as evidence-gathering conversations, not performances",
      "Work through the RESEARCH → MAP → BUILD → PRACTICE → SIMULATE → REFINE preparation cycle",
      "Decode a job description and turn it into a preparation plan",
      "Learn direct-answer principles, STAR and CAR, answer structures and answer length",
    ],
    facts: ["24 chapters", "166 pages"],
    stages: ["learn", "build"],
    cover: "/covers/p01.webp",
    coverAccent: "#1d2f4f",
    regularPrice: 999,
    specialPrice: 399,
  },
  {
    id: "p02",
    code: "P02",
    title: "Interview English Mastery",
    shortTitle: "Interview English",
    pages: 71,
    group: "Communication",
    purpose: "Makes your spoken answers easier to follow — clarity over perfection, not accent training.",
    outcomes: [
      "Organise spoken answers using MESSAGE → STRUCTURE → EVIDENCE → LANGUAGE → DELIVERY",
      "Reduce filler words, shorten sentences and speak at a manageable pace",
      "Buy thinking time professionally and clarify a question you did not catch",
      "Recover when you get stuck mid-answer instead of freezing",
    ],
    facts: ["18 chapters", "30 spoken drills", "14-day plan"],
    stages: ["practice"],
    cover: "/covers/p02.webp",
    coverAccent: "#237b77",
    regularPrice: 599,
    specialPrice: 249,
  },
  {
    id: "p03",
    code: "P03",
    title: "500 Interview Questions & Answer Frameworks",
    shortTitle: "500 Questions",
    pages: 144,
    group: "Questions & examples",
    purpose: "Shows what may be asked — and the repeating patterns that let you answer without memorising scripts.",
    outcomes: [
      "See 500 real interview questions grouped into 11 categories",
      "Apply 14 answer frameworks including Present–Past–Future, STAR+, PREP and Claim–Evidence–Fit",
      "Build a 12-story evidence bank that covers most behavioural questions",
      "Recognise which framework a question is actually asking for",
    ],
    facts: ["500 questions", "14 frameworks", "12-story evidence bank"],
    stages: ["learn", "practice"],
    cover: "/covers/p03.webp",
    coverAccent: "#2e4d82",
    regularPrice: 899,
    specialPrice: 349,
  },
  {
    id: "p04",
    code: "P04",
    title: "100 STAR Answer Examples",
    shortTitle: "100 STAR Examples",
    pages: 53,
    group: "Questions & examples",
    purpose: "Shows what a strong behavioural answer actually sounds like, so you can borrow the structure.",
    outcomes: [
      "Study 100 worked STAR+ examples across 10 competency areas",
      "See why ACTION should dominate an answer rather than background",
      "Use the Situation–Task–Action–Result–Reflection structure with your own story",
      "Build personal versions with the included story-building system",
    ],
    facts: ["100 worked examples", "10 competency areas"],
    stages: ["build"],
    cover: "/covers/p04.webp",
    coverAccent: "#1f6260",
    regularPrice: 599,
    specialPrice: 299,
  },
  {
    id: "p05",
    code: "P05",
    title: "Tell Me About Yourself Playbook",
    shortTitle: "Tell Me About Yourself",
    pages: 22,
    group: "High-stakes answers",
    purpose: "Solves the opening question that sets the tone for everything after it.",
    outcomes: [
      "Build your answer on Present–Past–Future instead of a career autobiography",
      "Prepare 30-second, 60-second and 90-second versions for different interviews",
      "Follow guidance written for your career stage, including gaps and career switches",
      "Compare 12 annotated examples to see what is working and why",
    ],
    facts: ["12 chapters", "12 annotated examples", "30/60/90-sec versions"],
    stages: ["build"],
    cover: "/covers/p05.webp",
    coverAccent: "#263e69",
    regularPrice: 299,
    specialPrice: 149,
  },
  {
    id: "p06",
    code: "P06",
    title: "Difficult Interview Questions Guide",
    shortTitle: "Difficult Questions",
    pages: 25,
    group: "High-stakes answers",
    purpose: "Handles the uncomfortable questions — gaps, weakness, termination, job changes.",
    outcomes: [
      "Use FACT → CONTEXT → OWNERSHIP → ACTION → READINESS to explain difficult history",
      "Prepare answers for career gaps, layoffs, terminations and frequent job changes",
      "Handle 'you don't have enough experience' and 'why should we choose you?'",
      "Work through 25 practice prompts on the questions you are avoiding",
    ],
    facts: ["16 chapters", "25 practice prompts"],
    stages: ["build"],
    cover: "/covers/p06.webp",
    coverAccent: "#9b400f",
    regularPrice: 349,
    specialPrice: 179,
  },
  {
    id: "p07",
    code: "P07",
    title: "Salary Negotiation Guide",
    shortTitle: "Salary Negotiation",
    pages: 20,
    group: "High-stakes answers",
    purpose: "Prepares the compensation conversation so you negotiate from preparation, not emotion.",
    outcomes: [
      "Set a TARGET, a WORKABLE RANGE and a private floor before you are asked",
      "Answer salary-expectation and current-compensation questions with a prepared position",
      "Evaluate total compensation, not just base pay",
      "Use counteroffer scripts and email templates, including how to decline professionally",
    ],
    facts: ["12 chapters", "Counteroffer scripts & email templates"],
    stages: ["negotiate"],
    cover: "/covers/p07.webp",
    coverAccent: "#c35109",
    regularPrice: 349,
    specialPrice: 179,
  },
  {
    id: "p08",
    code: "P08",
    title: "Mock Interview Workbook",
    shortTitle: "Mock Interview Workbook",
    pages: 35,
    group: "Practice & personalisation",
    purpose: "Turns what you have learned into observable performance before the real interview.",
    outcomes: [
      "Run five guided mocks: Baseline, Behavioural, Difficult Questions, Role Fit, Final Simulation",
      "Score every answer on Relevance, Structure, Evidence, Communication and Delivery (1–5)",
      "Use the PERFORM → SCORE → DIAGNOSE → CHANGE ONE THING → REPEAT cycle",
      "See measurable improvement instead of guessing whether you are ready",
    ],
    facts: ["17 chapters", "5 guided mocks", "5-dimension scoring"],
    stages: ["perform"],
    cover: "/covers/p08.webp",
    coverAccent: "#1d4ed8",
    regularPrice: 399,
    specialPrice: 199,
  },
  {
    id: "p09",
    code: "P09",
    title: "Company Research Workbook",
    shortTitle: "Company Research",
    pages: 20,
    group: "Practice & personalisation",
    purpose: "Turns company research into interview evidence instead of memorised website facts.",
    outcomes: [
      "Follow a 45-minute research system that fits the night before an interview",
      "Decode the job description, culture claims and recent company developments",
      "Convert research directly into 'Why this company' and 'Why this role' answers",
      "Prepare informed questions to ask your interviewer",
    ],
    facts: ["12 chapters", "45-minute research system"],
    stages: ["build"],
    cover: "/covers/p09.webp",
    coverAccent: "#2f9992",
    regularPrice: 299,
    specialPrice: 149,
  },
  {
    id: "p10",
    code: "P10",
    title: "Answer Builder Worksheets",
    shortTitle: "Answer Builder",
    pages: 20,
    group: "Practice & personalisation",
    purpose: "Converts your raw experience into interview-answer ingredients you actually own.",
    outcomes: [
      "Map your career story, achievements and competency evidence",
      "Build STAR and CAR stories from your own projects using guided prompts",
      "Draft Why This Role, Why This Company and Tell Me About Yourself from your own material",
      "Collect everything into a Final Answer Bank index you can revise from",
    ],
    facts: ["14+ worksheets", "Reusable copies included"],
    stages: ["build", "practice"],
    cover: "/covers/p10.webp",
    coverAccent: "#3d629d",
    regularPrice: 299,
    specialPrice: 149,
  },
  {
    id: "p11",
    code: "P11",
    title: "Interview Day + Follow-Up Toolkit",
    shortTitle: "Interview Day Toolkit",
    pages: 18,
    group: "Execution",
    purpose: "Holds your preparation together on the day itself — and tells you what to do afterwards.",
    outcomes: [
      "Work a real Final 60-Minute preparation sequence before you walk in or log on",
      "Set up in-person and virtual interviews properly, including a technology backup plan",
      "Use a five-minute pre-interview reset when nerves spike",
      "Debrief afterwards, send an appropriate thank-you and prepare for the next round",
    ],
    facts: ["Final 60-minute sequence", "In-person + virtual checklists"],
    stages: ["perform", "followup"],
    cover: "/covers/p11.webp",
    coverAccent: "#194140",
    regularPrice: 249,
    specialPrice: 129,
  },
  {
    id: "p12",
    code: "P12",
    title: "Templates, Checklists & Trackers",
    shortTitle: "Templates & Trackers",
    pages: 25,
    group: "Execution",
    purpose: "The operational layer — 30 reusable tools that turn the system into daily execution.",
    outcomes: [
      "Plan with the 7-Day Preparation Planner and the 24-Hour Planner",
      "Track applications, stories, mock scores and follow-ups in one place",
      "Decode job descriptions and compare offers with dedicated worksheets",
      "Revise from the Final 10-Minute Revision Card right before the interview",
    ],
    facts: ["30 reusable tools", "8 sections"],
    stages: ["perform", "followup", "negotiate"],
    cover: "/covers/p12.webp",
    coverAccent: "#132038",
    regularPrice: 349,
    specialPrice: 179,
  },
];

/** Runtime guard: the marketing claim of 619 pages must always match the data. */
export const TOTAL_PAGES = products.reduce((sum, p) => sum + p.pages, 0);
export const TOTAL_PRODUCTS = products.length;

/**
 * Value figures, computed from the product data rather than hard-coded, so a
 * price edit can never leave the comparison sections quietly out of date.
 *
 *   COMBINED_INDIVIDUAL_REGULAR_VALUE — the 12 listed regular prices summed
 *   COMBINED_INDIVIDUAL_SPECIAL_VALUE — the 12 listed special prices summed
 *
 * Neither is the bundle selling price. See pricing.ts for the hierarchy and the
 * exact wording each figure must be presented with.
 */
export const COMBINED_INDIVIDUAL_REGULAR_VALUE = products.reduce(
  (sum, p) => sum + p.regularPrice,
  0
);
export const COMBINED_INDIVIDUAL_SPECIAL_VALUE = products.reduce(
  (sum, p) => sum + p.specialPrice,
  0
);

/**
 * Runs in EVERY environment, including production builds — deliberately.
 *
 * The page advertises "619 pages across 12 resources" as a factual claim. If
 * this data ever drifts from that claim, the correct outcome is a failed build,
 * not a quietly inaccurate sales page. A dev-only check would pass exactly when
 * it matters least.
 */
if (TOTAL_PAGES !== 619 || TOTAL_PRODUCTS !== 12) {
  throw new Error(
    `Product data mismatch: got ${TOTAL_PRODUCTS} products / ${TOTAL_PAGES} pages, expected 12 / 619. ` +
      `The site advertises 619 pages across 12 resources, so this must be corrected before building.`
  );
}

/**
 * The page prints ₹5,688 and ₹2,608 as factual sums of the listed individual
 * prices. If the product prices change without those claims changing, the site
 * would be stating a number that does not add up — so fail the build instead.
 */
if (COMBINED_INDIVIDUAL_REGULAR_VALUE !== 5688 || COMBINED_INDIVIDUAL_SPECIAL_VALUE !== 2608) {
  throw new Error(
    `Value mismatch: individual regular total is ₹${COMBINED_INDIVIDUAL_REGULAR_VALUE} ` +
      `(expected ₹5688) and individual special total is ₹${COMBINED_INDIVIDUAL_SPECIAL_VALUE} ` +
      `(expected ₹2608). The site advertises these sums, so they must match the product data.`
  );
}

export const productGroups: ProductGroup[] = [
  "Core system",
  "Communication",
  "Questions & examples",
  "High-stakes answers",
  "Practice & personalisation",
  "Execution",
];

export function productsByGroup(group: ProductGroup): Product[] {
  return products.filter((p) => p.group === group);
}

export function productByCode(code: string): Product | undefined {
  return products.find((p) => p.code.toLowerCase() === code.toLowerCase());
}

// ── The six-stage system (brief §12) ────────────────────────────────────────

export interface StageDefinition {
  key: Stage;
  number: string;
  name: string;
  headline: string;
  description: string;
  resourceCodes: string[];
}

export const stages: StageDefinition[] = [
  {
    key: "learn",
    number: "01",
    name: "Learn",
    headline: "Understand what is actually being tested",
    description:
      "Interviews, question types, evidence and answer structures — so you stop guessing what a question is really asking.",
    resourceCodes: ["P01", "P03"],
  },
  {
    key: "build",
    number: "02",
    name: "Build",
    headline: "Turn your experience into evidence",
    description:
      "Convert your own career history into truthful, structured answers — including the difficult ones and your opening answer.",
    resourceCodes: ["P04", "P05", "P06", "P09", "P10"],
  },
  {
    key: "practice",
    number: "03",
    name: "Practice",
    headline: "Say it out loud, repeatedly",
    description:
      "Improve spoken clarity and rehearse your answers until they sound natural rather than memorised.",
    resourceCodes: ["P02", "P03", "P10"],
  },
  {
    key: "perform",
    number: "04",
    name: "Perform",
    headline: "Simulate it before it counts",
    description:
      "Run scored mock interviews, prepare your logistics and execute interview day without your preparation falling apart.",
    resourceCodes: ["P08", "P11", "P12"],
  },
  {
    key: "followup",
    number: "05",
    name: "Follow up",
    headline: "The interview is not the last step",
    description:
      "Debrief honestly, send an appropriate follow-up and prepare for the next round instead of waiting in silence.",
    resourceCodes: ["P11", "P12"],
  },
  {
    key: "negotiate",
    number: "06",
    name: "Negotiate",
    headline: "Handle the offer conversation",
    description:
      "Evaluate the full offer, prepare your compensation position and negotiate professionally from preparation, not emotion.",
    resourceCodes: ["P07", "P12"],
  },
];

// ── Proof strip (brief §4) ──────────────────────────────────────────────────

export const factStrip = [
  { value: "619", label: "Pages" },
  { value: "12", label: "Interview resources" },
  { value: "500", label: "Interview questions" },
  { value: "14", label: "Answer frameworks" },
  { value: "100", label: "STAR examples" },
  { value: "30", label: "Spoken practice drills" },
  { value: "30", label: "Templates & trackers" },
];

// ── Answer frameworks (brief §14) ───────────────────────────────────────────

export const frameworks = [
  { name: "Present–Past–Future", use: "Tell me about yourself" },
  { name: "STAR+", use: "Behavioural questions" },
  { name: "Strength–Evidence–Relevance", use: "Strengths" },
  { name: "Weakness–Awareness–Action–Progress", use: "Weaknesses" },
  { name: "Claim–Evidence–Fit", use: "Why should we hire you" },
  { name: "Motivation Triangle", use: "Why this role / company" },
  { name: "PREP", use: "Opinion questions" },
  { name: "Problem–Action–Impact", use: "Achievements" },
  { name: "CLEAR", use: "Communication questions" },
  { name: "LEAD", use: "Leadership questions" },
  { name: "CONNECT", use: "Teamwork questions" },
  { name: "SOLVE", use: "Problem solving" },
  { name: "MATCH", use: "Role fit" },
  { name: "Past–Present–Next", use: "Career changes" },
];

export const evidenceBank = [
  "Major achievement",
  "Difficult problem",
  "Leadership",
  "Teamwork",
  "Conflict",
  "Failure",
  "Mistake",
  "Initiative",
  "Deadline / pressure",
  "Adaptability",
  "Customer / stakeholder",
  "Learning / growth",
];

export const questionCategories = [
  "Opening & first impressions",
  "Personal background & self-awareness",
  "Education & work experience",
  "Behavioural questions",
  "Situational questions",
  "Leadership & management",
  "Teamwork & communication",
  "Problem solving & decision-making",
  "Career goals & role fit",
  "Company, motivation & culture fit",
  "Salary, offers & closing",
];
