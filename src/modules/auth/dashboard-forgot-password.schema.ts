import { z } from "zod";

export const dashboardForgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});
