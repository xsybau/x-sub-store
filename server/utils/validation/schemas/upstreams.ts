import { z } from "zod";

const scopeSchema = z.enum(["GLOBAL", "USER", "TAG"]);
const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-fA-F0-9]{24}$/);

export const upstreamIdParamsSchema = z
  .object({
    id: z.string().trim().min(1),
  })
  .strict();

export const listUpstreamsQuerySchema = z
  .object({
    scope: scopeSchema.optional(),
    userId: objectIdSchema.optional(),
    tagId: objectIdSchema.optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.scope === "USER" && !data.userId) {
      ctx.addIssue({
        code: "custom",
        message: "userId is required for USER scope",
        path: ["userId"],
      });
    }
    if (data.scope === "TAG" && !data.tagId) {
      ctx.addIssue({
        code: "custom",
        message: "tagId is required for TAG scope",
        path: ["tagId"],
      });
    }
    if (data.scope === "GLOBAL" && (data.userId || data.tagId)) {
      ctx.addIssue({
        code: "custom",
        message: "userId/tagId must not be set for GLOBAL scope",
        path: ["scope"],
      });
    }
    if (data.scope === "USER" && data.tagId) {
      ctx.addIssue({
        code: "custom",
        message: "tagId must not be set for USER scope",
        path: ["tagId"],
      });
    }
    if (data.scope === "TAG" && data.userId) {
      ctx.addIssue({
        code: "custom",
        message: "userId must not be set for TAG scope",
        path: ["userId"],
      });
    }
  });

export const createUpstreamBodySchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    url: z.preprocess(
      (value) => (typeof value === "string" ? value.trim() : value),
      z.url().max(2048),
    ),
    scope: scopeSchema,
    userId: objectIdSchema.optional(),
    tagId: objectIdSchema.optional(),
    enabled: z.boolean().optional(),
    type: z.string().trim().min(1).max(40).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.scope === "USER" && !data.userId) {
      ctx.addIssue({
        code: "custom",
        message: "userId is required for USER scope",
        path: ["userId"],
      });
    }
    if (data.scope === "GLOBAL" && data.userId) {
      ctx.addIssue({
        code: "custom",
        message: "userId must not be set for GLOBAL scope",
        path: ["userId"],
      });
    }
    if (data.scope === "TAG" && !data.tagId) {
      ctx.addIssue({
        code: "custom",
        message: "tagId is required for TAG scope",
        path: ["tagId"],
      });
    }
    if (data.scope === "GLOBAL" && data.tagId) {
      ctx.addIssue({
        code: "custom",
        message: "tagId must not be set for GLOBAL scope",
        path: ["tagId"],
      });
    }
    if (data.scope === "USER" && data.tagId) {
      ctx.addIssue({
        code: "custom",
        message: "tagId must not be set for USER scope",
        path: ["tagId"],
      });
    }
    if (data.scope === "TAG" && data.userId) {
      ctx.addIssue({
        code: "custom",
        message: "userId must not be set for TAG scope",
        path: ["userId"],
      });
    }
  });

export const updateUpstreamBodySchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    url: z
      .preprocess(
        (value) => (typeof value === "string" ? value.trim() : value),
        z.url().max(2048),
      )
      .optional(),
    enabled: z.boolean().optional(),
    type: z.string().trim().min(1).max(40).optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.name !== undefined ||
      data.url !== undefined ||
      data.enabled !== undefined ||
      data.type !== undefined,
    {
      message: "At least one field must be provided",
    },
  );

export const testFetchBodySchema = z
  .object({
    url: z.preprocess(
      (value) => (typeof value === "string" ? value.trim() : value),
      z.url().max(2048),
    ),
    upstreamId: objectIdSchema.optional(),
  })
  .strict();

export type UpstreamIdParams = z.infer<typeof upstreamIdParamsSchema>;
export type ListUpstreamsQuery = z.infer<typeof listUpstreamsQuerySchema>;
export type CreateUpstreamBody = z.infer<typeof createUpstreamBodySchema>;
export type UpdateUpstreamBody = z.infer<typeof updateUpstreamBodySchema>;
export type TestFetchBody = z.infer<typeof testFetchBodySchema>;
