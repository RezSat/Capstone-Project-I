import { NextResponse, type NextRequest } from "next/server";
import { dashboardAuth } from "./core/auth/better-auth";
import { verifySessionToken, SESSION_COOKIE_NAME } from "./modules/auth/session-token";

function shouldBypassDashboardAuthForE2E(request: NextRequest) {
  if (process.env.E2E_DASHBOARD_AUTH_BYPASS !== "1") return false;
  return request.cookies.get("dashboard-e2e-auth")?.value === "1";
}

function parseCookies(header: string): Record<string, string> {
  return Object.fromEntries(
    header.split(";").map((c) => {
      const [key, ...val] = c.trim().split("=");
      return [key, val.join("=")];
    })
  );
}

function getStorefrontSession(request: NextRequest) {
  const cookies = parseCookies(request.headers.get("cookie") || "");
  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) return null;
  return verifySessionToken(token);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/auth")) {
    if (pathname.startsWith("/dashboard") && shouldBypassDashboardAuthForE2E(request)) {
      return NextResponse.next({ request });
    }

    try {
      const session = await dashboardAuth.api.getSession({
        headers: new Headers(request.headers),
      });
      if (pathname.startsWith("/dashboard") && !session) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("redirectTo", pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      if (pathname.startsWith("/dashboard")) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("redirectTo", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    return NextResponse.next({ request });
  }

  const isSetup = pathname === "/setup-account" || pathname.startsWith("/setup-account/");

  if (isSetup) {
    const session = getStorefrontSession(request);

    if (session?.accountStatus === "active") {
      return NextResponse.redirect(new URL("/account", request.url));
    }

    return NextResponse.next({ request });
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/:path*",
    "/setup-account/:path*",
  ],
};
