"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { track } from "@/lib/analytics";

/**
 * Real product preview gallery (brief §28 + §55).
 *
 * ── THE HONESTY RULE, ENFORCED IN CODE ────────────────────────────────────────
 * Every item here must be an ACTUAL page exported from an ACTUAL PDF. Until
 * those files exist in /public/previews, this component renders an explicit
 * "previews coming" state rather than mock page images. There is deliberately
 * NO fallback that draws a fake page: a fabricated screenshot would be the one
 * thing most likely to make a real buyer feel deceived on delivery.
 *
 * ── HOW TO ADD THE REAL PREVIEWS ──────────────────────────────────────────────
 * 1. Export the pages listed below as JPG/WebP, ~1200px wide, lightly compressed.
 * 2. Save them to /public/previews/ using the `src` filenames below.
 * 3. Set `available: true` on each item you have added.
 *
 * Show enough to prove quality; do not publish full-resolution complete pages
 * of the paid material.
 */

interface PreviewItem {
  id: string;
  src: string;
  product: string;
  caption: string;
  /** Flip to true once the real exported page is in /public/previews. */
  available: boolean;
}

const previews: PreviewItem[] = [
  { id: "p03-frameworks", src: "/previews/p03-framework-library.jpg", product: "P03", caption: "The answer framework library", available: false },
  { id: "p03-evidence", src: "/previews/p03-evidence-bank.jpg", product: "P03", caption: "12-story evidence bank", available: false },
  { id: "p04-star", src: "/previews/p04-star-example.jpg", product: "P04", caption: "A worked STAR+ example", available: false },
  { id: "p02-clarity", src: "/previews/p02-clarity.jpg", product: "P02", caption: "The clarity hierarchy", available: false },
  { id: "p05-ppf", src: "/previews/p05-present-past-future.jpg", product: "P05", caption: "Present–Past–Future in practice", available: false },
  { id: "p06-recovery", src: "/previews/p06-recovery-framework.jpg", product: "P06", caption: "Fact → Context → Ownership → Action → Readiness", available: false },
  { id: "p08-scoring", src: "/previews/p08-scoring-rubric.jpg", product: "P08", caption: "The mock interview scoring rubric", available: false },
  { id: "p09-research", src: "/previews/p09-45-minute-system.jpg", product: "P09", caption: "45-minute company research system", available: false },
  { id: "p10-worksheet", src: "/previews/p10-star-builder.jpg", product: "P10", caption: "STAR story builder worksheet", available: false },
  { id: "p12-card", src: "/previews/p12-final-revision-card.jpg", product: "P12", caption: "Final 10-Minute Revision Card", available: false },
];

export default function PreviewGallery() {
  const [lightbox, setLightbox] = useState<PreviewItem | null>(null);
  const live = previews.filter((p) => p.available);

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
            These are real pages from the resources you receive — not marketing mock-ups.
          </p>
        </div>

        {live.length > 0 ? (
          <>
            <ul className="swipe-rail mt-10 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible">
              {live.map((item) => (
                <li key={item.id} className="w-[13rem] lg:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setLightbox(item);
                      track("ProductPreview_Open", { preview: item.id, product: item.product });
                    }}
                    className="group w-full text-left"
                    aria-label={`Enlarge preview: ${item.caption} from ${item.product}`}
                  >
                    <span className="relative block aspect-[1/1.414] overflow-hidden rounded-lg border border-navy-200 bg-sand shadow-card transition-shadow group-hover:shadow-lift">
                      <Image
                        src={item.src}
                        alt={`${item.caption} — page from ${item.product}`}
                        fill
                        sizes="(max-width: 1024px) 208px, 220px"
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
              Tap any page to enlarge.
            </p>
          </>
        ) : (
          <PreviewPlaceholder />
        )}
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
              alt={`${lightbox.caption} — page from ${lightbox.product}`}
              width={1200}
              height={1697}
              className="h-auto max-h-[85vh] w-full rounded-lg object-contain"
            />
            <p className="mt-3 text-center text-fluid-sm text-white">
              <span className="font-bold">{lightbox.product}</span> · {lightbox.caption}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

/**
 * Shown while real page exports are not yet in place. States the situation
 * plainly instead of substituting invented imagery.
 */
function PreviewPlaceholder() {
  return (
    <div className="mx-auto mt-10 max-w-2xl rounded-xl2 border-2 border-dashed border-navy-200 bg-sand p-8 text-center">
      <p className="text-fluid-base font-semibold text-navy-950">
        Page previews are being prepared.
      </p>
      <p className="mx-auto mt-2 max-w-md text-fluid-sm text-ink-soft">
        We only publish real pages exported from the actual resources. Rather than show mock-ups,
        this section stays empty until those exports are in place.
      </p>
      <p className="mt-4 text-fluid-xs text-ink-faint">
        Developer note: add the exported pages to <code className="rounded bg-white px-1.5 py-0.5">/public/previews</code>{" "}
        and set <code className="rounded bg-white px-1.5 py-0.5">available: true</code> in{" "}
        <code className="rounded bg-white px-1.5 py-0.5">PreviewGallery.tsx</code>.
      </p>
    </div>
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
