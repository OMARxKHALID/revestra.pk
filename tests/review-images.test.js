import { describe, expect, test, mock } from "bun:test";

mock.module("server-only", () => ({}));
mock.module("@/lib/db", () => ({
  isDatabaseConfigured: () => false,
  getDb: async () => null,
}));

const { decodeDataUrl, sniffType, MAX_BYTES } = await import(
  "@/lib/api/review-images"
);

const dataUrl = (type, bytes) =>
  `data:${type};base64,${Buffer.from(bytes).toString("base64")}`;

const JPEG = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const WEBP = [
  0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
];

describe("review photo validation", () => {
  test("accepts a real JPEG", () => {
    const result = decodeDataUrl(dataUrl("image/jpeg", JPEG));

    expect(result.ok).toBe(true);
    expect(result.type).toBe("image/jpeg");
  });

  test("accepts a real PNG and WebP", () => {
    expect(decodeDataUrl(dataUrl("image/png", PNG)).ok).toBe(true);
    expect(decodeDataUrl(dataUrl("image/webp", WEBP)).ok).toBe(true);
  });

  test("rejects a script disguised as an image by its declared type", () => {
    const payload = Buffer.from("<script>alert(1)</script>", "utf8");
    const result = decodeDataUrl(
      `data:image/png;base64,${payload.toString("base64")}`
    );

    expect(result.ok).toBe(false);
    expect(result.error).toContain("not a real image");
  });

  test("rejects a PNG body claiming to be a JPEG", () => {
    const result = decodeDataUrl(dataUrl("image/jpeg", PNG));

    expect(result.ok).toBe(false);
  });

  test("rejects an SVG, which can carry script", () => {
    const svg = Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>", "utf8");
    const result = decodeDataUrl(
      `data:image/svg+xml;base64,${svg.toString("base64")}`
    );

    expect(result.ok).toBe(false);
    expect(result.error).toContain("JPEG, PNG or WebP");
  });

  test("rejects anything over the size cap", () => {
    const big = [...JPEG, ...new Array(MAX_BYTES).fill(0x00)];
    const result = decodeDataUrl(dataUrl("image/jpeg", big));

    expect(result.ok).toBe(false);
    expect(result.error).toContain("1.5 MB");
  });

  test("rejects a plain URL rather than fetching it", () => {
    expect(decodeDataUrl("https://evil.example/x.png").ok).toBe(false);
  });

  test("sniffType ignores a WebP header without the WEBP marker", () => {
    expect(sniffType(Buffer.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 1, 2, 3, 4]))).toBeNull();
  });
});
