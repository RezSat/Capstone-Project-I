import { headers } from "next/headers";
import { dashboardAuth } from "../../core/auth/better-auth";
import { findDashboardUserByAuthUserId } from "../users/dashboard-user.repo";
import type { DashboardAuthResult } from "./dashboard-auth.types";

export async function getDashboardAuth(): Promise<DashboardAuthResult> {
  const requestHeaders = new Headers(await headers());
  const session = await dashboardAuth.api.getSession({ headers: requestHeaders });

  if (!session) {
    return {
      userId: "",
      email: "",
      role: "viewer",
      isActive: false,
      isAuthenticated: false,
      status: "unauthenticated",
    };
  }

  const authUser = session.user;
  const dbUser = await findDashboardUserByAuthUserId(authUser.id);

  if (!dbUser) {
    return {
      userId: authUser.id,
      email: authUser.email ?? "",
      role: "viewer",
      isActive: false,
      isAuthenticated: true,
      status: "inactive",
    };
  }

  return {
    userId: authUser.id,
    email: authUser.email ?? "",
    role: dbUser.role,
    isActive: dbUser.isActive,
    isAuthenticated: true,
    status: dbUser.isActive ? "authenticated" : "inactive",
  };
}
