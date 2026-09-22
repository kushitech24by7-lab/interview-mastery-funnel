import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "@/styles/globals.css";
import { siteConfig, isPlaceholder } from "@/lib/site-config";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const siteUrl = siteConfig.SITE_URL;

const title = `${siteConfig.PRODUCT_NAME} | Interview Preparation System | ${siteConfig.BRAND_NAME}`;
const description = `${siteConfig.PRODUCT_NAME} by ${siteConfig.BRAND_NAME} is a ${siteConfig.TOTAL_PRODUCTS}-resource digital interview preparation system with ${siteConfig.TOTAL_PAGES} pages, ${siteConfig.TOTAL_QUESTIONS} interview questions, ${siteConfig.TOTAL_STAR_EXAMPLES} STAR examples, mock interview practice, worksheets, research tools, interview-day preparation and salary negotiation guidance.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: [
    "interview preparation",
    "interview questions and answers",
    "STAR method examples",
    "tell me about yourself",
    "mock interview practice",
    "salary negotiation India",
    "campus placement preparation",
    "interview English communication",
  ],
  authors: [{ name: siteConfig.BRAND_NAME }],
  creator: siteConfig.BRAND_NAME,
  publisher: siteConfig.BRAND_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: siteConfig.BRAND_NAME,
    title,
    description,
    images: [
      {
        url: siteConfig.OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${siteConfig.PRODUCT_NAME} — ${siteConfig.TOTAL_PRODUCTS} interview preparation resources`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [siteConfig.OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b1424",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pixelEnabled = !isPlaceholder(siteConfig.META_PIXEL_ID);
  const ga4Enabled = !isPlaceholder(siteConfig.GA4_ID);

  return (
    <html lang="en-IN" className={inter.variable}>
      <head>
        {/* Razorpay's own domains — connect early so checkout opens fast on mobile data. */}
        <link rel="preconnect" href="https://checkout.razorpay.com" />
        <link rel="dns-prefetch" href="https://api.razorpay.com" />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100]
                     focus:rounded-lg focus:bg-navy-950 focus:px-4 focus:py-3 focus:text-white"
        >
          Skip to main content
        </a>

        {children}
        <Analytics />

        {/* Meta Pixel — base code only. Purchase fires from the verified success page. */}
        {pixelEnabled && (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${siteConfig.META_PIXEL_ID}');
fbq('track', 'PageView');`}
            </Script>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                alt=""
                src={`https://www.facebook.com/tr?id=${siteConfig.META_PIXEL_ID}&ev=PageView&noscript=1`}
              />
            </noscript>
          </>
        )}

        {ga4Enabled && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${siteConfig.GA4_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${siteConfig.GA4_ID}', { send_page_view: true });`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
