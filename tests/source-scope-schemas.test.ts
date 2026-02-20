import { describe, expect, test } from "bun:test";
import { createStaticNodeBodySchema } from "../server/utils/validation/schemas/static-nodes";
import { createUpstreamBodySchema } from "../server/utils/validation/schemas/upstreams";

const userId = "65f18aaf2df6e70f9bf01a51";
const tagId = "65f18aaf2df6e70f9bf01a52";

describe("Source scope schemas", () => {
  test("accepts TAG scope with tagId for upstreams", () => {
    const parsed = createUpstreamBodySchema.parse({
      name: "Tag upstream",
      url: "https://example.com/sub.txt",
      scope: "TAG",
      tagId,
    });

    expect(parsed.scope).toBe("TAG");
    expect(parsed.tagId).toBe(tagId);
  });

  test("rejects TAG scope upstream without tagId", () => {
    expect(() =>
      createUpstreamBodySchema.parse({
        name: "Tag upstream",
        url: "https://example.com/sub.txt",
        scope: "TAG",
      }),
    ).toThrow();
  });

  test("rejects USER scope upstream with tagId", () => {
    expect(() =>
      createUpstreamBodySchema.parse({
        name: "User upstream",
        url: "https://example.com/sub.txt",
        scope: "USER",
        userId,
        tagId,
      }),
    ).toThrow();
  });

  test("accepts TAG scope with tagId for static nodes", () => {
    const parsed = createStaticNodeBodySchema.parse({
      name: "Tag static",
      content: "vmess://abc",
      scope: "TAG",
      tagId,
    });

    expect(parsed.scope).toBe("TAG");
    expect(parsed.tagId).toBe(tagId);
  });

  test("rejects GLOBAL scope static node with tagId", () => {
    expect(() =>
      createStaticNodeBodySchema.parse({
        name: "Global static",
        content: "vmess://abc",
        scope: "GLOBAL",
        tagId,
      }),
    ).toThrow();
  });
});
