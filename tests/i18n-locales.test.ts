import { describe, expect, test } from "bun:test";
import type { AppLocale } from "../i18n/config";
import { appLocales } from "../i18n/config";
import { messages } from "../i18n/messages";

const collectLeafPaths = (
  value: unknown,
  prefix = "",
  output: string[] = [],
): string[] => {
  if (typeof value !== "object" || value === null) {
    output.push(prefix);
    return output;
  }

  const entries = Object.entries(value as Record<string, unknown>);
  if (!entries.length) {
    output.push(prefix);
    return output;
  }

  for (const [key, nextValue] of entries) {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    collectLeafPaths(nextValue, nextPrefix, output);
  }

  return output;
};

const sortPaths = (paths: string[]): string[] => {
  return [...new Set(paths)].sort();
};

describe("i18n locale key parity", () => {
  test("all locales match english keyset", () => {
    const baseline = sortPaths(collectLeafPaths(messages.en));

    for (const localeMeta of appLocales) {
      const locale = localeMeta.code as AppLocale;
      const candidate = sortPaths(collectLeafPaths(messages[locale]));
      expect(candidate).toEqual(baseline);
    }
  });
});
