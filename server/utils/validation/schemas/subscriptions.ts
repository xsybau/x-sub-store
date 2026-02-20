import { z } from "zod";

export const tokenParamsSchema = z
  .object({
    token: z.string().trim().min(1),
  })
  .strict();

export const subscriptionFormatQuerySchema = z
  .object({
    format: z.enum(["raw", "base64"]).optional(),
  })
  .loose();

export const ifNoneMatchHeaderSchema = z
  .object({
    "if-none-match": z.string().trim().min(1).optional(),
  })
  .loose();

export type TokenParams = z.infer<typeof tokenParamsSchema>;
export type SubscriptionFormatQuery = z.infer<
  typeof subscriptionFormatQuerySchema
>;
export type IfNoneMatchHeader = z.infer<typeof ifNoneMatchHeaderSchema>;
