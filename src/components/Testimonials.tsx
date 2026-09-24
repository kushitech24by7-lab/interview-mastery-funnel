import { siteConfig, supportMailto } from "@/lib/site-config";

/**
 * Testimonials (brief §29 + §45).
 *
 * ── THE RULE ──────────────────────────────────────────────────────────────────
 * The `testimonials` array below is EMPTY, and it must stay empty until real
 * buyers have said real things. No names, no cities, no star ratings, no
 * "10,000+ students" have been invented here.
 *
 * When this array is empty the section renders NOTHING in production — it does
 * not render an empty shell, a "coming soon" strip or grey placeholder cards,
 * because any of those would signal absence where silence is better.
 *
 * ── ADDING REAL TESTIMONIALS ──────────────────────────────────────────────────
 * 1. Add entries below using the exact words the buyer wrote. Never rewrite a
 *    testimonial into a stronger claim than the buyer actually made.
 * 2. Set SHOW_TESTIMONIALS: true in site-config.ts.
 * 3. Only set verifiedPurchase: true when you can actually verify the order.
 */

export interface Testimonial {
  id: string;
  name: string;
  /** Career stage, e.g. "Software Engineer · 3 years experience". */
  role: string;
  city?: string;
  /** The buyer's own words. Never rewrite these into a stronger claim. */
  quote: string;
  /** What they were struggling with before — makes the quote concrete. */
  situationBefore?: string;
  /** The specific thing that changed. Not "I got hired because of this". */
  specificBenefit?: string;
  photo?: string;
  /** Only true when the order can actually be matched to this person. */
  verifiedPurchase: boolean;
  videoUrl?: string;
}

/*
 * COPY DIRECTION for collecting these — not content to publish.
 *
 * The strongest testimonials name a specific behaviour change ("I stopped
 * trying to memorise answers"; "my answers were strong but too long") rather
 * than praising the product ("Amazing!"). When asking buyers for feedback, ask
 * what they did differently, not whether they liked it.
 *
 * Outcome claims such as "I got the job because of this" must not be published
 * even if a buyer volunteers them: we cannot verify them, and §13 rules out
 * implying guaranteed hiring outcomes.
 */

export const testimonials: Testimonial[] = [
  // INTENTIONALLY EMPTY — see the note above. Do not seed with sample data.
];

export default function Testimonials() {
  const hasReal = testimonials.length > 0 && siteConfig.SHOW_TESTIMONIALS;

  // Until genuine testimonials exist, invite feedback rather than either
  // fabricating quotes or leaving a silent gap where social proof belongs.
  if (!hasReal) return <FeedbackInvitation />;

  return (
    <section className="section bg-sand">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">In their words</p>
          <h2 className="h2 mt-3">What buyers have said</h2>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <li key={t.id} className="card flex flex-col p-6">
              <blockquote className="flex-1 text-fluid-sm leading-relaxed text-ink">
                “{t.quote}”
              </blockquote>
              <footer className="mt-4 border-t border-navy-100 pt-4">
                <p className="text-fluid-sm font-semibold text-navy-950">{t.name}</p>
                <p className="text-fluid-xs text-ink-soft">
                  {t.role}
                  {t.city ? ` · ${t.city}` : ""}
                </p>
                {t.verifiedPurchase && (
                  <p className="mt-1.5 inline-flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-wider text-teal-700">
                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified purchase
                  </p>
                )}
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * Shown while no verified testimonials exist.
 *
 * States plainly that the product is new instead of implying a customer base
 * that is not there. Being early is not a weakness worth hiding — and asking
 * for feedback is the only thing on the page that can actually produce the
 * testimonials this section will eventually hold.
 */
function FeedbackInvitation() {
  const mailto = supportMailto(`Feedback on ${siteConfig.PRODUCT_NAME}`);

  return (
    <section className="section bg-sand">
      <div className="container-page">
        <div className="mx-auto max-w-2xl rounded-xl2 border border-navy-100 bg-white p-8 text-center">
          <p className="eyebrow">Reviews</p>
          <h2 className="h2 mt-3 text-fluid-xl">This is a new release</h2>
          <p className="lede mx-auto mt-4 text-fluid-sm">
            We do not publish reviews we cannot verify, so there are none here yet. If you buy{" "}
            {siteConfig.PRODUCT_NAME} and it helps — or if it does not — we would genuinely like to
            hear which parts you actually used.
          </p>
          {mailto && (
            <a href={mailto} className="btn-secondary mt-6 inline-flex">
              Send us your feedback
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
