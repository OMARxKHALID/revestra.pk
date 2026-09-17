import { describe, expect, test } from "bun:test";
import { codProblem } from "../src/lib/utils/cod.js";
import { courierTrackingUrl } from "../src/lib/utils/courier.js";
import { activeAnnouncement } from "../src/lib/utils/announcement.js";
import { settingsSchema } from "../src/lib/schemas/settings.js";
import { DEFAULT_SETTINGS } from "../src/lib/settings.js";

describe("cash on delivery limits", () => {
  const commerce = { codMaxCents: 1_500_000, codCities: ["Karachi", "Lahore"] };

  test("no limits means cash on delivery is always offered", () => {
    expect(codProblem({ commerce: {}, totalCents: 99_999_999, city: "Quetta" })).toBeNull();
  });

  test("an order over the limit cannot pay on delivery", () => {
    expect(codProblem({ commerce, totalCents: 1_500_001, city: "Karachi" })).toContain("up to");
    expect(codProblem({ commerce, totalCents: 1_500_000, city: "Karachi" })).toBeNull();
  });

  test("cities match without regard to case or spacing", () => {
    expect(codProblem({ commerce, totalCents: 100, city: "  karachi " })).toBeNull();
    expect(codProblem({ commerce, totalCents: 100, city: "Quetta" })).toContain("Quetta");
  });

  test("an empty city is not judged until it is typed", () => {
    expect(codProblem({ commerce, totalCents: 100, city: "" })).toBeNull();
  });
});

describe("courier tracking links", () => {
  const couriers = [
    { name: "TCS", trackingUrl: "https://track.example/tcs?cn={number}" },
    { name: "Leopards", trackingUrl: "https://track.example/leopards/" },
    { name: "M&P", trackingUrl: "" },
  ];

  test("the number fills the placeholder and is encoded", () => {
    expect(courierTrackingUrl(couriers, "tcs", " AB 12 ")).toBe(
      "https://track.example/tcs?cn=AB%2012"
    );
  });

  test("without a placeholder the number is appended", () => {
    expect(courierTrackingUrl(couriers, "Leopards", "LP9")).toBe(
      "https://track.example/leopards/LP9"
    );
  });

  test("no link when the courier has none, is unknown, or a part is missing", () => {
    expect(courierTrackingUrl(couriers, "M&P", "1")).toBeNull();
    expect(courierTrackingUrl(couriers, "DHL", "1")).toBeNull();
    expect(courierTrackingUrl(couriers, "TCS", "")).toBeNull();
  });
});

describe("announcement bar", () => {
  const base = { enabled: true, text: "Sale", href: "", endsAt: "" };

  test("shows only when switched on with text", () => {
    expect(activeAnnouncement(base)).toEqual(base);
    expect(activeAnnouncement({ ...base, enabled: false })).toBeNull();
    expect(activeAnnouncement({ ...base, text: "" })).toBeNull();
  });

  test("a picker time is read as Pakistan time", () => {
    const ann = { ...base, endsAt: "2026-09-20T18:00" };

    expect(activeAnnouncement(ann, new Date("2026-09-20T12:59:00Z"))).not.toBeNull();
    expect(activeAnnouncement(ann, new Date("2026-09-20T13:00:00Z"))).toBeNull();
  });
});

describe("settings saved before these fields existed", () => {
  test("still parse, with the new fields defaulted", () => {
    const { announcement, couriers, ...older } = DEFAULT_SETTINGS;
    const { codMaxCents, codCities, ...olderCommerce } = DEFAULT_SETTINGS.commerce;
    const parsed = settingsSchema.parse({ ...older, commerce: olderCommerce });

    expect(parsed.announcement.enabled).toBe(false);
    expect(parsed.couriers).toEqual([]);
    expect(parsed.commerce.codMaxCents).toBe(0);
    expect(parsed.commerce.codCities).toEqual([]);
  });

  test("an announcement switched on needs text, and links must be paths or https", () => {
    const bad = settingsSchema.safeParse({
      ...DEFAULT_SETTINGS,
      announcement: { enabled: true, text: "", href: "javascript:alert(1)", endsAt: "" },
    });

    expect(bad.success).toBe(false);
    expect(bad.error.issues.map(({ path }) => path.join("."))).toEqual(
      expect.arrayContaining(["announcement.text", "announcement.href"])
    );
  });
});
