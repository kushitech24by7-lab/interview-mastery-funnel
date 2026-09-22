import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center bg-sand">
      <div className="container-page py-12">
        <div className="mx-auto max-w-md rounded-xl2 border border-navy-100 bg-white p-8 text-center shadow-card">
          <p className="text-fluid-3xl font-bold text-teal-600">404</p>
          <h1 className="mt-2 text-fluid-2xl font-bold text-navy-950">Page not found</h1>
          <p className="mt-3 text-fluid-sm text-ink-soft">
            The page you are looking for doesn&apos;t exist or has moved.
          </p>
          <Link href="/" className="btn-primary mt-6">
            Back to the main page
          </Link>
        </div>
      </div>
    </main>
  );
}
