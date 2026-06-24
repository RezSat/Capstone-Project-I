import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/core/db/client";
import { users } from "@/core/db/schema";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/modules/auth/session-token";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookie = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [key, ...val] = c.trim().split("=");
        return [key, val.join("=")];
      })
    );

    const sessionToken = cookie[SESSION_COOKIE_NAME];

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false });
    }

    const session = verifySessionToken(sessionToken);

    if (!session) {
      return NextResponse.json({ authenticated: false });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
      columns: {
        id: true,
        email: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        hasPassword: !!user.passwordHash,
      },
    });
  } catch (error) {
    console.error("[session] Error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
