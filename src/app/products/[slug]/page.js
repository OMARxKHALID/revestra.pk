import { Suspense } from "react";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/site-header";
import Footer from "@/components/footer";
import AddToCart from "@/components/add-to-cart";
import AnalyticsProductView from "@/components/analytics-product-view";
import JsonLd from "@/components/json-ld";
import RelatedProducts from "@/components/related-products";
import {
  getAllProducts,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/api/products";
import { formatPrice } from "@/lib/utils/price";
import cn from "@/lib/utils/cn";
import { DISPLAY, EYEBROW, ITEM, META, NOTICE, SPEC } from "@/lib/type";
import { title } from "@/lib/brand";
import ProductGallery from "@/components/product-gallery";
import { availabilityLabel, gallery, isSold } from "@/lib/utils/stock";
import { productJsonLd } from "@/lib/structured-data";
import SaveButton from "@/components/save-button";
import MeasurementsTable from "@/components/measurements-table";
import ConditionBadge from "@/components/condition-badge";
import ShopRating from "@/components/shop-rating";

export const revalidate = 60;

export const generateStaticParams = async () => {
  try {
    const products = await getAllProducts();

    return products.map(({ slug }) => ({ slug }));
  } catch (error) {
    console.warn(
      `[build] the catalogue was unreachable, product pages will render on demand: ${error.message}`
    );

    return [];
  }
};

export const generateMetadata = async ({ params }) => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const sold = isSold(product);

  return {
    title: sold ? title(`${product.name} — sold`) : title(product.name),
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    robots: sold ? { index: false, follow: true } : undefined,
    openGraph: {
      title: title(product.name),
      description: product.description,
      type: "website",
      images: gallery(product).map((url) => ({
        url: new URL(url, process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").toString(),
      })),
    },
  };
};

const Related = async ({ product }) => {
  const related = await getRelatedProducts(product);

  if (related.length === 0) return null;

  return <RelatedProducts products={related} />;
};

const ProductPage = async ({ params }) => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const {
    tagline,
    name,
    brand,
    sizeLabel,
    condition,
    conditionNotes,
    priceCents,
    salePriceCents,
    description,
    details,
  } = product;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const frames = gallery(product);
  const sold = isSold(product);
  const label = sold || product.status === "reserved" ? availabilityLabel(product) : null;

  return (
    <main id="main" className="bg-white">
      <JsonLd
        data={productJsonLd(product, { base, images: frames, reviews: null })}
      />

      <SiteHeader />

      <article className="grid grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col justify-center bg-white px-6 py-10 sm:px-10 lg:min-h-[calc(100svh-var(--spacing-header))]">
          <ProductGallery frames={frames} name={name} sold={sold} label={label} />
        </div>

        <div className="flex flex-col items-center justify-center px-6 py-16 sm:px-10 sm:py-20 lg:sticky lg:top-header lg:h-[calc(100svh-var(--spacing-header))] lg:justify-start lg:overflow-y-auto lg:py-10">
          <div className="w-full max-w-[420px] text-center lg:my-auto">
            <p className={cn(EYEBROW, "text-blurple")}>
              {tagline}
            </p>

            <h1 className={cn(DISPLAY, "mt-4 text-ink")}>{name}</h1>

            <p className={cn(META, "mt-3 text-ink-soft")}>
              {brand} · {sizeLabel}
            </p>

            <div className="mt-4 flex justify-center">
              <ConditionBadge condition={condition} />
            </div>

            <div className="mt-4 flex justify-center">
              <Suspense fallback={null}>
                <ShopRating />
              </Suspense>
            </div>

            <p className={cn(ITEM, "mt-4 flex items-center justify-center gap-3")}>
              {salePriceCents === null ? (
                <span className="text-ink-muted">{formatPrice(priceCents)}</span>
              ) : (
                <>
                  <span className="text-sale line-through decoration-1">
                    {formatPrice(priceCents)}
                  </span>
                  <span className="text-ink-muted">
                    {formatPrice(salePriceCents)}
                  </span>
                </>
              )}
            </p>

            <p className={cn(ITEM, "mx-auto mt-6 font-light leading-[1.5] text-ink")}>
              {description}
            </p>

            {conditionNotes && (
              <p className={cn(NOTICE, "mx-auto mt-4 max-w-[38ch] text-ink-muted")}>
                {conditionNotes}
              </p>
            )}

            <AnalyticsProductView product={product} />

            <AddToCart product={product} />

            <div className="mt-5 flex justify-center">
              <SaveButton slug={product.slug} />
            </div>

            <MeasurementsTable product={product} />

            <hr className="mx-auto mt-10 w-full border-0 border-t border-rule-strong" />

            <ul className="mt-8 space-y-1">
              {details.map((line) => (
                <li
                  key={line}
                  className={cn(SPEC, "text-ink-muted")}
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>

      <Suspense fallback={null}>
        <Related product={product} />
      </Suspense>

      <Footer />
    </main>
  );
};

export default ProductPage;
