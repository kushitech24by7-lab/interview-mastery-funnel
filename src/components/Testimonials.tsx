import { siteConfig } from "@/lib/site-config";

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
  role: string;
  city?: string;
  quote: string;
  photo?: string;
  verifiedPurchase: boolean;
  videoUrl?: string;
}

export const testimonials: Testimonial[] = [
  // INTENTIONALLY EMPTY — see the note above. Do not seed with sample data.
];

export default function Testimonials() {
  const hasReal = testimonials.length > 0 && siteConfig.SHOW_TESTIMONIALS;

  // Renders nothing at all until genuine testimonials exist.
  if (!hasReal) return null;

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
