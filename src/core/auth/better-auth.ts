import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/client";
import * as schema from "../db/schema/better-auth";
import { env } from "../env/server";

export const dashboardAuth = betterAuth({
  appName: "Inventory Platform Dashboard",
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    sendResetPassword: async ({ user, url }) => {
      console.info(`Password reset requested for ${user.email}: ${url}`);
    },
  },
  plugins: [nextCookies()],
});
