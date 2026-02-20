import { z } from "zod";

const scopeSchema = z.enum(["GLOBAL", "USER", "TAG"]);
const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-fA-F0-9]{24}$/);

export const staticNodeIdParamsSchema = z
  .object({
    id: z.string().trim().min(1),
  })
  .strict();

export const listStaticNodesQuerySchema = z
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

export const createStaticNodeBodySchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    content: z.string().trim().min(1),
    scope: scopeSchema,
    userId: objectIdSchema.optional(),
    tagId: objectIdSchema.optional(),
    enabled: z.boolean().optional(),
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

export const updateStaticNodeBodySchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    content: z.string().trim().min(1).optional(),
    enabled: z.boolean().optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.name !== undefined ||
      data.content !== undefined ||
      data.enabled !== undefined,
    {
      message: "At least one field must be provided",
    },
  );

export type StaticNodeIdParams = z.infer<typeof staticNodeIdParamsSchema>;
export type ListStaticNodesQuery = z.infer<typeof listStaticNodesQuerySchema>;
export type CreateStaticNodeBody = z.infer<typeof createStaticNodeBodySchema>;
export type UpdateStaticNodeBody = z.infer<typeof updateStaticNodeBodySchema>;
