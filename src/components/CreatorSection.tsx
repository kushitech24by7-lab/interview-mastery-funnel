import { siteConfig } from "@/lib/site-config";

/**
 * Creator credibility (§5).
 *
 * ── WHY THIS RENDERS NOTHING RIGHT NOW ────────────────────────────────────────
 * The section answers "who made this and why should I trust it?", which is a
 * real objection on a ₹699 digital purchase from an unfamiliar brand. But the
 * project contains NO genuine creator details — no name, background, photo or
 * origin story — and §5 forbids inventing qualifications, employers, years of
 * experience, candidate counts or hiring credentials.
 *
 * So the component is built and wired, and stays hidden until real information
 * exists. An empty "About the creator" heading, or a grey avatar with sample
 * text, would damage trust more than the section's absence does.
 *
 * ── TO PUBLISH ────────────────────────────────────────────────────────────────
 * Fill in `creator` below with genuine details and set `published: true`.
 * Only state what is actually true — the philosophy behind the product is
 * enough on its own. It does not need a CV attached.
 */

interface Creator {
  published: boolean;
  name: string;
  /** e.g. "Founder, Interview Mastery" — a role, not an invented seniority claim. */
  role: string;
  /** Optional: /public path to a real photo. */
  photo?: string;
  /** Genuine relevant background only. Omit entirely rather than padding it. */
  background: string[];
  /** Why the bundle was built. This is the part buyers actually care about. */
  why: string;
}

const creator: Creator = {
  published: false,
  name: "",
  role: "",
  background: [],
  why: "",
};

export default function CreatorSection() {
  if (!creator.published || !creator.name || !creator.why) return null;

  return (
    <section className="section bg-white">
      <div className="container-page">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="eyebrow">Who built this</p>
            <h2 className="h2 mt-3">Built to make interview preparation systematic</h2>
          </div>

          <div className="card mt-8 p-6 sm:p-8">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
              {creator.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={creator.photo}
                  alt={`${creator.name}, ${creator.role}`}
                  width={96}
                  height={96}
                  className="h-24 w-24 shrink-0 rounded-full object-cover"
                />
              )}
              <div className="min-w-0">
                <p className="text-fluid-base font-bold text-navy-950">{creator.name}</p>
                <p className="text-fluid-sm text-ink-soft">{creator.role}</p>

                {creator.background.length > 0 && (
                  <ul className="mt-4 space-y-1.5">
                    {creator.background.map((item) => (
                      <li key={item} className="text-fluid-sm text-ink-soft">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                <p className="mt-4 text-fluid-sm leading-relaxed text-navy-950">{creator.why}</p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-fluid-xs text-ink-faint">
            {siteConfig.PRODUCT_NAME} is a preparation system, not a hiring service or a
            guarantee of any employment outcome.
          </p>
        </div>
      </div>
    </section>
  );
}
