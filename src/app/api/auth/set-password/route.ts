import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/core/db/client";
import { users } from "@/core/db/schema";
import { hashPassword } from "@/core/auth/password";
import { verifySessionToken, createSessionToken, SESSION_COOKIE_NAME } from "@/modules/auth/session-token";

const setPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = setPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const cookieHeader = request.headers.get("cookie") || "";
    const cookie = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [key, ...val] = c.trim().split("=");
        return [key, val.join("=")];
      })
    );

    const sessionToken = cookie[SESSION_COOKIE_NAME];
    if (!sessionToken) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const session = verifySessionToken(sessionToken);
    if (!session) {
      return NextResponse.json({ success: false, error: "Session expired" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (user.passwordHash && user.accountStatus === "active") {
      return NextResponse.json({ success: false, error: "Password already set" }, { status: 400 });
    }

    const passwordHash = hashPassword(parsed.data.password);

    await db
      .update(users)
      .set({ passwordHash, accountStatus: "active", updatedAt: new Date() })
      .where(eq(users.id, user.id));

    const newSessionToken = createSessionToken({
      userId: session.userId,
      email: session.email,
      accountStatus: "active",
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, newSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[set-password] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
