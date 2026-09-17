import "./globals.css";
import SmoothScrollProvider from "@/components/smooth-scroll-provider";
import CartHydration from "@/components/cart-hydration";
import QueryProvider from "@/components/query-provider";
import AuthProvider from "@/components/session-provider";
import AnalyticsIdentity from "@/components/analytics-identity";
import ConsentBanner from "@/components/consent-banner";
import { fontVariables } from "@/lib/fonts";
import cn from "@/lib/utils/cn";
import { BRAND } from "@/lib/brand";

export const revalidate = 3600;

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description: BRAND.description,
  openGraph: {
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.description,
    type: "website",
  },
};

export const viewport = {
  themeColor: "#000000",
  colorScheme: "dark light",
};

const RootLayout = ({ children }) => (
  <html
    lang="en"
    className={cn(...fontVariables)}
    suppressHydrationWarning
  >
    <body className="antialiased">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:outline-2 focus:outline-offset-2 focus:outline-blurple"
      >
        Skip to content
      </a>

      <CartHydration />
      <AuthProvider>
        <AnalyticsIdentity />

        <QueryProvider>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </QueryProvider>
      </AuthProvider>

      <ConsentBanner />
    </body>
  </html>
);

export default RootLayout;
