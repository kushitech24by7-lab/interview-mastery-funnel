"use client";

import { useEffect } from "react";

/**
 * Global error boundary (brief §59 item 24).
 * Never shows a stack trace to a buyer — offers a retry and a way back.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[page error]", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center bg-sand">
      <div className="container-page py-12">
        <div className="mx-auto max-w-md rounded-xl2 border border-navy-100 bg-white p-8 text-center shadow-card">
          <h1 className="text-fluid-2xl font-bold text-navy-950">Something went wrong</h1>
          <p className="mt-3 text-fluid-sm text-ink-soft">
            Sorry — this page failed to load properly. Please try again.
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-fluid-xs text-ink-faint">Reference: {error.digest}</p>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button type="button" onClick={reset} className="btn-primary">
              Try again
            </button>
            <a href="/" className="btn-secondary">
              Back to the main page
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
