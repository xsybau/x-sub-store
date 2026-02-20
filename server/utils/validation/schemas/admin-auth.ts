import { z } from "zod";

export const adminLoginBodySchema = z
  .object({
    email: z.preprocess(
      (value) => (typeof value === "string" ? value.trim() : value),
      z.email(),
    ),
    password: z.string().min(1).max(512),
  })
  .strict();

export type AdminLoginBody = z.infer<typeof adminLoginBodySchema>;
