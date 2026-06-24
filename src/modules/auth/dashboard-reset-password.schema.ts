import { z } from "zod";

export const dashboardResetPasswordSchema = z
  .object({
    password: z.string().trim().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().trim().min(1, "Please confirm your new password"),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
