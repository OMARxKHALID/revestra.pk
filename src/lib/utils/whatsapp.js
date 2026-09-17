import { formatPrice } from "@/lib/utils/price";

export const whatsappNumber = (phone) => {
  const digits = String(phone ?? "").replace(/\D/g, "").replace(/^00/, "");
  const international = digits.startsWith("0") ? `92${digits.slice(1)}` : digits;

  return international.length >= 11 ? international : null;
};

export const whatsappLink = (number, product, url) => {
  const message = [
    "Hi! I'd like to buy this piece:",
    `${product.name} — ${product.brand}, ${product.sizeLabel}, ${product.condition}`,
    `Price: ${formatPrice(product.salePriceCents ?? product.priceCents)}`,
    `SKU: ${product.sku}`,
    url,
  ].join("\n");

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};
