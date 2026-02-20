import { describe, expect, test } from "bun:test";
import { tagApplyBodySchema } from "../server/utils/validation/schemas/tags";

const userId = "65f18aaf2df6e70f9bf01a51";

describe("Tag apply schema", () => {
  test("accepts ALL mode without userIds", () => {
    const parsed = tagApplyBodySchema.parse({
      mode: "ALL",
    });

    expect(parsed.mode).toBe("ALL");
  });

  test("accepts SELECTED mode with userIds", () => {
    const parsed = tagApplyBodySchema.parse({
      mode: "SELECTED",
      userIds: [userId],
    });

    expect(parsed.mode).toBe("SELECTED");
    expect(parsed.userIds).toEqual([userId]);
  });

  test("rejects SELECTED mode without userIds", () => {
    expect(() =>
      tagApplyBodySchema.parse({
        mode: "SELECTED",
      }),
    ).toThrow();
  });

  test("rejects ALL mode with userIds", () => {
    expect(() =>
      tagApplyBodySchema.parse({
        mode: "ALL",
        userIds: [userId],
      }),
    ).toThrow();
  });
});
