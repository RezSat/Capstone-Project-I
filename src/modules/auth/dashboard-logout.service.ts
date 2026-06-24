import { cookies } from "next/headers";
import { headers } from "next/headers";
import { isDashboardAuthCookieName } from "../../core/auth/dashboard-cookies";
import { dashboardAuth } from "../../core/auth/better-auth";

async function clearDashboardAuthCookies() {
  const cookieStore = await cookies();

  for (const cookie of cookieStore.getAll()) {
    if (isDashboardAuthCookieName(cookie.name) || cookie.name.includes("better-auth")) {
      cookieStore.delete(cookie.name);
    }
  }
}

export async function logoutDashboardUser() {
  const requestHeaders = new Headers(await headers());

  try {
    await dashboardAuth.api.signOut({ headers: requestHeaders });
  } catch {
    await clearDashboardAuthCookies();
    return;
  }

  await clearDashboardAuthCookies();
}
