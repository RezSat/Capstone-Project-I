import type { DashboardUserRole } from "../../core/auth/rbac-permissions";

type LinkedUserProfile = {
  status: string;
  accountType: "customer" | "staff" | "both";
  customerProfile?: object | null;
  staffProfile?: {
    status: string;
    roleId: string;
  } | null;
} | null | undefined;

export type LoginRedirectDecision =
  | { kind: "redirect"; destination: "/dashboard" | "/account" | "/auth/account-status" }
  | { kind: "error"; message: string };

const VALID_DASHBOARD_ROLES: DashboardUserRole[] = ["super_admin", "admin", "operator", "viewer"];

export function resolveLoginRedirect(user: LinkedUserProfile): LoginRedirectDecision {
  if (!user) {
    return { kind: "error", message: "Your account is not linked. Contact support." };
  }

  if (user.status !== "active") {
    return {
      kind: "error",
      message: "Your account has been deactivated. Contact an administrator.",
    };
  }

  const isStaffAccount = user.accountType === "staff" || user.accountType === "both";
  const hasActiveStaffProfile = user.staffProfile?.status === "active";

  if (isStaffAccount && hasActiveStaffProfile) {
    return { kind: "redirect", destination: "/dashboard" };
  }

  const isCustomerAccount = user.accountType === "customer" || user.accountType === "both";
  const hasCustomerProfile = user.customerProfile;

  if (isCustomerAccount && hasCustomerProfile) {
    return { kind: "redirect", destination: "/account" };
  }

  return { kind: "redirect", destination: "/auth/account-status" };
}

export function hasValidDashboardRole(roleKey: string | undefined): roleKey is DashboardUserRole {
  return roleKey !== undefined && VALID_DASHBOARD_ROLES.includes(roleKey as DashboardUserRole);
}