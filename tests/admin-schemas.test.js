import { describe, expect, test } from "bun:test";
import {
  makeAdminProductFormSchema,
  adminProductPatchSchema,
  adminProductSchema,
  adminPromoSchema,
  listQuerySchema,
  orderStatusSchema,
} from "@/lib/schemas/admin";

const piece = {
  sku: "GS-0199",
  slug: "levis-505-w30-l30",
  name: "Levi's 505",
  tagline: "Straight, faded, honest",
  brand: "Levi's",
  category: "Jeans",
  sizeSystem: "waist",
  sizeLabel: "W30 L30",
  measurements: {
    Waist: '30"',
    Inseam: '30"',
    Rise: '10"',
    "Leg opening": '7"',
  },
  condition: "Good",
  conditionNotes: null,
  priceCents: 400000,
  salePriceCents: null,
  costCents: 90000,
  lot: "BALE-05",
  image: "/assets/WEBP/jeans.webp",
  images: [],
  description: "A pair of 505s",
  details: ["100% cotton"],
  status: "available",
};

describe("adminProductSchema", () => {
  test("accepts a complete piece with its private fields", () => {
    const parsed = adminProductSchema.parse(piece);

    expect(parsed.costCents).toBe(90000);
    expect(parsed.lot).toBe("BALE-05");
  });

  test("rejects a sale price above the list price", () => {
    const result = adminProductSchema.safeParse({
      ...piece,
      salePriceCents: 500000,
    });

    expect(result.success).toBe(false);
  });

  test("rejects a category whose measurements are missing", () => {
    const result = adminProductSchema.safeParse({
      ...piece,
      measurements: { Waist: '30"' },
    });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain("Jeans needs");
  });
});

describe("adminProductPatchSchema", () => {
  test("accepts a single field", () => {
    const parsed = adminProductPatchSchema.parse({ priceCents: 350000 });

    expect(parsed.priceCents).toBe(350000);
  });

  test("still catches a sale price above the list price", () => {
    const result = adminProductPatchSchema.safeParse({
      priceCents: 100000,
      salePriceCents: 200000,
    });

    expect(result.success).toBe(false);
  });
});

describe("orderStatusSchema", () => {
  test("refuses a status the panel must not set directly", () => {
    expect(orderStatusSchema.safeParse({ status: "pending_payment" }).success).toBe(
      false
    );
  });

  test("accepts a settled status", () => {
    expect(orderStatusSchema.parse({ status: "shipped" }).status).toBe("shipped");
  });
});

describe("adminPromoSchema", () => {
  test("upper-cases the code", () => {
    expect(adminPromoSchema.parse({ code: "spring5", kind: "percent", value: 5 }).code).toBe(
      "SPRING5"
    );
  });
});

describe("listQuerySchema", () => {
  test("defaults to the first page", () => {
    const parsed = listQuerySchema.parse({});

    expect(parsed.page).toBe(1);
    expect(parsed.perPage).toBe(10);
  });

  test("caps the page size", () => {
    expect(listQuerySchema.safeParse({ perPage: "5000" }).success).toBe(false);
  });
});

describe("adminProductFormSchema", () => {
  const adminProductFormSchema = makeAdminProductFormSchema();

  const filled = (overrides = {}) => ({
    sku: "GS-0099",
    slug: "levis-501-w32",
    name: "Levi's 501",
    tagline: "Honest fade",
    brand: "Levi's",
    category: "Jeans",
    condition: "Good",
    sizeSystem: "waist",
    sizeLabel: "W32 L30",
    status: "available",
    priceCents: "4200",
    salePriceCents: "",
    costCents: "1500",
    lot: "",
    image: "/assets/WEBP/levis.webp",
    images: "/assets/WEBP/a.webp\n\n/assets/WEBP/b.webp",
    description: "A good pair of jeans",
    conditionNotes: "",
    details: "Made in USA\n\nSelvedge",
    measurements: { Waist: '32"', Inseam: '30"', Rise: '11"', "Leg opening": '7"' },
    ...overrides,
  });

  test("rupees typed by the admin become cents", () => {
    const parsed = adminProductFormSchema.parse(filled());

    expect(parsed.priceCents).toBe(420000);
    expect(parsed.costCents).toBe(150000);
    expect(parsed.salePriceCents).toBeNull();
  });

  test("newline lists become arrays with blanks dropped", () => {
    const parsed = adminProductFormSchema.parse(filled());

    expect(parsed.images).toEqual(["/assets/WEBP/a.webp", "/assets/WEBP/b.webp"]);
    expect(parsed.details).toEqual(["Made in USA", "Selvedge"]);
  });

  test("empty optional text becomes null rather than an empty string", () => {
    const parsed = adminProductFormSchema.parse(filled());

    expect(parsed.lot).toBeNull();
    expect(parsed.conditionNotes).toBeNull();
  });

  test("a price that is not a number is rejected before the network", () => {
    const result = adminProductFormSchema.safeParse(
      filled({ priceCents: "abc" })
    );

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain("must be a number");
  });

  test("a sale price above the list price is rejected", () => {
    const result = adminProductFormSchema.safeParse(
      filled({ salePriceCents: "9999" })
    );

    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toEqual(["salePriceCents"]);
  });

  test("a missing measurement for the category is rejected", () => {
    const result = adminProductFormSchema.safeParse(
      filled({ measurements: { Waist: '32"' } })
    );

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain("Inseam");
  });

  test("a slug that is not kebab-case is rejected", () => {
    const result = adminProductFormSchema.safeParse(
      filled({ slug: "Levis 501" })
    );

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain("kebab-case");
  });

  test("an image outside /assets/ is rejected", () => {
    const result = adminProductFormSchema.safeParse(
      filled({ image: "https://evil.example/x.png" })
    );

    expect(result.success).toBe(false);
  });
});
