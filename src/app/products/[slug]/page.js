import { notFound } from "next/navigation";
import SiteHeader from "@/components/site-header";
import Footer from "@/components/footer";
import AddToCart from "@/components/add-to-cart";
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
import SaveButton from "@/components/save-button";
import MeasurementsTable from "@/components/measurements-table";
import ConditionBadge from "@/components/ui/condition-badge";

export const revalidate = 60;

export const generateStaticParams = async () => {
  const products = await getAllProducts();
  return products.map(({ slug }) => ({ slug }));
};

export const generateMetadata = async ({ params }) => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: title(product.name),
    description: product.description,
    openGraph: {
      title: title(product.name),
      description: product.description,
      images: gallery(product).map((url) => ({ url })),
    },
  };
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
  const related = await getRelatedProducts(product);
  const frames = gallery(product);
  const sold = isSold(product);
  const label = sold || product.status === "reserved" ? availabilityLabel(product) : null;

  return (
    <main className="bg-white">
      <SiteHeader />

      <article className="grid grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col justify-center bg-white px-6 py-10 sm:px-10 lg:min-h-[calc(100svh-var(--spacing-header))]">
          <ProductGallery frames={frames} name={name} sold={sold} label={label} />
        </div>

        <div className="flex items-center justify-center px-6 py-16 sm:px-10 sm:py-20 lg:sticky lg:top-[var(--spacing-header)] lg:h-[calc(100svh-var(--spacing-header))] lg:py-0">
          <div className="w-full max-w-[420px] text-center">
            <p className={cn(EYEBROW, "text-blurple")}>
              {tagline}
            </p>

            <h1 className={cn(DISPLAY, "mt-4 text-black")}>{name}</h1>

            <p className={cn(META, "mt-3 text-black/45")}>
              {brand} · {sizeLabel}
            </p>

            <div className="mt-4 flex justify-center">
              <ConditionBadge condition={condition} />
            </div>

            <p className={cn(ITEM, "mt-4 flex items-center justify-center gap-3")}>
              {salePriceCents === null ? (
                <span className="text-black/70">{formatPrice(priceCents)}</span>
              ) : (
                <>
                  <span className="text-sale line-through decoration-1">
                    {formatPrice(priceCents)}
                  </span>
                  <span className="text-black/70">
                    {formatPrice(salePriceCents)}
                  </span>
                </>
              )}
            </p>

            <p className={cn(ITEM, "mx-auto mt-6 font-light leading-[1.5] text-black")}>
              {description}
            </p>

            {conditionNotes && (
              <p className={cn(NOTICE, "mx-auto mt-4 max-w-[38ch] text-black/70")}>
                {conditionNotes}
              </p>
            )}

            <AddToCart product={product} />

            <div className="mt-5 flex justify-center">
              <SaveButton slug={product.slug} />
            </div>

            <MeasurementsTable product={product} />

            <hr className="mx-auto mt-10 w-full border-0 border-t border-black/20" />

            <ul className="mt-8 space-y-1">
              {details.map((line) => (
                <li
                  key={line}
                  className={cn(SPEC, "text-black/70")}
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>

      {related.length > 0 && <RelatedProducts products={related} />}

      <Footer />
    </main>
  );
};

export default ProductPage;
