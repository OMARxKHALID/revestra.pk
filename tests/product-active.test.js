import { describe, expect, test } from "bun:test";
import { productSchema } from "@/lib/schemas/product";

const piece = {
  slug: "levis-501-w32",
  sku: "GS-1",
  name: "Levi's 501",
  tagline: "t",
  brand: "Levi's",
  category: "Jeans",
  sizeSystem: "waist",
  sizeLabel: "W32",
  measurements: { Waist: '32"', Inseam: '30"', Rise: '10"', "Leg opening": '7"' },
  condition: "Good",
  priceCents: 1000,
  image: "/assets/a.webp",
  description: "d",
  details: ["x"],
};

describe("product visibility", () => {
  test("a piece with no active field stays live, so old rows keep showing", () => {
    expect(productSchema.parse(piece).active).toBe(true);
  });

  test("an admin can switch a piece off", () => {
    expect(productSchema.parse({ ...piece, active: false }).active).toBe(false);
  });
});
