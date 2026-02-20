import { z } from "zod";

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-fA-F0-9]{24}$/);

export const tagIdParamsSchema = z
  .object({
    id: objectIdSchema,
  })
  .strict();

export const createTagBodySchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    isDefault: z.boolean().optional(),
  })
  .strict();

export const updateTagBodySchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    isDefault: z.boolean().optional(),
  })
  .strict()
  .refine((data) => data.name !== undefined || data.isDefault !== undefined, {
    message: "At least one field must be provided",
  });

export const tagBulkActionBodySchema = z
  .object({
    action: z.enum(["DEACTIVATE_USERS", "DELETE_USERS", "ROTATE_TOKENS"]),
  })
  .strict();

const applyModeSchema = z.enum(["ALL", "SELECTED"]);

export const tagApplyBodySchema = z
  .object({
    mode: applyModeSchema,
    userIds: z.array(objectIdSchema).max(5000).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.mode === "SELECTED" && (!data.userIds || !data.userIds.length)) {
      ctx.addIssue({
        code: "custom",
        message: "userIds is required for SELECTED mode",
        path: ["userIds"],
      });
    }

    if (data.mode === "ALL" && data.userIds !== undefined) {
      ctx.addIssue({
        code: "custom",
        message: "userIds must not be set for ALL mode",
        path: ["userIds"],
      });
    }
  });

export type TagIdParams = z.infer<typeof tagIdParamsSchema>;
export type CreateTagBody = z.infer<typeof createTagBodySchema>;
export type UpdateTagBody = z.infer<typeof updateTagBodySchema>;
export type TagBulkActionBody = z.infer<typeof tagBulkActionBodySchema>;
export type TagApplyBody = z.infer<typeof tagApplyBodySchema>;
