import { Suspense } from "react";
import Hero from "@/components/hero";
import AnnouncementBar from "@/components/announcement-bar";
import ProductGrid from "@/components/product-grid";
import ReviewHighlights from "@/components/review-highlights";
import Footer from "@/components/footer";
import JsonLd from "@/components/json-ld";
import { getSettings } from "@/lib/api/settings";
import { storeJsonLd } from "@/lib/structured-data";

const StoreJsonLd = async () => {
  const settings = await getSettings();
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return <JsonLd data={storeJsonLd(settings, base)} />;
};

const Home = () => (
  <main id="main">
    <Suspense fallback={null}>
      <StoreJsonLd />
    </Suspense>

    <Suspense fallback={null}>
      <AnnouncementBar />
    </Suspense>

    <Hero />
    <ProductGrid />

    <Suspense fallback={null}>
      <ReviewHighlights />
    </Suspense>

    <Footer />
  </main>
);

export default Home;
