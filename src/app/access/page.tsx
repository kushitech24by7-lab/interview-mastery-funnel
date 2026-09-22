import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { ACCESS_COOKIE } from "@/lib/server-config";
import { verifyAccessToken } from "@/lib/access-token";
import { siteConfig } from "@/lib/site-config";
import { products } from "@/lib/products";
import SuccessClient from "@/components/SuccessClient";
import UnverifiedNotice from "@/components/UnverifiedNotice";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Your library — ${siteConfig.PRODUCT_NAME}`,
  robots: { index: false, follow: false },
};

/**
 * The returning-buyer access page (brief §59 item 16).
 *
 * /success is the moment of purchase; /access is where a buyer comes BACK to
 * later, from a bookmark or an email. Same verification, but the framing is
 * "your library" rather than "payment successful", and it lists the full
 * contents so they can see what they own.
 */

export default async function AccessPage() {
  const cookieStore = await cookies();
  const payload = verifyAccessToken(cookieStore.get(ACCESS_COOKIE)?.value);

  if (!payload) {
    return <UnverifiedNotice />;
  }

  return (
    <main id="main" className="min-h-screen bg-sand">
      <div className="container-page py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl2 bg-navy-950 p-6 text-white sm:p-8">
            <p className="text-fluid-xs font-semibold uppercase tracking-[0.16em] text-teal-300">
              {siteConfig.BRAND_NAME}
            </p>
            <h1 className="mt-2 text-fluid-2xl font-bold text-white">Your interview library</h1>
            <p className="mt-2 text-fluid-sm text-navy-200">
              {siteConfig.TOTAL_PRODUCTS} resources · {siteConfig.TOTAL_PAGES} pages · yours to keep
            </p>
          </div>

          <SuccessClient orderId={payload.orderId} paymentId={payload.paymentId} />

          {/* What's in the folder */}
          <div className="card mt-6 p-6 sm:p-8">
            <h2 className="text-fluid-xl font-bold text-navy-950">What's in your folder</h2>
            <ol className="mt-5 divide-y divide-navy-100">
              {products.map((product) => (
                <li key={product.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3">
                  <span className="rounded bg-navy-950 px-1.5 py-0.5 text-[0.65rem] font-bold text-white">
                    {product.code}
                  </span>
                  <span className="flex-1 text-fluid-sm font-medium text-navy-950">
                    {product.title}
                  </span>
                  <span className="text-fluid-xs text-ink-faint">{product.pages} pages</span>
                </li>
              ))}
            </ol>
          </div>

          <p className="mt-8 text-center text-fluid-sm text-ink-soft">
            <Link href="/" className="font-semibold text-teal-700 underline">
              Back to {siteConfig.BRAND_NAME}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
