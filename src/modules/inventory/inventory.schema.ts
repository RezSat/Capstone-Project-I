import { z } from "zod";

export const adjustInventorySchema = z.object({
  variantId: z.string().uuid(),
  type: z.enum(["in", "out", "adjustment"]),
  quantity: z.number().int().nonnegative(),
  note: z.string().trim().optional(),
  source: z.string().trim().optional(),
});

export type AdjustInventorySchema = z.infer<typeof adjustInventorySchema>;