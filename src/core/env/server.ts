import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url().optional(),
});

export const env = serverEnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
});
