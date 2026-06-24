import { z } from "zod";

const optionalText = z.string().trim().max(120, "Must be 120 characters or less").optional();

export const customerProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80, "First name is too long"),
  lastName: z.string().trim().min(1, "Last name is required").max(80, "Last name is too long"),
  phone: optionalText,
  displayName: optionalText,
});

export type CustomerProfileInput = z.infer<typeof customerProfileSchema>;
