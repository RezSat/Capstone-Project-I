import { z } from "zod";

export const createMovementSchema = z.object({
  productId: z.string().trim().min(1),
  type: z.enum(["in", "out", "adjustment"]),
  quantity: z.number().int().positive(),
  note: z.string().trim().optional(),
  source: z.string().trim().optional(),
});

export type CreateMovementSchema = z.infer<typeof createMovementSchema>;