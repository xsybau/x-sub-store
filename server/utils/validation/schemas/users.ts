import { z } from "zod";

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-fA-F0-9]{24}$/);
const tagIdsSchema = z.array(objectIdSchema).max(50);

const normalizedOptionalEmail = z
  .union([
    z.preprocess(
      (value) => (typeof value === "string" ? value.trim() : value),
      z.email(),
    ),
    z.literal(""),
    z.null(),
  ])
  .optional()
  .transform((value) => {
    if (!value) {
      return undefined;
    }
    return value;
  });

export const userIdParamsSchema = z
  .object({
    id: z.string().trim().min(1),
  })
  .strict();

export const createUserBodySchema = z
  .object({
    label: z.string().trim().min(1).max(120),
    email: normalizedOptionalEmail,
    tagIds: tagIdsSchema.optional(),
  })
  .strict();

export const updateUserBodySchema = z
  .object({
    label: z.string().trim().min(1).max(120).optional(),
    email: normalizedOptionalEmail,
    isActive: z.boolean().optional(),
    tagIds: tagIdsSchema.optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.label !== undefined ||
      data.email !== undefined ||
      data.isActive !== undefined ||
      data.tagIds !== undefined,
    {
      message: "At least one field must be provided",
    },
  );

export const listUsersQuerySchema = z
  .object({
    tagId: objectIdSchema.optional(),
  })
  .strict();

export type UserIdParams = z.infer<typeof userIdParamsSchema>;
export type CreateUserBody = z.infer<typeof createUserBodySchema>;
export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
