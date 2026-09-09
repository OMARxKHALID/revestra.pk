import { describe, expect, test } from "bun:test";
import { PRODUCTS } from "../src/lib/products.js";
import { productsSchema, productSchema } from "../src/lib/schemas/product.js";

describe("catalogue", () => {
  test("every product satisfies the schema", () => {
    const result = productsSchema.safeParse(PRODUCTS);
    const messages = result.success
      ? []
      : result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    expect(messages).toEqual([]);
  });

  test("slugs are unique", () => {
    const slugs = PRODUCTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test("a sale price is never above the list price", () => {
    const wrong = PRODUCTS.filter(
      (p) => p.salePriceCents !== null && p.salePriceCents > p.priceCents
    );
    expect(wrong).toEqual([]);
  });

  test("rejects a non-integer price", () => {
    const [first] = PRODUCTS;
    const result = productSchema.safeParse({ ...first, priceCents: 19.99 });
    expect(result.success).toBe(false);
  });

  test("rejects a slug that is not kebab-case", () => {
    const [first] = PRODUCTS;
    expect(productSchema.safeParse({ ...first, slug: "Not Kebab" }).success).toBe(
      false
    );
  });
});
