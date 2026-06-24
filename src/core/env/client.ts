import { z } from "zod";

const clientEnvSchema = z.object({});

export const clientEnv = clientEnvSchema.parse({});
