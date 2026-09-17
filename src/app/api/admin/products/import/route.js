import { z } from "zod";
import { guard, readJson, invalid } from "@/lib/api/admin/guard";
import { createProduct, derive } from "@/lib/api/admin/products";
import { categoryNames } from "@/lib/api/categories";
import { adminProductSchema } from "@/lib/schemas/admin";
import { parseCsv, toCsv, csvResponse } from "@/lib/utils/csv";
import {
  IMPORT_TEMPLATE_HEADERS,
  buildImportRow,
} from "@/lib/utils/product-import";

export const dynamic = "force-dynamic";

const MAX_ROWS = 200;
const PLACEHOLDER_SKU = "RV-PENDING";

const importSchema = z.object({
  csv: z.string().min(1, "Paste or choose a CSV file").max(1_000_000),
  dryRun: z.boolean().default(true),
});

const EXAMPLE = {
  name: "Levi's 501 Straight",
  tagline: "Honest fade, no stretch",
  brand: "Levi's",
  category: "Jeans",
  sizeSystem: "waist",
  sizeLabel: "W32 L30",
  condition: "Good",
  price: "4800",
  salePrice: "4200",
  cost: "900",
  measurements: 'Waist=32"|Inseam=30"|Rise=11"|Leg opening=7"',
  description: "Original-fit 501s in a mid indigo, washed and pressed.",
  details: "100% cotton denim|Button fly",
  image: "/assets/WEBP/64b05489489808ce3e8545b3_T_Shirt_Hero.webp",
  images: "",
  sku: "",
  slug: "",
  lot: "BALE-04",
  conditionNotes: "Even fade through the thigh.",
  status: "available",
};

export const GET = async (request) => {
  const { response } = await guard(request);

  if (response) return response;

  const columns = IMPORT_TEMPLATE_HEADERS.map((header) => ({
    header,
    value: (row) => row[header] ?? "",
  }));

  return csvResponse("revestra-import-template.csv", toCsv(columns, [EXAMPLE]));
};

export const POST = async (request) => {
  const { response } = await guard(request, { mutation: true });

  if (response) return response;

  const body = await readJson(request);

  if (!body.ok) return body.response;

  const parsed = importSchema.safeParse(body.payload);

  if (!parsed.success) return invalid(parsed.error);

  const { rows } = parseCsv(parsed.data.csv);

  if (rows.length === 0)
    return Response.json(
      { error: "That file has a header but no rows" },
      { status: 422 }
    );

  if (rows.length > MAX_ROWS)
    return Response.json(
      { error: `Import up to ${MAX_ROWS} rows at a time` },
      { status: 422 }
    );

  const known = await categoryNames();
  const problems = [];
  const ready = [];

  for (const [index, row] of rows.entries()) {
    const line = index + 2;
    const built = buildImportRow(row);

    if (!built.ok) {
      problems.push({ line, name: row.name ?? "", error: built.error });
      continue;
    }

    const generatedSku = built.value.sku === "";
    const candidate = await derive({
      ...built.value,
      sku: built.value.sku || PLACEHOLDER_SKU,
    });
    const checked = adminProductSchema.safeParse(candidate);

    if (!checked.success) {
      problems.push({
        line,
        name: candidate.name,
        error: checked.error.issues
          .map(({ path, message }) => `${path.join(".") || "row"}: ${message}`)
          .join("; "),
      });
      continue;
    }

    if (!known.includes(checked.data.category)) {
      problems.push({
        line,
        name: candidate.name,
        error: `"${checked.data.category}" is not a category. Add it first.`,
      });
      continue;
    }

    ready.push({ line, product: checked.data, generatedSku });
  }

  if (parsed.data.dryRun)
    return Response.json({
      checked: rows.length,
      ready: ready.map(({ line, product, generatedSku }) => ({
        line,
        name: product.name,
        sku: generatedSku ? "given on import" : product.sku,
        slug: product.slug,
      })),
      problems,
    });

  const created = [];

  for (const { line, product, generatedSku } of ready) {
    try {
      const result = await createProduct(
        await derive({ ...product, sku: generatedSku ? "" : product.sku })
      );

      if (result.ok) created.push({ line, slug: result.product.slug });
      else problems.push({ line, name: product.name, error: result.error });
    } catch (error) {
      console.error(`[import] row ${line} failed: ${error.message}`);
      problems.push({ line, name: product.name, error: "Could not be saved" });
    }
  }

  return Response.json({ checked: rows.length, created, problems });
};
