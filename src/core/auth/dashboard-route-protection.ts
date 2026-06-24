import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getDashboardAuth } from "../../modules/auth/dashboard-auth.service";
import { hasPermission, PERMISSIONS } from "./rbac-permissions";

async function isE2EAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    return (
      process.env.E2E_DASHBOARD_AUTH_BYPASS === "1" &&
      cookieStore.get("dashboard-e2e-auth")?.value === "1"
    );
  } catch {
    return false;
  }
}

export async function requirePermission(permission: keyof typeof PERMISSIONS): Promise<void> {
  if (await isE2EAuthenticated()) {
    return;
  }

  const auth = await getDashboardAuth();

  if (!auth.isAuthenticated || !auth.isActive) {
    redirect("/auth/login");
  }

  if (!hasPermission(auth.role, PERMISSIONS[permission])) {
    redirect("/dashboard");
  }
}

export async function requireAnyPermission(...permissions: Array<keyof typeof PERMISSIONS>): Promise<void> {
  if (await isE2EAuthenticated()) return;
  const auth = await getDashboardAuth();
  if (!auth.isAuthenticated || !auth.isActive) redirect("/auth/login");
  const allowed = permissions.some((permission) => hasPermission(auth.role, PERMISSIONS[permission]));
  if (!allowed) redirect("/dashboard");
}

export async function requireRole(...roles: readonly string[]): Promise<void> {
  if (await isE2EAuthenticated()) {
    return;
  }

  const auth = await getDashboardAuth();

  if (!auth.isAuthenticated || !auth.isActive) {
    redirect("/auth/login");
  }

  if (!roles.includes(auth.role)) {
    redirect("/dashboard");
  }
}

export async function getOptionalAuth() {
  return getDashboardAuth();
}
