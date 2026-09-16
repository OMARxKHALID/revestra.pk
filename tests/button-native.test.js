import { describe, expect, test } from "bun:test";
import { rendersNativeButton } from "@/components/ui/button";

const Link = () => null;

describe("Button nativeButton inference", () => {
  test("no render prop stays a native button", () => {
    expect(rendersNativeButton(undefined)).toBe(true);
  });

  test("an anchor is not a native button", () => {
    expect(rendersNativeButton(<a href="/x" />)).toBe(false);
  });

  test("a component such as Link is not a native button", () => {
    expect(rendersNativeButton(<Link />)).toBe(false);
  });

  test("an explicit button element still counts as native", () => {
    expect(rendersNativeButton(<button type="button" />)).toBe(true);
  });

  test("a render function falls back to native", () => {
    expect(rendersNativeButton(() => null)).toBe(true);
  });
});
