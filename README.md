# Complete Interview Mastery — Sales Funnel

Production-ready sales funnel for **Interview Mastery**'s Complete Interview Mastery bundle:
12 resources, 619 pages, sold to Indian job seekers via Meta Ads, paid through Razorpay and
delivered from Google Drive after verified payment.

```bash
npm install
cp .env.example .env.local    # fill this in
npm run dev
```

👉 **[DEPLOYMENT.md](DEPLOYMENT.md) has the full setup, the security model and the
pre-launch checklist. Read it before taking real payments.**

---

## What is here

| Piece | Where |
|-------|-------|
| Landing page (25 sections) | `src/app/page.tsx` |
| Verified thank-you page | `src/app/success/page.tsx` |
| Returning-buyer library | `src/app/access/page.tsx` |
| Razorpay order + verify + webhook | `src/app/api/razorpay/` |
| Gated delivery link | `src/app/api/access/` |
| **Business config — edit this first** | `src/lib/site-config.ts` |

---

## Three things to change before launch

1. **`src/lib/site-config.ts`** — replace every `[PLACEHOLDER]`: price, support email,
   legal name, policy URLs, Razorpay key, pixel IDs. A dev-only banner lists whatever is
   still outstanding.
2. **`src/lib/order-store.ts`** — the default store is in-memory and **will lose orders on
   serverless hosting**. Swap in a real database.
3. **Publish a refund policy** and put it in `REFUND_POLICY_SUMMARY` / `REFUND_POLICY_URL`.
   Nothing here invents policy text.

---

## How payment security works

The amount is set **server-side** from `PRODUCT_PRICE_PAISE` — the browser never sends a
price, so it cannot be edited in devtools. Every payment's HMAC signature is recomputed on
the server with the key secret before anything is marked paid. Access is then released only
against a short-lived signed token.

`src/lib/server-config.ts` imports `server-only`, so the build **fails** if a client
component ever imports the file holding your key secret or Drive URL. Verify any time with:

```bash
npm run build && grep -r "YOUR_DRIVE_FOLDER_ID" .next/static
```

(Returns nothing = your deliverable is not in the browser bundle.)

---

## Claims discipline

Several things are deliberately absent, and each is load-bearing for trust rather than an
oversight:

- **No testimonials.** The array is empty and the section renders nothing until you add real
  ones. No invented names, quotes, ratings or student counts.
- **No fake page previews.** The preview gallery stays empty until real exported pages are
  added. Fallback covers are typographic panels built from true title/page data — never a
  mock-up passed off as a scan.
- **No fake anchor price**, no countdown timers, no stock counters.
- **No guaranteed outcomes.** The FAQ answers "will this get me a job?" with a plain no, and
  explains what the product does instead.
- **No overstated delivery security.** If the Drive folder is "anyone with link", the copy
  does not claim otherwise.

The page count is enforced in code: `src/lib/products.ts` throws at build time in
development if the 12 resources stop summing to 619 pages.

---

## Ad variants

Append `?v=` to the destination URL to match the hero to the ad creative:
`soon`, `questions`, `english`, `tmay`, `fresher`, `switcher`. Unknown values fall back
safely to the general headline. Defined in `src/lib/variants.ts`.

---

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Razorpay Node SDK

Mobile-first (designed at 360px up), no animation libraries, ~135 kB first-load JS.
