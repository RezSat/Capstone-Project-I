import type { DashboardUserRole } from "../../core/auth/rbac-permissions";

export type DashboardAuthStatus = "authenticated" | "unauthenticated" | "inactive";

export type DashboardAuthResult = {
  userId: string;
  email: string;
  role: DashboardUserRole;
  isActive: boolean;
  isAuthenticated: boolean;
  status: DashboardAuthStatus;
};

export type DashboardAccessContext = {
  userId: string;
  email: string;
  role: DashboardUserRole;
  isActive: boolean;
  hasAccess: boolean;
};
