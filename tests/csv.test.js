import { describe, expect, test } from "bun:test";
import { toCsv } from "../src/lib/utils/csv.js";

const COLUMNS = [
  { header: "Reference", value: (row) => row.reference },
  { header: "Customer", value: (row) => row.name },
  { header: "Total", value: (row) => row.total },
];

describe("spreadsheet formula injection", () => {
  test("a value that would run as a formula is neutralised", () => {
    const csv = toCsv(
      [{ header: "Customer", value: (row) => row.name }],
      [{ name: "=HYPERLINK(\"http://evil\")" }, { name: "@SUM(A1)" }, { name: "Ayesha" }]
    );

    expect(csv.split("\r\n").slice(1)).toEqual([
      '"\'=HYPERLINK(""http://evil"")"',
      "'@SUM(A1)",
      "Ayesha",
    ]);
  });

  test("phone numbers keep their plus sign untouched", () => {
    expect(toCsv([{ header: "Phone", value: (row) => row.phone }], [{ phone: "+92 300 1234567" }])).toBe(
      "Phone\r\n+92 300 1234567"
    );
  });

  test("negative numbers are left alone", () => {
    expect(toCsv([{ header: "Total", value: (row) => row.total }], [{ total: -5 }])).toBe(
      "Total\r\n-5"
    );
  });
});

describe("csv export", () => {
  test("it writes a header row and one row per record", () => {
    const csv = toCsv(COLUMNS, [
      { reference: "CP-1", name: "Ayesha", total: 4450 },
      { reference: "CP-2", name: "Bilal", total: 900 },
    ]);

    expect(csv.split("\r\n")).toEqual([
      "Reference,Customer,Total",
      "CP-1,Ayesha,4450",
      "CP-2,Bilal,900",
    ]);
  });

  test("a comma in a value is quoted, not left to split the row", () => {
    const csv = toCsv(COLUMNS, [
      { reference: "CP-3", name: "Khan, Ayesha", total: 100 },
    ]);

    expect(csv.split("\r\n")[1]).toBe('CP-3,"Khan, Ayesha",100');
  });

  test("a quote inside a value is doubled", () => {
    const csv = toCsv(COLUMNS, [
      { reference: "CP-4", name: 'The "Good" One', total: 1 },
    ]);

    expect(csv.split("\r\n")[1]).toBe('CP-4,"The ""Good"" One",1');
  });

  test("a newline inside a value stays inside its field", () => {
    const csv = toCsv(COLUMNS, [
      { reference: "CP-5", name: "Line\nBreak", total: 1 },
    ]);

    expect(csv).toContain('"Line\nBreak"');
  });

  test("missing values become empty, never the word undefined", () => {
    const csv = toCsv(COLUMNS, [{ reference: "CP-6" }]);

    expect(csv.split("\r\n")[1]).toBe("CP-6,,");
  });

  test("no rows still yields the header", () => {
    expect(toCsv(COLUMNS, [])).toBe("Reference,Customer,Total");
  });
});
