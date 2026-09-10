import { Suspense } from "react";
import Hero from "@/components/hero";
import ProductGrid from "@/components/product-grid";
import ReviewHighlights from "@/components/review-highlights";
import Footer from "@/components/footer";

const Home = () => (
  <main id="main">
    <Hero />
    <ProductGrid />

    <Suspense fallback={null}>
      <ReviewHighlights />
    </Suspense>

    <Footer />
  </main>
);

export default Home;
