import { describe, expect, test } from "bun:test";
import {
  createUserBodySchema,
  listUsersQuerySchema,
  updateUserBodySchema,
} from "../server/utils/validation/schemas/users";

const tagId = "65f18aaf2df6e70f9bf01a52";

describe("User schemas with tags", () => {
  test("accepts create payload with tagIds", () => {
    const parsed = createUserBodySchema.parse({
      label: "test-user",
      email: "test@example.com",
      tagIds: [tagId],
    });

    expect(parsed.tagIds).toEqual([tagId]);
  });

  test("rejects create payload with invalid tag id", () => {
    expect(() =>
      createUserBodySchema.parse({
        label: "test-user",
        tagIds: ["invalid"],
      }),
    ).toThrow();
  });

  test("accepts update payload with tagIds only", () => {
    const parsed = updateUserBodySchema.parse({
      tagIds: [tagId],
    });

    expect(parsed.tagIds).toEqual([tagId]);
  });

  test("accepts list query with tagId", () => {
    const parsed = listUsersQuerySchema.parse({
      tagId,
    });

    expect(parsed.tagId).toBe(tagId);
  });
});
