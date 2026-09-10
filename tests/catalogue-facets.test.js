import { describe, expect, test } from "bun:test";
import {
  EMPTY_FILTERS,
  buildFacets,
  filtersToParams,
  matchesFilters,
  readFilters,
  toSearchParams,
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
      minCents: null,
      maxCents: null,
      availableOnly: false,
    });
  });

  test("reads a price range in rupees and stores it in cents", () => {
    const filters = readFilters(new URLSearchParams("min=1500&max=4000"));

    expect(filters.minCents).toBe(150000);
    expect(filters.maxCents).toBe(400000);
  });

  test("ignores a price that is not a usable number", () => {
    const filters = readFilters(new URLSearchParams("min=abc&max=-5"));

    expect(filters.minCents).toBeNull();
    expect(filters.maxCents).toBeNull();
  });

  test("round-trips filters through the query string", () => {
    const params = new URLSearchParams("q=levi&category=Jeans&min=1500&available=1");

    expect(filtersToParams(readFilters(params)).toString()).toBe(
      new URLSearchParams({
        q: "levi",
        category: "Jeans",
        min: "1500",
        available: "1",
      }).toString()
    );
  });
});

describe("filtering", () => {
  const item = (overrides) => ({
    name: "Levi's 501",
    brand: "Levi's",
    tagline: "",
    description: "",
    category: "Jeans",
    sizeLabel: "W32 L30",
    condition: "Good",
    priceCents: 420000,
    salePriceCents: null,
    status: "available",
    ...overrides,
  });

  test("a price range excludes pieces outside it", () => {
    const filters = { ...EMPTY_FILTERS, minCents: 500000 };

    expect(matchesFilters(item(), filters)).toBe(false);
    expect(matchesFilters(item({ priceCents: 600000 }), filters)).toBe(true);
  });

  test("a sale price is what the range is measured against", () => {
    const filters = { ...EMPTY_FILTERS, maxCents: 200000 };

    expect(matchesFilters(item({ salePriceCents: 150000 }), filters)).toBe(true);
  });

  test("the available-only filter hides reserved and sold pieces", () => {
    const filters = { ...EMPTY_FILTERS, availableOnly: true };

    expect(matchesFilters(item({ status: "reserved" }), filters)).toBe(false);
    expect(matchesFilters(item({ status: "sold" }), filters)).toBe(false);
    expect(matchesFilters(item(), filters)).toBe(true);
  });
});

describe("size ordering", () => {
  test("alpha sizes sort small to large, not alphabetically", () => {
    const products = ["L", "S", "XL", "M"].map((sizeLabel) => ({
      category: "Shirts",
      brand: "x",
      condition: "Good",
      sizeLabel,
      name: "",
      tagline: "",
      description: "",
      priceCents: 1,
      salePriceCents: null,
      status: "available",
    }));

    expect(buildFacets(products).sizes).toEqual(["S", "M", "L", "XL"]);
  });

  test("numeric sizes sort by value, not by string", () => {
    const products = ["W40", "W9", "W32"].map((sizeLabel) => ({
      category: "Jeans",
      brand: "x",
      condition: "Good",
      sizeLabel,
      name: "",
      tagline: "",
      description: "",
      priceCents: 1,
      salePriceCents: null,
      status: "available",
    }));

    expect(buildFacets(products).sizes).toEqual(["W9", "W32", "W40"]);
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

describe("toSearchParams", () => {
  test("a repeated query parameter keeps its first value, not a joined string", () => {
    const params = toSearchParams({ category: ["Jeans", "Shirts"] });

    expect(params.get("category")).toBe("Jeans");
    expect(readFilters(params).category).toBe("Jeans");
  });

  test("undefined values are dropped rather than stringified", () => {
    const params = toSearchParams({ q: "levi", category: undefined });

    expect(params.has("category")).toBe(false);
    expect(params.get("q")).toBe("levi");
  });
});
