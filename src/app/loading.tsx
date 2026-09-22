/** Route-level loading skeleton — avoids a blank screen on slow mobile connections. */
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950" role="status" aria-label="Loading">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-teal-400" />
        <p className="mt-4 text-sm text-navy-300">Loading…</p>
      </div>
    </div>
  );
}
