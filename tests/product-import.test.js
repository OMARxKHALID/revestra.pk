import { describe, expect, test } from "bun:test";
import { parseCsv } from "../src/lib/utils/csv.js";
import { buildImportRow } from "../src/lib/utils/product-import.js";

describe("CSV parsing", () => {
  test("headers are normalised and rows keyed by them", () => {
    const { headers, rows } = parseCsv("Name, Sale Price\r\nLevi's,4200\r\n");

    expect(headers).toEqual(["name", "saleprice"]);
    expect(rows).toEqual([{ name: "Levi's", saleprice: "4200" }]);
  });

  test("quoted fields keep commas, newlines and doubled quotes", () => {
    const { rows } = parseCsv('name,description\n"Cap, wool","32"" waist\nsecond line"\n');

    expect(rows[0].name).toBe("Cap, wool");
    expect(rows[0].description).toBe('32" waist\nsecond line');
  });

  test("blank lines and a trailing newline are ignored", () => {
    expect(parseCsv("name\nA\n\nB\n").rows).toEqual([{ name: "A" }, { name: "B" }]);
  });

  test("an empty file gives nothing", () => {
    expect(parseCsv("")).toEqual({ headers: [], rows: [] });
  });
});

describe("import rows", () => {
  const row = {
    name: "Levi's 501",
    tagline: "Honest fade",
    brand: "Levi's",
    category: "Jeans",
    sizesystem: "Waist",
    sizelabel: "W32",
    condition: "good",
    price: "4,800",
    saleprice: "",
    cost: "900",
    measurements: 'Waist=32"|Inseam=30"',
    description: "A pair of 501s",
    details: "100% cotton|Button fly",
    image: "/assets/a.webp",
    images: "",
    status: "",
  };

  test("rupees become paisa and lists and pairs are split", () => {
    const { ok, value } = buildImportRow(row);

    expect(ok).toBe(true);
    expect(value.priceCents).toBe(480000);
    expect(value.costCents).toBe(90000);
    expect(value.salePriceCents).toBeNull();
    expect(value.details).toEqual(["100% cotton", "Button fly"]);
    expect(value.measurements).toEqual({ Waist: '32"', Inseam: '30"' });
    expect(value.status).toBe("available");
  });

  test("size system, condition and status are matched without case", () => {
    const { value } = buildImportRow({ ...row, status: "SOLD" });

    expect(value.sizeSystem).toBe("waist");
    expect(value.condition).toBe("Good");
    expect(value.status).toBe("sold");
  });

  test("bad numbers and unknown values are reported, not guessed", () => {
    expect(buildImportRow({ ...row, price: "free" }).error).toContain("price");
    expect(buildImportRow({ ...row, cost: "" }).error).toContain("cost");
    expect(buildImportRow({ ...row, condition: "mint" }).error).toContain("condition");
    expect(buildImportRow({ ...row, sizesystem: "metric" }).error).toContain("sizeSystem");
    expect(buildImportRow({ ...row, status: "gone" }).error).toContain("status");
  });
});
