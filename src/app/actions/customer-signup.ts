"use server";

import { access } from "node:fs/promises";
import path from "node:path";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { dashboardAuth } from "@/core/auth/better-auth";
import { customerSignupSchema } from "@/modules/auth/customer-signup.schema";
import type { CustomerSignupResult } from "@/modules/auth/customer-signup.types";
import { createCustomerUserWithIdentity } from "@/modules/users/app-users.service";

async function resolveCustomerRedirectPath() {
  const storefrontPath = path.join(process.cwd(), "src", "app", "(storefront)", "account", "page.tsx");
  const directPath = path.join(process.cwd(), "src", "app", "account", "page.tsx");
  try {
    await access(storefrontPath);
    return "/account";
  } catch {
    try {
      await access(directPath);
      return "/account";
    } catch {
      return "/";
    }
  }
}

function duplicateEmailResult(): CustomerSignupResult {
  return {
    isSuccess: false,
    message: "An account with this email already exists.",
    errors: { email: "Email is already in use" },
  };
}

export async function customerSignupAction(input: {
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
  password: string;
}): Promise<CustomerSignupResult> {
  const parsed = customerSignupSchema.safeParse(input);
  if (!parsed.success) {
    return {
      isSuccess: false,
      message: "Please correct the form fields and try again.",
        errors: {
          firstName: parsed.error.flatten().fieldErrors.firstName?.[0],
          lastName: parsed.error.flatten().fieldErrors.lastName?.[0],
          phone: parsed.error.flatten().fieldErrors.phone?.[0],
          email: parsed.error.flatten().fieldErrors.email?.[0],
          password: parsed.error.flatten().fieldErrors.password?.[0],
        },
      };
  }

  const requestHeaders = new Headers(await headers());
  const api = dashboardAuth.api as typeof dashboardAuth.api & {
    signUpEmail: (input: {
      body: { name: string; email: string; password: string };
      headers: Headers;
    }) => Promise<{ token: string | null; user: { id: string } }>;
    signInEmail: (input: {
      body: { email: string; password: string };
      headers: Headers;
    }) => Promise<{ token?: string }>;
  };

  const fullName = `${parsed.data.firstName.trim()} ${parsed.data.lastName.trim()}`.trim();
  let signupResult: { token: string | null; user: { id: string } };
  try {
    signupResult = await api.signUpEmail({
      body: { name: fullName, email: parsed.data.email, password: parsed.data.password },
      headers: requestHeaders,
    });
  } catch {
    return duplicateEmailResult();
  }

  try {
    await createCustomerUserWithIdentity({
      authUserId: signupResult.user.id,
      email: parsed.data.email,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      displayName: fullName,
      phone: parsed.data.phone?.trim() || null,
    });
  } catch {
    return duplicateEmailResult();
  }
  await api.signInEmail({ body: { email: parsed.data.email, password: parsed.data.password }, headers: requestHeaders });
  redirect(await resolveCustomerRedirectPath());
}
