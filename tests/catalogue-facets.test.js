import { describe, expect, test } from "bun:test";
import {
  EMPTY_FILTERS,
  buildFacets,
  matchesFilters,
  readFilters,
} from "../src/lib/utils/catalogue.js";

const piece = (overrides) => ({
  name: "A piece",
  brand: "Unbranded",
  tagline: "Something",
  description: "Words",
  category: "Jeans",
  sizeLabel: "W32 L30",
  condition: "Good",
  ...overrides,
});

const catalogue = [
  piece({ name: "Levi's 501", brand: "Levi's", category: "Jeans", sizeLabel: "W32 L30" }),
  piece({ name: "Wrangler", brand: "Wrangler", category: "Jeans", sizeLabel: "W34 L32" }),
  piece({
    name: "Champion Hoodie",
    brand: "Champion",
    category: "Jackets",
    sizeLabel: "XL",
    condition: "Excellent",
  }),
  piece({
    name: "Canvas Low Tops",
    brand: "Unbranded",
    category: "Shoes",
    sizeLabel: "UK 8 / EU 42",
    condition: "Fair",
  }),
];

const withCategory = (category) => ({ ...EMPTY_FILTERS, category });

describe("readFilters", () => {
  test("reads every facet off the query string", () => {
    const filters = readFilters(
      new URLSearchParams("q=Levi&category=Jeans&size=W32+L30&brand=Levi's&condition=Good")
    );

    expect(filters).toEqual({
      query: "levi",
      category: "Jeans",
      size: "W32 L30",
      brand: "Levi's",
      condition: "Good",
    });
  });
});

describe("matchesFilters", () => {
  test("narrows on every facet at once", () => {
    expect(
      matchesFilters(catalogue[0], { ...EMPTY_FILTERS, category: "Jeans", brand: "Levi's" })
    ).toBe(true);

    expect(
      matchesFilters(catalogue[0], { ...EMPTY_FILTERS, category: "Jeans", brand: "Wrangler" })
    ).toBe(false);
  });

  test("search looks across brand and size, not just the name", () => {
    expect(matchesFilters(catalogue[3], { ...EMPTY_FILTERS, query: "uk 8" })).toBe(
      true
    );
  });

  test("skip ignores one facet, which is how each row is built", () => {
    const filters = { ...EMPTY_FILTERS, category: "Shoes" };

    expect(matchesFilters(catalogue[0], filters)).toBe(false);
    expect(matchesFilters(catalogue[0], filters, { skip: "category" })).toBe(true);
  });
});

describe("buildFacets", () => {
  test("with nothing selected, every option is offered", () => {
    const facets = buildFacets(catalogue, EMPTY_FILTERS);

    expect(facets.categories).toEqual(["Jackets", "Jeans", "Shoes"]);
    expect(facets.brands).toHaveLength(4);
  });

  test("choosing a category hides sizes that category cannot have", () => {
    const facets = buildFacets(catalogue, withCategory("Jeans"));

    expect(facets.sizes).toEqual(["W32 L30", "W34 L32"]);
    expect(facets.sizes).not.toContain("UK 8 / EU 42");
  });

  test("choosing a category hides brands that category cannot have", () => {
    const facets = buildFacets(catalogue, withCategory("Jeans"));

    expect(facets.brands).toEqual(["Levi's", "Wrangler"]);
    expect(facets.brands).not.toContain("Champion");
  });

  test("the category row still offers every category, so you can switch", () => {
    const facets = buildFacets(catalogue, withCategory("Jeans"));

    expect(facets.categories).toEqual(["Jackets", "Jeans", "Shoes"]);
  });

  test("a selected option is never dropped from its own row", () => {
    const filters = { ...EMPTY_FILTERS, category: "Jeans", brand: "Champion" };
    const facets = buildFacets(catalogue, filters);

    expect(facets.brands).toContain("Champion");
  });

  test("no reachable combination of offered facets returns nothing", () => {
    for (const category of buildFacets(catalogue, EMPTY_FILTERS).categories) {
      const filters = withCategory(category);

      for (const size of buildFacets(catalogue, filters).sizes) {
        const narrowed = { ...filters, size };
        const results = catalogue.filter((product) =>
          matchesFilters(product, narrowed)
        );

        expect(results.length).toBeGreaterThan(0);
      }
    }
  });
});
