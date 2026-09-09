export const isAvailable = (product) => product.status === "available";

export const isReserved = (product) => product.status === "reserved";

export const isSold = (product) => product.status === "sold";

export const holdExpired = (product, now = Date.now()) =>
  Boolean(
    product.reservedUntil && new Date(product.reservedUntil).getTime() <= now
  );

export const sellableNow = (product, now = Date.now()) =>
  isAvailable(product) || (isReserved(product) && holdExpired(product, now));

export const availabilityLabel = (product) => {
  if (isSold(product)) return "Sold";
  if (isReserved(product)) return "In someone's cart";

  return "Available";
};

export const gallery = (product) => [
  product.image,
  ...(product.images ?? []).filter((image) => image !== product.image),
];

export const measurementList = (product) =>
  Object.entries(product.measurements ?? {}).map(([label, value]) => ({
    label,
    value,
  }));
