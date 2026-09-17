import { afterEach, describe, expect, test } from "bun:test";
import requestIp from "../src/lib/utils/request-ip.js";

const request = (headers) => new Request("https://revestra.pk/api", { headers });

afterEach(() => {
  delete process.env.VERCEL;
  delete process.env.TRUST_CLOUDFLARE;
});

describe("client address", () => {
  test("a client cannot pick its own address with cf-connecting-ip", () => {
    process.env.VERCEL = "1";

    const ip = requestIp(
      request({ "cf-connecting-ip": "1.2.3.4", "x-vercel-forwarded-for": "9.9.9.9" })
    );

    expect(ip).toBe("9.9.9.9");
  });

  test("off Vercel, platform headers sent by the client are ignored", () => {
    const ip = requestIp(
      request({ "x-real-ip": "1.2.3.4", "x-forwarded-for": "5.5.5.5, 8.8.8.8" })
    );

    expect(ip).toBe("8.8.8.8");
  });

  test("cf-connecting-ip is used only when Cloudflare is declared", () => {
    process.env.TRUST_CLOUDFLARE = "1";

    expect(requestIp(request({ "cf-connecting-ip": "7.7.7.7" }))).toBe("7.7.7.7");
  });
});
