import { describe, expect, test } from "bun:test";
import { mergeUserTagIds } from "../server/utils/services/tag-assignment";

describe("Tag assignment", () => {
  test("merges selected and default tag ids without duplicates", () => {
    const selected = ["a", "b", "c"];
    const defaults = ["c", "d", "a"];

    expect(mergeUserTagIds(selected, defaults)).toEqual(["a", "b", "c", "d"]);
  });
});
