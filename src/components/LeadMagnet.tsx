import { siteConfig } from "@/lib/site-config";

/**
 * Low-friction next step for visitors who are interested but not ready to pay (§14).
 *
 * ── WHY THIS IS SWITCHED OFF ──────────────────────────────────────────────────
 * The project has NO email infrastructure: no list provider, no transactional
 * sender, no subscriber storage, and no consent record. A form that accepted an
 * address and delivered nothing would be worse than no form at all — it would
 * take real contact details under a promise the site cannot keep, and the
 * current Privacy Policy does not describe marketing email at all.
 *
 * §14 says to build the component but not to create a fake submission flow, so
 * the markup is finished and `ENABLED` stays false until the pieces below exist.
 *
 * ── TO TURN IT ON, CONNECT ────────────────────────────────────────────────────
 * 1. An email provider (e.g. Resend, Brevo, Mailchimp) + API key as a
 *    server-only env var, following the pattern in src/lib/server-config.ts.
 * 2. A POST /api/lead route: validate the address, store it, trigger delivery.
 *    Rate-limit it — an unprotected public endpoint will be abused.
 * 3. A real free pack to send (25 questions + 5 frameworks), hosted like the
 *    main bundle.
 * 4. A Privacy Policy update covering marketing email and how to unsubscribe,
 *    plus an unsubscribe link in every send. Consent must be explicit and logged.
 * 5. A `Lead_Submit` analytics event, alongside the existing track() calls.
 *
 * Until all five exist, leaving this off is the honest state.
 */

const ENABLED = false;

export default function LeadMagnet() {
  if (!ENABLED) return null;

  return (
    <section className="section bg-white">
      <div className="container-page">
        <div className="mx-auto max-w-2xl rounded-xl2 border border-navy-100 bg-sand p-8 text-center sm:p-10">
          <p className="eyebrow">Not ready for the full bundle?</p>
          <h2 className="h2 mt-3 text-fluid-xl">
            Get 25 interview questions + 5 answer frameworks free
          </h2>
          <p className="lede mx-auto mt-4 text-fluid-sm">
            A quick preparation pack you can use before your next interview — and a sample of the
            approach used inside {siteConfig.PRODUCT_NAME}.
          </p>

          <form
            className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
            action="/api/lead"
            method="post"
          >
            <label htmlFor="lead-email" className="sr-only">
              Email address
            </label>
            <input
              id="lead-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="min-h-[2.75rem] flex-1 rounded-lg border border-navy-200 px-4 text-fluid-sm text-navy-950"
            />
            <button type="submit" className="btn-primary min-h-[2.75rem] shrink-0">
              Send me the free pack
            </button>
          </form>

          <p className="mt-3 text-fluid-xs text-ink-faint">
            No spam. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}
