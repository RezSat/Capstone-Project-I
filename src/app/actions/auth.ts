"use server";

import { headers } from "next/headers";
import { dashboardAuth } from "@/core/auth/better-auth";
import { findLinkedAppUserDirect } from "@/core/auth/auth-helper";
import { resolveLoginRedirect } from "@/modules/auth/login-redirect";
import { eq } from "drizzle-orm";
import { db } from "@/core/db/client";
import { users } from "@/core/db/schema";
import { verifyPassword } from "@/core/auth/password";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/modules/auth/session-token";
import { z } from "zod";
import { cookies } from "next/headers";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export async function loginAction(input: { email: string; password: string }) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      isSuccess: false,
      message: "Please correct the form fields and try again.",
      errors: {
        email: parsed.error.flatten().fieldErrors.email?.[0],
        password: parsed.error.flatten().fieldErrors.password?.[0],
      },
    };
  }

  const requestHeaders = await headers();
  const headerObj = new Headers(requestHeaders);

  const api = dashboardAuth.api as typeof dashboardAuth.api & {
    signInEmail: (input: {
      body: { email: string; password: string };
      headers: Headers;
    }) => Promise<{ token?: string; user?: { id: string; email: string } }>;
  };
  let result: { token?: string; user?: { id: string; email: string } };
  try {
    result = await api.signInEmail({
      body: { email: input.email, password: input.password },
      headers: headerObj,
    });
  } catch {
    result = { token: undefined, user: undefined };
  }

  if (result.token && result.user) {
    const user = await findLinkedAppUserDirect(result.user.id);
    const decision = resolveLoginRedirect(user);

    if (decision.kind === "error") {
      await dashboardAuth.api.signOut({ headers: headerObj });
      return {
        isSuccess: false,
        message: decision.message,
        errors: {},
      };
    }

    return {
      isSuccess: true,
      redirectTo: decision.destination,
    };
  }

  console.log("[loginAction] Better Auth failed, trying storefront login for:", input.email);
  const normalizedEmail = input.email.trim().toLowerCase();
  const storefrontUser = await db.query.users.findFirst({
    where: eq(users.normalizedEmail, normalizedEmail),
    columns: {
      id: true,
      email: true,
      passwordHash: true,
      accountStatus: true,
      status: true,
    },
  });

  if (!storefrontUser) {
    return {
      isSuccess: false,
      message: "Invalid email or password.",
      errors: {},
    };
  }

  if (storefrontUser.status !== "active") {
    return {
      isSuccess: false,
      message: "Account is not active.",
      errors: {},
    };
  }

  if (!storefrontUser.passwordHash) {
    return {
      isSuccess: false,
      message: "No password set. Please complete your account setup first.",
      errors: {},
    };
  }

  const passwordValid = verifyPassword(input.password, storefrontUser.passwordHash);
  if (!passwordValid) {
    return {
      isSuccess: false,
      message: "Invalid email or password.",
      errors: {},
    };
  }

  console.log("[loginAction] Storefront login successful for:", normalizedEmail);
  const sessionToken = createSessionToken({
    userId: storefrontUser.id,
    email: storefrontUser.email,
    accountStatus: storefrontUser.accountStatus ?? "incomplete",
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return {
    isSuccess: true,
    redirectTo: "/account",
  };
}
