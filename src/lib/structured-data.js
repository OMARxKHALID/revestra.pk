import { CURRENCY } from "@/lib/utils/price";
import { majorUnits } from "@/lib/analytics";
import { isSold, isReserved } from "@/lib/utils/stock";

const absolute = (path, base) => new URL(path, base).toString();

const availabilityOf = (product) => {
  if (isSold(product)) return "https://schema.org/SoldOut";
  if (isReserved(product)) return "https://schema.org/LimitedAvailability";

  return "https://schema.org/InStock";
};

export const productJsonLd = (product, { base, images, reviews }) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.name,
  description: product.description,
  sku: product.sku,
  image: images.map((url) => absolute(url, base)),
  brand: { "@type": "Brand", name: product.brand },
  category: product.category,
  itemCondition: "https://schema.org/UsedCondition",
  offers: {
    "@type": "Offer",
    url: absolute(`/products/${product.slug}`, base),
    price: majorUnits(product.salePriceCents ?? product.priceCents),
    priceCurrency: CURRENCY,
    availability: availabilityOf(product),
    itemCondition: "https://schema.org/UsedCondition",
  },
  ...(reviews?.count
    ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: reviews.average,
          reviewCount: reviews.count,
        },
      }
    : {}),
});

export const storeJsonLd = (settings, base) => ({
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  name: settings.name,
  legalName: settings.legalName,
  description: settings.description,
  url: base,
  email: settings.email,
  ...(settings.phone ? { telephone: settings.phone } : {}),
  address: {
    "@type": "PostalAddress",
    ...(settings.addressLine ? { streetAddress: settings.addressLine } : {}),
    addressLocality: settings.city,
    addressCountry: "PK",
  },
  sameAs: settings.socials.map(({ href }) => href),
});
