/**
 * Pain recognition (brief §10) followed by the reframe (brief §11).
 *
 * Tone rule from the brief: the candidate is never the problem. The closing
 * line moves the blame from ability to method, which is what makes the rest
 * of the page feel like a solution rather than an accusation.
 */

const pains = [
  "I know the answer, but I can't explain it properly.",
  "I prepare questions but still feel unprepared.",
  "My mind goes blank.",
  "My answers become too long.",
  "I don't know which example to use.",
  "I struggle with “Tell me about yourself”.",
  "I'm worried they'll ask about my weakness or career gap.",
  "My English becomes less clear when I'm nervous.",
  "I watch interview videos but have no preparation system.",
  "I have an interview soon and don't know where to start.",
];

export default function PainSection() {
  return (
    <section id="pain" className="section bg-white">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Sound familiar?</p>
          <h2 className="h2 mt-3">Do any of these sound like your last interview?</h2>
        </div>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pains.map((pain) => (
            <li
              key={pain}
              className="flex items-start gap-3 rounded-xl border border-navy-100 bg-sand p-4"
            >
              <QuoteMark />
              <p className="text-fluid-sm leading-relaxed text-ink">{pain}</p>
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-10 max-w-2xl rounded-xl2 border-l-4 border-amber-500 bg-navy-950 p-6 text-center sm:p-8">
          <p className="text-fluid-xl font-semibold leading-snug text-white">
            The problem is usually not a lack of ability.
            <br />
            <span className="text-amber-400">It is unstructured preparation.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

function QuoteMark() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-navy-300"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M7.5 4C5 5.3 3.4 7.7 3.4 10.6c0 2.6 1.5 4.4 3.6 4.4 1.8 0 3.1-1.3 3.1-3 0-1.7-1.2-2.9-2.8-2.9-.3 0-.7.1-.8.1.3-1.3 1.6-2.8 3-3.6L7.5 4zm7.7 0c-2.5 1.3-4.1 3.7-4.1 6.6 0 2.6 1.5 4.4 3.6 4.4 1.8 0 3.1-1.3 3.1-3 0-1.7-1.2-2.9-2.8-2.9-.3 0-.7.1-.8.1.3-1.3 1.6-2.8 3-3.6L15.2 4z" />
    </svg>
  );
}
