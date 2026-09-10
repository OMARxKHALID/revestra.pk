const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const robots = () => ({
  rules: [
    {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/cart",
        "/checkout",
        "/orders/",
        "/track",
        "/account/",
        "/admin",
        "/design/",
        "/sign-in",
        "/sign-up",
        "/forgot-password",
        "/wishlist",
      ],
    },
  ],
  sitemap: `${BASE_URL}/sitemap.xml`,
});

export default robots;
