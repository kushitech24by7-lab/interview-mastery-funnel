import { pendingConfigKeys } from "@/lib/site-config";

/**
 * Development-only launch checklist.
 *
 * Renders a visible banner listing every configuration value still set to a
 * placeholder. It is stripped entirely from production builds, so buyers never
 * see it — its only job is to stop the page going live with "[PRICE]" on the
 * pricing card, which is exactly the kind of thing that survives to launch when
 * nothing complains about it.
 */

export default function ConfigWarning() {
  if (process.env.NODE_ENV === "production") return null;

  const pending = pendingConfigKeys();
  if (pending.length === 0) return null;

  return (
    <div className="sticky top-0 z-[70] border-b-2 border-amber-500 bg-amber-100 px-4 py-2.5 text-amber-950">
      <details>
        <summary className="cursor-pointer text-sm font-bold">
          ⚠️ Dev only — {pending.length} configuration{" "}
          {pending.length === 1 ? "value" : "values"} still need real data (click to expand)
        </summary>
        <div className="mt-2 text-xs leading-relaxed">
          <p className="font-semibold">Set these in src/lib/site-config.ts before launch:</p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {pending.map((key) => (
              <li key={key} className="rounded bg-amber-200 px-2 py-0.5 font-mono">
                {key}
              </li>
            ))}
          </ul>
          <p className="mt-2">
            Server-side secrets (RAZORPAY_KEY_SECRET, PRODUCT_DOWNLOAD_URL, ACCESS_TOKEN_SECRET) go
            in <code className="rounded bg-amber-200 px-1">.env.local</code> — see DEPLOYMENT.md.
          </p>
        </div>
      </details>
    </div>
  );
}
