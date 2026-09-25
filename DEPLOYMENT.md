# Complete Interview Mastery — Deployment Guide

Interview Mastery · interviewmastery.shop · Next.js 15 (App Router) + Tailwind + Razorpay + Google Drive delivery

---

## ⚠️ Read this first — three things that MUST be done before taking real money

The funnel is built and working, but these three items are genuinely blocking. Everything
else is polish.

| # | Blocker | Why it matters | Where |
|---|---------|----------------|-------|
| 1 | **Replace the order store** | The default store is **in-memory**. On Vercel/Lambda, a buyer can pay and hit a different instance that has never heard of their order. | `src/lib/order-store.ts` |
| 2 | **Fill in the remaining placeholders** | Support email, legal business name and the Razorpay/analytics IDs. Price and domain are now set. | `src/lib/site-config.ts` |
| 3 | **Publish real legal content** | `/terms`, `/privacy-policy` and `/refund-policy` render but their bodies are placeholders. Razorpay onboarding and Indian consumer rules expect real ones. | `src/app/(legal)/` |

---

## 1. Install and run

```bash
npm install
cp .env.example .env.local   # then fill in .env.local
npm run dev
```

In development, a yellow banner at the top of the page lists every config value still
set to a placeholder. It is stripped from production builds.

---

## 2. Environment variables

Create `.env.local` (never commit it):

```bash
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
PRODUCT_PRICE_PAISE=69900
PRODUCT_CURRENCY=INR
PRODUCT_DOWNLOAD_URL=https://drive.google.com/drive/folders/xxxxxxxxxxxxx
ACCESS_TOKEN_SECRET=<64-char random hex>
```

### If buyers are not receiving the email

Ask the deployment what it actually has, instead of guessing:

```bash
curl https://interviewmastery.shop/api/diagnostics -H "x-diagnostics-token: YOUR_TOKEN"
```

`email.willSend: false` means **nothing is being delivered** — the variables
below are missing on that deployment. The route returns only which variables
are set, their lengths and non-secret prefixes; never a value. It 404s unless
`DIAGNOSTICS_TOKEN` is set.

In the Vercel function logs, these strings are the ones that matter:

| Log line | Meaning |
| --- | --- |
| `[email] NOT CONFIGURED` | `RESEND_API_KEY` / `EMAIL_FROM` missing — nothing sent |
| `[email] PROVIDER REJECTED SEND` | Resend refused; the logged `status` + `errorType` say why |
| `[fulfilment] DELIVERY FAILED` | Buyer paid and did **not** get the product — act on these |
| `[email] provider accepted` | Success, with the provider message id |

Common provider rejections: **403 + "domain is not verified"** → DNS unfinished;
**401** → wrong or rotated key; **422 + "Invalid `from`"** → `EMAIL_FROM` is not
on a verified domain.

### Email delivery (Resend) — required for fulfilment

The product is delivered **by email**, so these three must be set in
**Vercel → Project → Settings → Environment Variables** or nothing reaches buyers:

| Variable | Secret? | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | **yes** | resend.com → API Keys. Server-only, no `NEXT_PUBLIC_`. |
| `EMAIL_FROM` | no | e.g. `Interview Mastery <noreply@interviewmastery.shop>` |
| `SUPPORT_EMAIL` | no | Defaults to `support@interviewmastery.shop`. |

**DNS you must configure.** In Resend → Domains, add `interviewmastery.shop` and
publish the SPF, DKIM and (recommended) DMARC records it gives you. Until the
domain shows **Verified**, Resend only accepts sends to your own account
address, so real buyers get nothing. Delivery emails from an unverified or
SPF/DKIM-less domain also land in spam, which for a digital product is
indistinguishable from not delivering at all.

**Payments still work without any of this** — the site never blocks a sale on a
mail failure — but the buyer receives no product and the failure is logged as
`[fulfilment] DELIVERY FAILED`. Watch for that string.

**Google Drive sharing.** The folder in `PRODUCT_DOWNLOAD_URL` must be shared so
that recipients of the emailed link can open it — normally **Anyone with the
link → Viewer**. The code does not and cannot change your Drive permissions. If
the folder stays restricted, buyers receive a link that shows "Request access".

### Meta Pixel on Vercel

The pixel id is **public** by design (Meta requires it in the browser) and lives in
`site-config.ts` as `META_PIXEL_ID`. Replace `[META_PIXEL_ID]` with the 15-digit id
from Events Manager; until then every Meta call is a no-op, so nothing throws and
no events are sent.

A Conversions API **access token would be a secret** — if you add CAPI later, set
`META_CAPI_ACCESS_TOKEN` in Vercel → Settings → Environment Variables with **no**
`NEXT_PUBLIC_` prefix, and never place it in `site-config.ts`, which is bundled
into the browser.

Generate the token secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### What must never be public

`RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `ACCESS_TOKEN_SECRET` and
`PRODUCT_DOWNLOAD_URL` are **server-only**. Never prefix any of them with `NEXT_PUBLIC_`.

`src/lib/server-config.ts` imports `server-only`, so if a client component ever imports it
the **build fails** rather than silently shipping your Drive link to every visitor.

To re-verify this yourself at any time:

```bash
npm run build
grep -r "YOUR_DRIVE_FOLDER_ID" .next/static   # must return nothing
```

---

## 3. Price configuration (set it in two places)

The price is deliberately defined twice, and they must agree:

| Where | Purpose |
|-------|---------|
| `PRODUCT_PRICE_PAISE` in `.env.local` | **Authoritative.** What the buyer is actually charged (69900 = ₹699). |
| `PRICE` / `PRICE_IN_PAISE` in `site-config.ts` | Display only, and the analytics conversion value. |
| `BUNDLE_SPECIAL_PRICE` in `pricing.ts` | Display price used across all sections. |

For the current ₹699 offer:

```ts
PRICE: "₹699",
PRICE_IN_PAISE: 69900,
```

```bash
PRODUCT_PRICE_PAISE=69900
```

The browser never sends an amount to the server. The order is created from
`PRODUCT_PRICE_PAISE` server-side, so a visitor editing devtools cannot buy the bundle for ₹1.

### The four price figures

| Figure | Correct label | May be struck through? |
|--------|---------------|------------------------|
| ₹5,688 | Combined individual regular value | **No** — sum of 12 separate listings |
| ₹2,608 | Total at individual special prices | **No** — sum of 12 separate listings |
| ₹2,499 | Regular bundle price | **Yes** — the bundle genuinely sells at this |
| ₹699 | Current special price | n/a — what the buyer pays |

The headline savings claim is **₹1,800 vs the regular bundle price**, not a larger
number against ₹5,688. Comparing a bundle against twelve purchases nobody was going to
make is the pattern that makes sceptical buyers distrust the page.

All wording comes from `priceLabels` in `src/lib/pricing.ts`, so no section can
accidentally relabel a figure. Each comparison can be withdrawn via the `SHOW_*` flags
without touching any component. Build-time guards fail the build if the product prices
stop summing to ₹5,688 / ₹2,608 or if the savings figure stops being ₹1,800.

---

## 4. Razorpay setup

1. Dashboard → **Settings → API Keys** → generate keys. Use `rzp_test_*` until you have
   tested a full purchase.
2. Dashboard → **Settings → Webhooks** → add:
   - URL: `https://interviewmastery.shop/api/razorpay/webhook`
   - Events: `payment.captured`, `payment.failed`
   - Secret: the same value as `RAZORPAY_WEBHOOK_SECRET`
3. Complete KYC before switching to live keys.

> **The path must end in `/webhook`.** A URL of `…/api/razorpay/` (no final
> segment) answers **308 Redirect**, which Razorpay counts as a failed delivery
> and retries into nothing — the handler never runs. This has already happened
> once on this account. After saving, confirm with:
>
> ```
> curl -s -o /dev/null -w '%{http_code}
' -X POST >   https://interviewmastery.shop/api/razorpay/webhook -d '{}'
> ```
>
> **400** is correct — the route is live and rejecting an unsigned request.
> **308** means the URL is wrong. **503** means `RAZORPAY_WEBHOOK_SECRET` is
> unset on the deployment.
>
> To change the URL, **edit the existing webhook rather than creating a new
> one** — a new webhook issues a new secret that must then be updated in the
> hosting environment. Note there is no merchant API for this: Razorpay's
> update-webhook endpoint is a Partner API, so the dashboard is the only route.

### Why the webhook matters

The browser-side verification fails if the buyer closes the tab, loses signal, or their
phone kills the browser right after paying. Razorpay still calls the webhook, so the order
is marked paid regardless. **Without it, "I paid and got nothing" becomes a real and
frequent support case.**

---

## 5. Payment flow (what actually happens)

```
Buyer clicks CTA
  → POST /api/razorpay/create-order      (server sets the amount)
  → Razorpay checkout opens
  → Buyer pays
  → POST /api/razorpay/verify            (server recomputes the HMAC signature)
  → signature valid? → mark paid, set httpOnly signed access cookie
  → redirect to /thank-you
  → GET /api/access                      (re-validates the token, returns Drive URL)
```

Two properties worth knowing:

- **Client-side verification is never trusted.** The `handler` callback is treated as
  "probably paid, now go ask the server". Only the server's verify response advances the buyer.
- **The `Purchase` pixel fires only on `/thank-you`**, after server verification — so your
  Meta reporting counts verified purchases, not attempts.

---

## 6. Google Drive delivery — an honest note on "protection"

Put the 12 PDFs in a Drive folder and set `PRODUCT_DOWNLOAD_URL`.

If that folder is shared as **"anyone with the link"**, then anyone who receives the link
can open it. The signed access token protects *your access page*; it cannot protect a Drive
link once it has been shared onward.

The site's copy is written to match this reality and never claims the files are
individually protected or DRM-secured. Do not add such a claim.

If you later want genuine per-buyer access, the options are:

1. Collect the buyer's email at checkout and grant per-email Drive permission (manual or via
   the Drive API).
2. Serve files through your own authenticated proxy route instead of Drive.
3. Use a digital-delivery service that issues expiring per-order links.

---

## 7. Replacing the order store (blocker #1)

`src/lib/order-store.ts` exports a tiny `OrderStore` interface. Implement it against a real
database and export that instead:

```ts
export const store: OrderStore = myPostgresStore;
```

Any of Supabase, Postgres, MongoDB, PlanetScale or Upstash Redis is fine. Once the store is
durable, set `STORE_IS_EPHEMERAL` handling aside — the verify route will start treating an
unknown order id as a hard error, which is the behaviour you want in production.

---

## 8. Product images

**Covers — DONE.** All 12 real 3D covers ship at `public/covers/p01–p12.webp` and are
mapped in `src/lib/products.ts`. The typographic fallback in `ProductCover.tsx` now only
appears if an image fails to load over the network.

**Interior previews** — export the pages listed in `src/components/PreviewGallery.tsx`,
save them to `public/previews/`, then flip `available: true` for each one you added. Until
at least one is available, the preview section explains that previews are being prepared
rather than showing mock-ups.

**Open Graph image** — add `public/og/complete-interview-mastery.jpg` at 1200×630.

---

## 9. Testimonials

`src/components/Testimonials.tsx` ships with an **empty array**, and the section renders
nothing at all. This is deliberate: no invented names, quotes, ratings or student counts.

When you have genuine testimonials:

1. Add them to the array using the buyer's own words — never strengthen a claim.
2. Set `SHOW_TESTIMONIALS: true` in `site-config.ts`.
3. Only set `verifiedPurchase: true` where you can actually verify the order.

---

## 10. Analytics

Set `META_PIXEL_ID` and `GA4_ID` in `site-config.ts`. Both stay completely inert while
unconfigured, so nothing throws before you have them.

Events: `PageView`, `ViewContent`, `HeroCTA_Click`, `BundleSection_View`,
`ProductPreview_Open`, `FrameworkSection_View`, `Pricing_View`, `PricingCTA_Click`,
`InitiateCheckout`, `RazorpayOpened`, `PaymentSuccess`, `Purchase`, `PaymentFailure`,
`FAQ_Open`, `Support_Click`, `Access_Click`, `StickyCTA_Click`.

UTM parameters (`utm_*`, `fbclid`, `gclid`) are captured on landing, persisted for the
session, attached to the Razorpay order notes, and included on every event — so attribution
survives the checkout hop.

### The Meta standard funnel

| Event | Fires | Where |
| --- | --- | --- |
| `PageView` | once, on load | base pixel snippet in `layout.tsx` |
| `ViewContent` | once per page view | `trackViewContent()` from `Hero.tsx` |
| `InitiateCheckout` | after the order exists, as the modal opens | `trackInitiateCheckout()` in `CheckoutButton.tsx` |
| `Purchase` | only after server-side signature verification | `trackVerifiedPurchase()` from `SuccessClient.tsx` |

`ViewContent`, `InitiateCheckout` and `Purchase` all carry `content_name`,
`content_ids`, `content_type`, `value` (699) and `currency` (INR); the latter two
also carry `num_items: 1`.

**Do not add a second `PageView`.** The base snippet already fires it and guards
re-init with `if(f.fbq)return`.

**`InitiateCheckout` deliberately does not fire on click.** It fires once the
Razorpay order has been created and the SDK is loaded, immediately before
`razorpay.open()`. Firing on click would count attempts that never reached
Razorpay, teaching Meta to optimise for clicks rather than checkouts.

**`Purchase` cannot fire from an unverified page.** `/thank-you` is a server
component that verifies the signed access cookie before rendering; the order and
payment ids come from the token payload, not the query string, so a crafted URL
renders the "we couldn't confirm a purchase" state and never mounts the pixel.

Duplicate purchases are blocked by three independent layers: a module-level
`Set` (React Strict Mode / remounts), a `localStorage` key (reload, back/forward,
restored tab) and Meta's own `eventID: orderId` deduplication.

### Conversions API — not implemented

There is **no** CAPI integration, and none is faked. The browser event is already
structured for one: it sends `eventID: orderId`, the same stable id a server event
would use, so Meta would deduplicate the pair automatically.

To add it later you would need:

1. `META_CAPI_ACCESS_TOKEN` — a **server-only** env var. It must never carry the
   `NEXT_PUBLIC_` prefix, or it ships to the browser and can be used to write
   events into your pixel.
2. A server route (e.g. `POST /api/meta/capi`) called from the **verify** route,
   after signature verification succeeds — not from the browser.
3. The same `eventID` (the Razorpay order id) plus `action_source: "website"` and
   `event_source_url`.
4. Hashed customer data (SHA-256 email/phone) only if you collect it; do not send
   raw PII.

Until all four exist, the browser pixel alone is the honest implementation.

---

## 11. Meta Ads message match

Append a variant to the ad's destination URL:

| URL | Angle |
|-----|-------|
| `/?v=price` | Price-led — only for ads that already state ₹699 |
| `/` | Stop preparing one random question at a time |
| `/?v=soon` | Interview coming up? |
| `/?v=questions` | 500 questions, without memorising 500 answers |
| `/?v=english` | Struggle to say it clearly? |
| `/?v=tmay` | "Tell me about yourself" |
| `/?v=fresher` | Fresh graduates |
| `/?v=switcher` | Job switchers |

An unrecognised value falls back to the general variant. Alternative final-CTA headlines for
A/B testing are in `src/lib/variants.ts`.

---

## 12. Deploy

Vercel is the path of least resistance:

```bash
npx vercel
```

Add every variable from `.env.local` in **Project → Settings → Environment Variables**, then
set `SITE_URL` in `site-config.ts` to the live domain so canonical URLs, Open Graph tags and
the sitemap are correct.

Any Node host works — `npm run build && npm start`. Static-only hosting will **not**, because
the payment routes need a server.

---

## 13. Pre-launch checklist

**Blocking**

- [ ] Durable order store replaces the in-memory one
- [ ] `PRODUCT_PRICE_PAISE=69900` set in the hosting environment
- [ ] `SUPPORT_EMAIL` is real and monitored
- [ ] `LEGAL_BUSINESS_NAME` set (the registered Razorpay merchant name, which may
      differ from the "Interview Mastery" brand)
- [ ] Real content written for `/terms`, `/privacy-policy`, `/refund-policy`
- [ ] `REFUND_POLICY_SUMMARY` replaced with the real policy
- [ ] DNS: `interviewmastery.shop` A/ALIAS record pointing at the host
- [ ] DNS: `www.interviewmastery.shop` CNAME (the app 308-redirects www → apex)
- [ ] HTTPS certificate issued for both apex and www
- [ ] Live Razorpay keys, KYC complete
- [ ] Webhook configured and tested
- [ ] `PRODUCT_DOWNLOAD_URL` points at the folder with all 12 PDFs
- [ ] `ACCESS_TOKEN_SECRET` is a fresh random value
- [ ] One real end-to-end test purchase completed
- [ ] `grep -r "<drive-folder-id>" .next/static` returns nothing

**Strongly recommended**

- [x] Real cover images in `public/covers/` — all 12 shipped
- [ ] At least 5 interior previews in `public/previews/`
- [ ] OG image added
- [ ] Meta Pixel and GA4 configured and firing
- [ ] Tested on a real mid-range Android phone on mobile data

**Do not do**

- [ ] Do not add testimonials you did not receive
- [ ] Do not strike through ₹5,688 or ₹2,608 — they are sums of separate listings,
      not prices this bundle ever sold at. Only ₹2,499 may be struck through.
- [ ] Do not call ₹5,688 an "MRP"
- [ ] Do not add countdown timers or fake stock counters
- [ ] Do not claim guaranteed jobs, salaries or outcomes
- [ ] Do not describe Drive "anyone with link" access as individually protected

---

## 14. Project structure

```
src/
├── app/
│   ├── layout.tsx              SEO, OG, pixel loaders
│   ├── page.tsx                the landing page
│   ├── success/page.tsx        verified thank-you page
│   ├── access/page.tsx         returning-buyer library page
│   ├── error.tsx  loading.tsx  not-found.tsx
│   └── api/razorpay/
│       ├── create-order/       server sets the amount
│       ├── verify/             HMAC signature verification
│       └── webhook/            safety net for closed browsers
├── components/                 28 components
├── lib/
│   ├── site-config.ts          ← edit this
│   ├── products.ts             12 resources, 619 pages (verified)
│   ├── server-config.ts        server-only secrets
│   ├── access-token.ts         signed access tokens
│   ├── order-store.ts          ← replace before launch
│   ├── analytics.ts            events + UTM capture
│   └── variants.ts             ad message match + A/B
└── styles/globals.css
```

---

## 15. Verified during the build

- Production build compiles clean, no type errors
- 135 kB first-load JS on the landing page
- No horizontal scroll at 360px; layout verified 360 → 1280px
- Secrets absent from all client bundles (canary-value scan)
- `/api/access` returns 403 for missing, forged and expired tokens; 200 for valid
- `/api/razorpay/verify` rejects forged and incomplete signatures, accepts a correct HMAC
- Webhook rejects unsigned payloads
- `/success` and `/access` show the support path, not the bundle, without a valid token
- Single `h1`, no heading-level jumps, all images have alt text
- Interactive tap targets ≥44px except the skip link and one footer link
