/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Brief §48: serve modern formats and correctly-sized variants to mobile Meta traffic.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [96, 128, 192, 256, 384],
  },
  async redirects() {
    return [
      // The /success route was renamed to /thank-you. Kept permanently so any
      // in-flight checkout, bookmark or old link still lands correctly.
      { source: "/success", destination: "/thank-you", permanent: true },
      // www -> apex (§34). The apex domain is canonical.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.interviewmastery.shop" }],
        destination: "https://interviewmastery.shop/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // HSTS. Only sent in production; harmless locally where HTTPS is absent.
          ...(process.env.NODE_ENV === "production"
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
      {
        // The access + success routes must never be cached by a CDN or shared proxy:
        // they are rendered per verified order.
        source: "/(thank-you|access)",
        headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

export default nextConfig;
