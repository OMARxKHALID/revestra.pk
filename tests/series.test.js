import { describe, expect, test } from "bun:test";
import { dayKey, fillDailySeries, sinceDays } from "@/lib/utils/series";

const now = new Date("2026-09-09T12:00:00.000Z");

describe("fillDailySeries", () => {
  test("returns one point per day, oldest first", () => {
    const series = fillDailySeries([], 7, now);

    expect(series).toHaveLength(7);
    expect(series[0].day).toBe("2026-09-03");
    expect(series.at(-1).day).toBe("2026-09-09");
  });

  test("zero-fills days with no orders", () => {
    const series = fillDailySeries(
      [{ day: "2026-09-08", revenueCents: 120000, orders: 2 }],
      3,
      now
    );

    expect(series.map((point) => point.revenueCents)).toEqual([0, 120000, 0]);
    expect(series.map((point) => point.orders)).toEqual([0, 2, 0]);
  });

  test("ignores rows outside the window", () => {
    const series = fillDailySeries(
      [{ day: "2026-01-01", revenueCents: 999, orders: 9 }],
      2,
      now
    );

    expect(series.every((point) => point.revenueCents === 0)).toBe(true);
  });
});

describe("sinceDays", () => {
  test("starts at midnight UTC on the first day of the window", () => {
    expect(sinceDays(7, now).toISOString()).toBe("2026-09-03T00:00:00.000Z");
  });

  test("a one day window starts today", () => {
    expect(dayKey(sinceDays(1, now))).toBe("2026-09-09");
  });
});
