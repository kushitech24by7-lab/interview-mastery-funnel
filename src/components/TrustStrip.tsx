import { siteConfig, isPlaceholder } from "@/lib/site-config";
import { factStrip } from "@/lib/products";
import { displayPrices } from "@/lib/pricing";

/**
 * Reassurance strip + numerical proof (brief §4 + §9).
 * Only claims that are actually implemented appear here.
 */

export function TrustStrip() {
  const items = [
    { icon: <LibraryIcon />, label: `${siteConfig.TOTAL_PRODUCTS} finished resources` },
    { icon: <PagesIcon />, label: `${siteConfig.TOTAL_PAGES} actual pages` },
    { icon: <LockIcon />, label: "Secure Razorpay checkout" },
    { icon: <DownloadIcon />, label: "Digital download" },
    { icon: <NoRepeatIcon />, label: "No subscription" },
    ...(!isPlaceholder(siteConfig.SUPPORT_EMAIL)
      ? [{ icon: <SupportIcon />, label: "Support available" }]
      : []),
  ];

  return (
    <section aria-label="What you get" className="border-b border-navy-100 bg-sand">
      <div className="container-page">
        <ul className="swipe-rail hide-scrollbar py-4 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-3 sm:overflow-visible sm:pb-4">
          {items.map((item) => (
            <li
              key={item.label}
              className="flex items-center gap-2 whitespace-nowrap text-fluid-sm font-medium text-navy-800"
            >
              <span className="text-teal-600">{item.icon}</span>
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** The big numbers (brief §4) — a swipe rail on mobile, a grid on desktop. */
export function FactStrip() {
  return (
    <section aria-label="Bundle contents at a glance" className="bg-navy-950 py-8 text-white sm:py-10">
      <div className="container-page">
        <ul className="swipe-rail hide-scrollbar sm:grid sm:grid-cols-4 sm:gap-6 sm:overflow-visible sm:pb-0 lg:grid-cols-8">
          {[...factStrip, { value: displayPrices.special, label: "Current bundle price" }].map((fact) => (
            <li
              key={fact.label}
              className="min-w-[7.5rem] rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-center sm:min-w-0"
            >
              <p className="text-fluid-2xl font-bold leading-none text-amber-400">{fact.value}</p>
              <p className="mt-1.5 text-fluid-xs leading-snug text-navy-200">{fact.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function LibraryIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M3 3h3v14H3V3zm4.5 0h3v14h-3V3zM12 3.6l2.9-.8 3.6 13.5-2.9.8L12 3.6z" />
    </svg>
  );
}
function PagesIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M4 2h8l4 4v12H4V2zm8 1.5V6h2.5L12 3.5zM6 9h8v1.5H6V9zm0 3h8v1.5H6V12z" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 1a4 4 0 00-4 4v2H5a1 1 0 00-1 1v9a1 1 0 001 1h10a1 1 0 001-1V8a1 1 0 00-1-1h-1V5a4 4 0 00-4-4zM8 5a2 2 0 114 0v2H8V5z"
        clipRule="evenodd"
      />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10 2v9.6l3.3-3.3 1.4 1.4-5.7 5.7-5.7-5.7 1.4-1.4L8 11.6V2h2zM3 16h14v2H3v-2z" />
    </svg>
  );
}
function NoRepeatIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 110-16 8 8 0 010 16zM6.8 6.8l6.4 6.4 1.4-1.4-6.4-6.4-1.4 1.4z"
        clipRule="evenodd"
      />
    </svg>
  );
}
function SupportIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M18 10a8 8 0 10-3.1 6.3l3.1.7-.7-3.1A7.96 7.96 0 0018 10zM7 9h6v1.5H7V9zm0 3h4v1.5H7V12z" />
    </svg>
  );
}
