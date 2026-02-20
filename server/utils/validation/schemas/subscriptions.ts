import { z } from "zod";

export const tokenParamsSchema = z
  .object({
    token: z.string().trim().min(1),
  })
  .strict();

export const ifNoneMatchHeaderSchema = z
  .object({
    "if-none-match": z.string().trim().min(1).optional(),
  })
  .strict();

export type TokenParams = z.infer<typeof tokenParamsSchema>;
export type IfNoneMatchHeader = z.infer<typeof ifNoneMatchHeaderSchema>;
