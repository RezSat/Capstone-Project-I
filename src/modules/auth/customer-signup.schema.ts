import { z } from "zod";

export const customerSignupSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  phone: z.string().trim().min(7, "Please enter a valid phone number").optional().or(z.literal("")),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type CustomerSignupSchema = z.infer<typeof customerSignupSchema>;
