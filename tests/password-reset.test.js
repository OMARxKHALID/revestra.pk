import { beforeEach, describe, expect, mock, test } from "bun:test";

let rows;

const matches = (row, filter) =>
  Object.entries(filter).every(([key, condition]) => {
    const value = row[key];

    if (condition && typeof condition === "object" && !(condition instanceof Date)) {
      if ("$gt" in condition) return value > condition.$gt;
      if ("$lt" in condition) return value < condition.$lt;
    }

    return value === condition;
  });

const collection = {
  findOne: async ({ _id }) => rows.get(_id) ?? null,
  updateOne: async ({ _id }, { $set }) => {
    rows.set(_id, { _id, ...rows.get(_id), ...$set });
  },
  findOneAndUpdate: async (filter, { $inc }) => {
    const row = rows.get(filter._id);

    if (!row || !matches(row, filter)) return null;

    const before = { ...row };
    row.attempts += $inc.attempts;

    return before;
  },
  deleteOne: async ({ _id }) => rows.delete(_id),
};

mock.module("server-only", () => ({}));
const realDb = await import("@/lib/db");

mock.module("@/lib/db", () => ({
  ...realDb,
  getDb: async () => ({ collection: () => collection }),
}));

const { requestReset, verifyCode } = await import("@/lib/api/password-reset");

const wrong = (code) => String((Number(code) + 1) % 1_000_000).padStart(6, "0");

beforeEach(() => {
  rows = new Map();
});

describe("password reset codes", () => {
  test("the right code works once", async () => {
    const code = await requestReset("a@b.pk");

    expect((await verifyCode("a@b.pk", code)).ok).toBe(true);
    expect((await verifyCode("a@b.pk", code)).ok).toBe(false);
  });

  test("five wrong guesses lock the code, even for the right one", async () => {
    const code = await requestReset("a@b.pk");

    for (let i = 0; i < 5; i += 1) await verifyCode("a@b.pk", wrong(code));

    const result = await verifyCode("a@b.pk", code);

    expect(result.ok).toBe(false);
    expect(result.error).toContain("Too many");
  });

  test("a locked code cannot be replaced until the lock expires", async () => {
    const first = await requestReset("a@b.pk");

    for (let i = 0; i < 5; i += 1) await verifyCode("a@b.pk", wrong(first));

    expect(await requestReset("a@b.pk")).toBeNull();

    rows.get("a@b.pk").expiresAt = new Date(Date.now() - 1000);

    const fresh = await requestReset("a@b.pk");

    expect(fresh).not.toBeNull();
    expect((await verifyCode("a@b.pk", fresh)).ok).toBe(true);
  });

  test("asking again before the lock keeps earlier wrong guesses", async () => {
    const first = await requestReset("a@b.pk");

    for (let i = 0; i < 4; i += 1) await verifyCode("a@b.pk", wrong(first));

    const second = await requestReset("a@b.pk");

    await verifyCode("a@b.pk", wrong(second));

    expect((await verifyCode("a@b.pk", second)).ok).toBe(false);
  });

  test("parallel guesses cannot exceed the limit", async () => {
    const code = await requestReset("a@b.pk");

    await Promise.all(
      Array.from({ length: 20 }, () => verifyCode("a@b.pk", wrong(code)))
    );

    expect(rows.get("a@b.pk").attempts).toBe(5);
  });
});
