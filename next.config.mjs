const GATEWAY_FORM_TARGETS = [
  "https://payments.jazzcash.com.pk",
  "https://sandbox.jazzcash.com.pk",
  "https://easypay.easypaisa.com.pk",
  "https://easypaystg.easypaisa.com.pk",
];

const isDev = process.env.NODE_ENV !== "production";

const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  `connect-src 'self' https://api.cloudinary.com${isDev ? " ws: http://localhost:*" : ""}`,
  `form-action 'self' ${GATEWAY_FORM_TARGETS.join(" ")}`,
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const NO_STORE = [
  { key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" },
];

/** @type {import('next').NextConfig} */
const POSTHOG_INGEST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://eu.i.posthog.com";
const POSTHOG_ASSETS = POSTHOG_INGEST.replace(".i.posthog.com", "-assets.i.posthog.com");

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  skipTrailingSlashRedirect: true,
  rewrites: async () => [
    { source: "/ph/static/:path*", destination: `${POSTHOG_ASSETS}/static/:path*` },
    { source: "/ph/array/:path*", destination: `${POSTHOG_ASSETS}/array/:path*` },
    { source: "/ph/:path*", destination: `${POSTHOG_INGEST}/:path*` },
  ],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
  headers: async () => [
    { source: "/:path*", headers: SECURITY_HEADERS },
    { source: "/api/:path*", headers: NO_STORE },
    { source: "/ph/:path*", headers: NO_STORE },
    { source: "/orders/:path*", headers: NO_STORE },
    { source: "/account/:path*", headers: NO_STORE },
    { source: "/checkout/:path*", headers: NO_STORE },
    { source: "/admin/:path*", headers: NO_STORE },
  ],
};

export default nextConfig;
