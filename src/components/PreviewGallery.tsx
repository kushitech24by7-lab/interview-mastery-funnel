"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { track } from "@/lib/analytics";
import { siteConfig } from "@/lib/site-config";

/**
 * Real product preview gallery (brief §28 + §55).
 *
 * ── THE HONESTY RULE, ENFORCED IN CODE ────────────────────────────────────────
 * Every image here is an ACTUAL page rendered from the ACTUAL shipped PDF, at
 * the page number recorded in `sourcePage`. Nothing is redrawn, retouched or
 * mocked up. If a page is ever replaced, re-export it from the same source file
 * rather than editing the image.
 *
 * ── WHY TWO IMAGE SIZES ───────────────────────────────────────────────────────
 * The grid loads `thumb` (~520px, lazy) and the lightbox loads the full-width
 * render only when a card is opened. Loading ten full pages up front would cost
 * ~900KB on a phone for a section most visitors only scroll past.
 *
 * ── WHAT IS DELIBERATELY NOT HERE ─────────────────────────────────────────────
 * No PDF is linked, embedded or fetched by this component, so the preview
 * cannot be used to obtain the paid material. Only these ten selected page
 * images exist under /public/previews.
 *
 * P03 and P04 still carry the retired "Mastery Library" brand in their running
 * header, so those two renders are clipped below the header band: real content,
 * without showing customers a brand name the site no longer uses. Re-exporting
 * those two PDFs under the current brand would let the clip be removed.
 */

interface PreviewItem {
  id: string;
  /** Full-size render, loaded only when the lightbox opens. */
  src: string;
  /** Small render used in the grid. */
  thumb: string;
  /** Resource code and title, as the buyer will see them in the bundle. */
  product: string;
  /** Page number in the source PDF — keeps every image traceable. */
  sourcePage: number;
  /** What this page lets the buyer DO, not what it is called. */
  caption: string;
}

const previews: PreviewItem[] = [
  {
    id: "p03-question-bank",
    src: "/previews/p03-question-bank.webp",
    thumb: "/previews/p03-question-bank-thumb.webp",
    product: "P03 — 500 Interview Questions",
    sourcePage: 7,
    caption: "Each question shows what is being tested, the framework to use, and what to avoid",
  },
  {
    id: "p04-star-example",
    src: "/previews/p04-star-example.webp",
    thumb: "/previews/p04-star-example-thumb.webp",
    product: "P04 — 100 STAR Answer Examples",
    sourcePage: 6,
    caption: "Worked STAR answers with competencies, reflection and how to adapt the story",
  },
  {
    id: "p05-tmay-example",
    src: "/previews/p05-tmay-example.webp",
    thumb: "/previews/p05-tmay-example-thumb.webp",
    product: "P05 — Tell Me About Yourself",
    sourcePage: 18,
    caption: "Annotated example answers you can model your own introduction on",
  },
  {
    id: "p06-difficult",
    src: "/previews/p06-difficult.webp",
    thumb: "/previews/p06-difficult-thumb.webp",
    product: "P06 — Difficult Questions Guide",
    sourcePage: 6,
    caption: "How to answer the questions candidates most often get wrong",
  },
  {
    id: "p08-scoring-rubric",
    src: "/previews/p08-scoring-rubric.webp",
    thumb: "/previews/p08-scoring-rubric-thumb.webp",
    product: "P08 — Mock Interview Workbook",
    sourcePage: 7,
    caption: "The scoring rubric that turns practice into something you can measure",
  },
  {
    id: "p09-research-system",
    src: "/previews/p09-research-system.webp",
    thumb: "/previews/p09-research-system-thumb.webp",
    product: "P09 — Company Research Workbook",
    sourcePage: 4,
    caption: "Turn 45 minutes of company research into answers you can actually use",
  },
  {
    id: "p10-answer-builder",
    src: "/previews/p10-answer-builder.webp",
    thumb: "/previews/p10-answer-builder-thumb.webp",
    product: "P10 — Answer Builder Worksheets",
    sourcePage: 6,
    caption: "Build your own answers from your own experience, step by step",
  },
  {
    id: "p07-salary",
    src: "/previews/p07-salary.webp",
    thumb: "/previews/p07-salary-thumb.webp",
    product: "P07 — Salary Negotiation Guide",
    sourcePage: 6,
    caption: "Prepare the compensation conversation before you are put on the spot",
  },
  {
    id: "p11-interview-day",
    src: "/previews/p11-interview-day.webp",
    thumb: "/previews/p11-interview-day-thumb.webp",
    product: "P11 — Interview Day Toolkit",
    sourcePage: 6,
    caption: "The final-hour sequence for the morning of the interview",
  },
  {
    id: "p12-master-checklist",
    src: "/previews/p12-master-checklist.webp",
    thumb: "/previews/p12-master-checklist-thumb.webp",
    product: "P12 — Templates & Checklists",
    sourcePage: 4,
    caption: "The master preparation checklist covering role, company, self and practice",
  },
];

export default function PreviewGallery() {
  const [lightbox, setLightbox] = useState<PreviewItem | null>(null);
  const live = previews;

  const close = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, close]);

  return (
    <section id="preview" className="section bg-white">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Look inside</p>
          <h2 className="h2 mt-3">See the actual pages before you buy.</h2>
          <p className="lede mx-auto mt-4">
            Preview selected pages from the resources included in {siteConfig.PRODUCT_NAME}.
            These are real pages from the files you receive — not marketing mock-ups.
          </p>
        </div>

        {live.length > 0 ? (
          <>
            <ul className="swipe-rail mt-10 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible lg:grid-cols-5">
              {live.map((item) => (
                <li key={item.id} className="w-[13rem] sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setLightbox(item);
                      track("ProductPreview_Open", { preview: item.id, product: item.product });
                    }}
                    className="group w-full text-left"
                    aria-label={`Enlarge page ${item.sourcePage} of ${item.product}`}
                  >
                    <span className="relative block aspect-[1/1.414] overflow-hidden rounded-lg border border-navy-200 bg-sand shadow-card transition-shadow group-hover:shadow-lift">
                      <Image
                        src={item.thumb}
                        alt={`${item.product}, page ${item.sourcePage}: ${item.caption}`}
                        fill
                        sizes="(max-width: 640px) 208px, (max-width: 1024px) 30vw, 220px"
                        loading="lazy"
                        className="object-cover object-top"
                      />
                      <span className="absolute bottom-2 right-2 rounded-full bg-navy-950/80 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <ZoomIcon />
                      </span>
                    </span>
                    <span className="mt-2 block text-fluid-xs font-semibold text-navy-900">
                      {item.product}
                    </span>
                    <span className="block text-fluid-xs leading-snug text-ink-soft">
                      {item.caption}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-center text-fluid-xs text-ink-faint">
              Tap any page to enlarge. Showing {live.length} selected pages of{" "}
              {siteConfig.TOTAL_PAGES} across all {siteConfig.TOTAL_PRODUCTS} resources.
            </p>
          </>
        ) : null}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${lightbox.caption} — enlarged preview`}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-950/90 p-4"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close preview"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
          >
            <CloseIcon />
          </button>
          <div
            className="relative max-h-[85vh] w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightbox.src}
              alt={`${lightbox.product}, page ${lightbox.sourcePage}: ${lightbox.caption}`}
              width={1200}
              height={1697}
              className="h-auto max-h-[85vh] w-full rounded-lg object-contain"
            />
            <p className="mt-3 text-center text-fluid-sm text-white">
              <span className="font-bold">{lightbox.product}</span> · page {lightbox.sourcePage}
              <br />
              {lightbox.caption}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function ZoomIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M9 3.5a5.5 5.5 0 103.4 9.9l3.6 3.6 1.4-1.4-3.6-3.6A5.5 5.5 0 009 3.5zm-3.5 5.5a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0zM8.25 7h1.5v1.25H11v1.5H9.75V11h-1.5V9.75H7v-1.5h1.25V7z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M5.3 5.3a1 1 0 011.4 0L10 8.6l3.3-3.3a1 1 0 111.4 1.4L11.4 10l3.3 3.3a1 1 0 01-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 01-1.4-1.4L8.6 10 5.3 6.7a1 1 0 010-1.4z" />
    </svg>
  );
}
