import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { dashboardAuth } from "@/core/auth/better-auth";
import { db } from "@/core/db/client";
import { orders } from "@/core/db/schema";
import { createCustomerUserWithIdentity } from "@/modules/users/app-users.repo";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  orderNumber: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const requestHeaders = new Headers(await headers());
    const api = dashboardAuth.api as typeof dashboardAuth.api & {
      signUpEmail: (input: {
        body: { name: string; email: string; password: string };
        headers: Headers;
      }) => Promise<{ token: string | null; user: { id: string } }>;
    };

    let signupResult: { token: string | null; user: { id: string } };
    try {
      signupResult = await api.signUpEmail({
        body: { name: email.split("@")[0], email, password },
        headers: requestHeaders,
      });
    } catch {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const emailNormalized = email.trim().toLowerCase();
    let customerId: string | null = null;

    try {
      const { customerProfile } = await createCustomerUserWithIdentity({
        authUserId: signupResult.user.id,
        email,
        firstName: null,
        lastName: null,
        displayName: emailNormalized,
        phone: null,
      });
      customerId = customerProfile.id;
    } catch {
      return NextResponse.json(
        { success: false, error: "Account created but failed to link profile." },
        { status: 500 }
      );
    }

    if (customerId) {
      await db
        .update(orders)
        .set({ customerId })
        .where(
          eq(orders.customerEmailSnapshot, emailNormalized)
        )
        .returning();
    }

    return NextResponse.json({ success: true, data: { customerId } });
  } catch (err) {
    console.error("register-guest error:", err);
    return NextResponse.json({ success: false, error: "Registration failed" }, { status: 500 });
  }
}