const SECURITY_HEADERS = [
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
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  headers: async () => [
    { source: "/:path*", headers: SECURITY_HEADERS },
    { source: "/api/:path*", headers: NO_STORE },
    { source: "/orders/:path*", headers: NO_STORE },
    { source: "/account/:path*", headers: NO_STORE },
    { source: "/checkout/:path*", headers: NO_STORE },
    { source: "/admin/:path*", headers: NO_STORE },
  ],
};

export default nextConfig;
