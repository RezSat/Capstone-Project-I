import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/modules/auth/session-token";

export async function POST(request: Request) {
  try {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  } catch (error) {
    console.error("[storefront-logout] Error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/", request.url));
}
