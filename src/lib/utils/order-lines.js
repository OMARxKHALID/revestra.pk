import { sellableNow } from "@/lib/utils/stock";

export const priceOrderLines = (catalogue, lines, now = Date.now()) => {
  const seen = new Set();
  const priced = [];

  for (const line of lines) {
    if (seen.has(line.slug)) continue;

    seen.add(line.slug);

    const product = catalogue.find((item) => item.slug === line.slug);

    if (!product)
      return { ok: false, error: "One of those pieces is no longer listed" };

    if (product.status === "sold")
      return { ok: false, error: `${product.name} has already sold` };

    if (!sellableNow(product, now))
      return {
        ok: false,
        error: `${product.name} is in someone else's cart right now`,
      };

    priced.push({
      slug: product.slug,
      sku: product.sku,
      name: product.name,
      image: product.image,
      size: product.sizeLabel,
      condition: product.condition,
      quantity: 1,
      unitCents: product.salePriceCents ?? product.priceCents,
    });
  }

  if (priced.length === 0) return { ok: false, error: "Your cart is empty" };

  return { ok: true, lines: priced };
};

export const subtotalOf = (lines) =>
  lines.reduce((total, line) => total + line.unitCents, 0);
