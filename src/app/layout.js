import "./globals.css";
import SmoothScrollProvider from "@/components/smooth-scroll-provider";
import CartHydration from "@/components/cart-hydration";
import QueryProvider from "@/components/query-provider";
import AuthProvider from "@/components/session-provider";
import { inter, ptSerif } from "@/lib/fonts";
import cn from "@/lib/utils/cn";
import { BRAND } from "@/lib/brand";

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
    className={cn(inter.variable, ptSerif.variable)}
  >
    <body className="bg-white text-black antialiased">
      <CartHydration />
      <AuthProvider>
        <QueryProvider>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </QueryProvider>
      </AuthProvider>
    </body>
  </html>
);

export default RootLayout;
