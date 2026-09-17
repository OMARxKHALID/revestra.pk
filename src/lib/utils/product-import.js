import { CONDITIONS, SIZE_SYSTEMS, AVAILABILITY } from "@/lib/schemas/product";

export const IMPORT_COLUMNS = [
  "name",
  "tagline",
  "brand",
  "category",
  "sizesystem",
  "sizelabel",
  "condition",
  "price",
  "saleprice",
  "cost",
  "measurements",
  "description",
  "details",
  "image",
  "images",
  "sku",
  "slug",
  "lot",
  "conditionnotes",
  "status",
];

export const IMPORT_TEMPLATE_HEADERS = [
  "name",
  "tagline",
  "brand",
  "category",
  "sizeSystem",
  "sizeLabel",
  "condition",
  "price",
  "salePrice",
  "cost",
  "measurements",
  "description",
  "details",
  "image",
  "images",
  "sku",
  "slug",
  "lot",
  "conditionNotes",
  "status",
];

const list = (value) =>
  String(value ?? "")
    .split("|")
    .map((entry) => entry.trim())
    .filter(Boolean);

const pairs = (value) =>
  Object.fromEntries(
    list(value).flatMap((entry) => {
      const at = entry.indexOf("=");

      return at === -1
        ? []
        : [[entry.slice(0, at).trim(), entry.slice(at + 1).trim()]];
    })
  );

const cents = (value) => {
  const text = String(value ?? "").replace(/[,\s]/g, "");

  if (text === "") return null;

  const amount = Number(text);

  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : NaN;
};

const oneOf = (options, value) =>
  options.find(
    (option) => option.toLowerCase() === String(value ?? "").trim().toLowerCase()
  ) ?? null;

export const buildImportRow = (row) => {
  const price = cents(row.price);
  const salePrice = cents(row.saleprice);
  const cost = cents(row.cost);

  if (price === null || Number.isNaN(price))
    return { ok: false, error: "price must be a number in rupees" };

  if (Number.isNaN(salePrice))
    return { ok: false, error: "salePrice must be a number in rupees" };

  if (cost === null || Number.isNaN(cost))
    return { ok: false, error: "cost must be a number in rupees" };

  const sizeSystem = oneOf(SIZE_SYSTEMS, row.sizesystem);

  if (!sizeSystem)
    return { ok: false, error: `sizeSystem must be one of ${SIZE_SYSTEMS.join(", ")}` };

  const condition = oneOf(CONDITIONS, row.condition);

  if (!condition)
    return { ok: false, error: `condition must be one of ${CONDITIONS.join(", ")}` };

  const status = row.status ? oneOf(AVAILABILITY, row.status) : "available";

  if (!status)
    return { ok: false, error: `status must be one of ${AVAILABILITY.join(", ")}` };

  return {
    ok: true,
    value: {
      sku: String(row.sku ?? "").trim(),
      slug: String(row.slug ?? "").trim(),
      name: String(row.name ?? "").trim(),
      tagline: String(row.tagline ?? "").trim(),
      brand: String(row.brand ?? "").trim(),
      category: String(row.category ?? "").trim(),
      sizeSystem,
      sizeLabel: String(row.sizelabel ?? "").trim(),
      measurements: pairs(row.measurements),
      condition,
      conditionNotes: String(row.conditionnotes ?? "").trim() || null,
      priceCents: price,
      salePriceCents: salePrice,
      costCents: cost,
      lot: String(row.lot ?? "").trim() || null,
      image: String(row.image ?? "").trim(),
      images: list(row.images),
      description: String(row.description ?? "").trim(),
      details: list(row.details),
      status,
    },
  };
};
