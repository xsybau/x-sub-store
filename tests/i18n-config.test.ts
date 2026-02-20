import { describe, expect, test } from "bun:test";
import {
  defaultLocale,
  getLocaleDirection,
  isAppLocale,
  normalizeLocale,
} from "../i18n/config";

describe("i18n config", () => {
  test("default locale is english", () => {
    expect(defaultLocale).toBe("en");
  });

  test("locale guards and normalization", () => {
    expect(isAppLocale("en")).toBe(true);
    expect(isAppLocale("fa")).toBe(true);
    expect(isAppLocale("ru")).toBe(true);
    expect(isAppLocale("zh")).toBe(true);
    expect(isAppLocale("de")).toBe(false);

    expect(normalizeLocale("en")).toBe("en");
    expect(normalizeLocale("fa")).toBe("fa");
    expect(normalizeLocale("ru")).toBe("ru");
    expect(normalizeLocale("zh")).toBe("zh");
    expect(normalizeLocale("de")).toBe("en");
    expect(normalizeLocale(undefined)).toBe("en");
  });

  test("locale direction mapping", () => {
    expect(getLocaleDirection("en")).toBe("ltr");
    expect(getLocaleDirection("ru")).toBe("ltr");
    expect(getLocaleDirection("zh")).toBe("ltr");
    expect(getLocaleDirection("fa")).toBe("rtl");
  });
});
