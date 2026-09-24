import { describe, expect, mock, test } from "bun:test";

mock.module("server-only", () => ({}));

let reads = 0;
let stored = { name: "First" };

const collection = {
  findOne: async () => {
    reads += 1;
    return stored;
  },
  updateOne: async (_filter, { $set }) => {
    stored = { ...stored, ...$set };
  },
};

mock.module("@/lib/db", () => ({
  isDatabaseConfigured: () => true,
  getDb: async () => ({ collection: () => collection }),
}));

const { getSettings, saveSettings } = await import("@/lib/api/settings");

describe("settings cache", () => {
  test("repeat reads share one database round trip", async () => {
    globalThis.__settings.expiresAt = 0;
    reads = 0;

    await Promise.all([getSettings(), getSettings(), getSettings()]);

    expect(reads).toBe(1);
  });

  test("a save makes the next read fetch fresh settings", async () => {
    await getSettings();
    await saveSettings({ name: "Second" });

    const settings = await getSettings();

    expect(settings.name).toBe("Second");
  });
});
