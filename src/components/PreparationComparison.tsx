/**
 * Random preparation vs a system (brief §11).
 *
 * Note the explicit instruction followed here: free content is NOT attacked.
 * The distinction drawn is organisation, not quality — which is both true and
 * more persuasive to a sceptical visitor who has learned real things on YouTube.
 */

const randomPrep = [
  "Random YouTube videos",
  "Saved Instagram posts",
  "Dozens of copied answers",
  "No story bank",
  "No practice scoring",
  "Last-minute company research",
  "No interview-day plan",
  "No follow-up system",
];

const systemPrep = [
  "Understand what the interview tests",
  "Map the role and job description",
  "Build your evidence bank",
  "Structure answers with frameworks",
  "Practise aloud with drills",
  "Simulate scored mock interviews",
  "Prepare interview-day logistics",
  "Follow up, evaluate and negotiate",
];

export default function PreparationComparison() {
  return (
    <section className="section bg-sand">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">The real difference</p>
          <h2 className="h2 mt-3">Scattered preparation vs a preparation system</h2>
          <p className="lede mx-auto mt-4">
            Free content can be genuinely useful. The challenge is organising it into a repeatable
            process you can actually follow before a specific interview.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <h3 className="flex items-center gap-2 text-fluid-lg text-ink-soft">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-100 text-navy-600">
                <ScatterIcon />
              </span>
              Preparing at random
            </h3>
            <ul className="mt-5 space-y-3">
              {randomPrep.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-fluid-sm text-ink-soft">
                  <DotIcon />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="card border-teal-200 bg-white p-6 ring-1 ring-teal-100">
            <h3 className="flex items-center gap-2 text-fluid-lg text-navy-950">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-white">
                <CheckIcon />
              </span>
              Complete Interview Mastery
            </h3>
            <ul className="mt-5 space-y-3">
              {systemPrep.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-fluid-sm font-medium text-navy-900">
                  <TickIcon />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScatterIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="6" r="1.8" />
      <circle cx="14" cy="4.5" r="1.4" />
      <circle cx="9" cy="12" r="1.6" />
      <circle cx="15.5" cy="13" r="1.3" />
      <circle cx="4.5" cy="15" r="1.2" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
function DotIcon() {
  return (
    <svg className="mt-1.5 h-2 w-2 shrink-0 text-navy-300" viewBox="0 0 8 8" fill="currentColor" aria-hidden="true">
      <circle cx="4" cy="4" r="4" />
    </svg>
  );
}
function TickIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
