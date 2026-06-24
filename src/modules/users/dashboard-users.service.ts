import { AppError } from "../../core/http/errors";
import { API_ERROR_CODES } from "../../lib/constants";
import { headers } from "next/headers";
import { dashboardAuth } from "../../core/auth/better-auth";
import { findDashboardUserByEmail, findDashboardUserById, listDashboardUsers, createDashboardUser, updateDashboardUserRole, toggleDashboardUserActive, searchDashboardUsersPaginated, type UserSearchParams } from "./dashboard-user.repo";
import { createDashboardUserSchema, updateDashboardUserRoleSchema, toggleDashboardUserActiveSchema } from "./dashboard-users.types";
import { createAuditLog } from "../audit/audit.service";
import { listRoles } from "./app-rbac.repo";
import type { DashboardUsersListData, DashboardUserItem } from "./dashboard-users.types";

export async function listDashboardUsersService(): Promise<DashboardUsersListData> {
  try {
    const users = await listDashboardUsers();
    return {
      items: users as DashboardUserItem[],
      status: "ready",
      isEmpty: users.length === 0,
    };
  } catch {
    return {
      items: [],
      status: "error",
      isEmpty: true,
    };
  }
}

export async function createDashboardUserService(input: unknown) {
  const parsed = createDashboardUserSchema.safeParse(input);
  if (!parsed.success) {
    return { isSuccess: false as const, error: new AppError(API_ERROR_CODES.INVALID_INPUT, parsed.error.issues[0]?.message ?? "Invalid input") };
  }

  const { email, temporaryPassword, role, fullName, phone } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await findDashboardUserByEmail(normalizedEmail);
  if (existing) {
    return { isSuccess: false as const, error: new AppError(API_ERROR_CODES.USER_ALREADY_EXISTS, "User already exists") };
  }

  const requestHeaders = new Headers(await headers());
  const authApi = dashboardAuth.api as typeof dashboardAuth.api & {
    signUpEmail: (input: {
      body: { name: string; email: string; password: string };
      headers: Headers;
    }) => Promise<{ user?: { id: string }; error?: { message?: string } }>;
  };
  let authResult: { user?: { id: string } };
  try {
    authResult = await authApi.signUpEmail({
      body: { name: fullName, email: normalizedEmail, password: temporaryPassword },
      headers: requestHeaders,
    });
  } catch {
    return { isSuccess: false as const, error: new AppError(API_ERROR_CODES.USER_ALREADY_EXISTS, "Email already exists in auth") };
  }
  if (!authResult.user?.id) {
    return { isSuccess: false as const, error: new AppError(API_ERROR_CODES.INTERNAL_ERROR, "Auth user creation failed") };
  }

  try {
    const [created] = await createDashboardUser({
      authUserId: authResult.user.id,
      email: normalizedEmail,
      role,
      fullName,
      phone,
    });

    await createAuditLog({
      actorEmail: "system",
      action: "user_created",
      targetType: "dashboard_user",
      targetId: created.id,
      metadata: { email: normalizedEmail, role },
    });

    return { isSuccess: true as const, data: created };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { isSuccess: false as const, error: new AppError(API_ERROR_CODES.INTERNAL_ERROR, `Failed to create user record: ${message}`) };
  }
}

export function listDashboardRolesService() {
  return listRoles();
}

export async function updateDashboardUserRoleService(input: unknown) {
  const parsed = updateDashboardUserRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { isSuccess: false as const, error: new AppError("INVALID_INPUT", parsed.error.issues[0]?.message ?? "Invalid input") };
  }

  const existing = await findDashboardUserById(parsed.data.userId);
  if (!existing) {
    return { isSuccess: false as const, error: new AppError(API_ERROR_CODES.USER_NOT_FOUND, "User not found") };
  }

  const [updated] = await updateDashboardUserRole(parsed.data.userId, parsed.data.role);
  
  await createAuditLog({
    actorEmail: "system",
    action: "user_role_changed",
    targetType: "dashboard_user",
    targetId: parsed.data.userId,
    metadata: { newRole: parsed.data.role },
  });
  
  return { isSuccess: true as const, data: updated };
}

export async function toggleDashboardUserActiveService(input: unknown) {
  const parsed = toggleDashboardUserActiveSchema.safeParse(input);
  if (!parsed.success) {
    return { isSuccess: false as const, error: new AppError(API_ERROR_CODES.INVALID_INPUT, parsed.error.issues[0]?.message ?? "Invalid input") };
  }

  const existing = await findDashboardUserById(parsed.data.userId);
  if (!existing) {
    return { isSuccess: false as const, error: new AppError(API_ERROR_CODES.USER_NOT_FOUND, "User not found") };
  }

  const [updated] = await toggleDashboardUserActive(parsed.data.userId, parsed.data.isActive);
  
  await createAuditLog({
    actorEmail: "system",
    action: parsed.data.isActive ? "user_reactivated" : "user_deactivated",
    targetType: "dashboard_user",
    targetId: parsed.data.userId,
    metadata: { wasActive: existing.isActive, nowActive: parsed.data.isActive },
  });
  
  return { isSuccess: true as const, data: updated };
}

export async function findDashboardUsersPaginated(params: UserSearchParams) {
  return searchDashboardUsersPaginated(params);
}
