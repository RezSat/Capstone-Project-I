import { NextResponse } from "next/server";
import { z } from "zod";
import { autoLoginFromCheckout } from "@/modules/auth/checkout-auto-login.service";
import { SESSION_COOKIE_NAME } from "@/modules/auth/session-token";

const zodSchema = z.object({
  orderNumber: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    console.log("[AUTO-LOGIN] === auto-login called ===");
    const body = await request.json();
    const parsed = zodSchema.safeParse(body);

    if (!parsed.success) {
      console.error("[AUTO-LOGIN] Validation failed:", parsed.error.flatten());
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }

    const { orderNumber } = parsed.data;
    console.log("[AUTO-LOGIN] Looking up order:", orderNumber);
    const result = await autoLoginFromCheckout(orderNumber);
    console.log("[AUTO-LOGIN] Result:", JSON.stringify(result).substring(0, 500));

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    const response = NextResponse.json({
      success: true,
      data: {
        userId: result.userId,
        customerId: result.customerId,
      },
    });

    if (result.sessionToken) {
      response.cookies.set(SESSION_COOKIE_NAME, result.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
      console.log("[AUTO-LOGIN] Cookie set. Set-Cookie header present:", response.headers.has("Set-Cookie"));
    } else {
      console.error("[AUTO-LOGIN] No session token in result!");
    }

    return response;
  } catch (error) {
    console.error("[AUTO-LOGIN] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
