import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { ACCESS_COOKIE } from "@/lib/server-config";
import { verifyAccessToken } from "@/lib/access-token";
import { siteConfig, isPlaceholder } from "@/lib/site-config";
import SuccessClient from "@/components/SuccessClient";
import UnverifiedNotice from "@/components/UnverifiedNotice";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Payment successful — ${siteConfig.PRODUCT_NAME}`,
  robots: { index: false, follow: false },
};

/**
 * Thank-you / access page (brief §35).
 *
 * This is a SERVER component, and it re-verifies the signed access token before
 * rendering anything. A visitor who simply types /success into the address bar
 * sees the "we couldn't confirm a purchase" state, not the bundle.
 *
 * The Purchase pixel fires from <SuccessClient>, which only mounts on this
 * verified path (brief §46).
 */

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const payload = verifyAccessToken(cookieStore.get(ACCESS_COOKIE)?.value);

  const paymentIdParam = typeof params.payment_id === "string" ? params.payment_id : undefined;

  if (!payload) {
    return <UnverifiedNotice paymentId={paymentIdParam} />;
  }

  return (
    <main id="main" className="min-h-screen bg-sand">
      <div className="container-page py-10 sm:py-16">
        <div className="mx-auto max-w-3xl">
          {/* Confirmation header */}
          <div className="rounded-xl2 bg-navy-950 p-6 text-center text-white sm:p-10">
            <span
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-500"
              aria-hidden="true"
            >
              <svg className="h-9 w-9 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>

            <p className="mt-5 text-fluid-xs font-semibold uppercase tracking-[0.16em] text-teal-300">
              Payment successful
            </p>
            <h1 className="mt-2 text-fluid-3xl font-bold text-white">
              You're in.
              <br />
              <span className="text-amber-400">Your bundle is ready below.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-fluid-sm text-navy-200">
              Your payment has been confirmed successfully. You now have access to the complete
              {" "}{siteConfig.TOTAL_PRODUCTS}-resource interview preparation system.
            </p>

            <dl className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-x-6 gap-y-2 text-fluid-xs">
              <div className="flex gap-2">
                <dt className="text-navy-400">Order:</dt>
                <dd className="font-mono text-navy-100">{payload.orderId}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-navy-400">Payment:</dt>
                <dd className="font-mono text-navy-100">{payload.paymentId}</dd>
              </div>
            </dl>
            <p className="mt-3 text-fluid-xs text-navy-400">
              Keep these IDs. Quote them if you ever need support with your access.
            </p>
          </div>

          {/* Client island: access fetch, delivery steps, interview-timing router, Purchase pixel */}
          <SuccessClient
            orderId={payload.orderId}
            paymentId={payload.paymentId}
            delivered={payload.delivered}
            customerEmail={payload.email}
          />

          <p className="mt-10 text-center text-fluid-sm text-ink-soft">
            <Link href="/" className="font-semibold text-teal-700 underline">
              Return to {siteConfig.BRAND_NAME}
            </Link>
            {!isPlaceholder(siteConfig.SUPPORT_EMAIL) && (
              <>
                {" · "}
                <a
                  href={`mailto:${siteConfig.SUPPORT_EMAIL}?subject=${encodeURIComponent(
                    `Access help — order ${payload.orderId}`
                  )}`}
                  className="font-semibold text-teal-700 underline"
                >
                  Need help?
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </main>
  );
}
