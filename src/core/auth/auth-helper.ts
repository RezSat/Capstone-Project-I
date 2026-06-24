import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { dashboardAuth } from "./better-auth";
import { db } from "../db/client";
import { permissions, rolePermissions, roles, userAuthIdentities, users } from "../db/schema";
import { API_ERROR_CODES } from "../../lib/constants";
import { AuthError, toUnauthorizedResponse } from "./auth-errors";
import { PERMISSIONS, type DashboardUserRole, type Permission } from "./rbac-permissions";

type BetterAuthSession = typeof dashboardAuth.$Infer.Session;

export async function findLinkedAppUserDirect(authUserId: string) {
  const identity = await db.query.userAuthIdentities.findFirst({
    where: eq(userAuthIdentities.providerUserId, authUserId),
  });

  if (!identity) {
    return autoLinkAuthUserDirect(authUserId);
  }

  return db.query.users.findFirst({
    where: eq(users.id, identity.userId),
    with: {
      customerProfile: true,
      staffProfile: true,
    },
  });
}

async function autoLinkAuthUserDirect(authUserId: string) {
  const identity = await db.query.userAuthIdentities.findFirst({
    where: eq(userAuthIdentities.providerUserId, authUserId),
  });
  if (identity) return null;

  const userByAuthId = await db.query.users.findFirst({
    where: eq(users.id, authUserId),
    with: { customerProfile: true, staffProfile: true },
  });
  if (userByAuthId) {
    await db.insert(userAuthIdentities).values({
      userId: userByAuthId.id,
      provider: "credentials",
      providerUserId: authUserId,
    }).onConflictDoNothing();
    return userByAuthId;
  }

  const authUser = await db.execute<{ email: string }>(sql`SELECT email FROM auth_user WHERE id = ${authUserId}`);
  const email = authUser[0]?.email?.toLowerCase();
  if (!email) return null;

  const appUser = await db.query.users.findFirst({
    where: eq(users.normalizedEmail, email),
    with: { customerProfile: true, staffProfile: true },
  });

  if (!appUser) return null;

  await db.insert(userAuthIdentities).values({
    userId: appUser.id,
    provider: "credentials",
    providerUserId: authUserId,
  }).onConflictDoNothing();

  return appUser;
}

function ensureActiveUser(status: string) {
  if (status !== "active") {
    throw new AuthError(API_ERROR_CODES.FORBIDDEN, "User account is not active");
  }
}

export async function getCurrentSession(): Promise<BetterAuthSession | null> {
  const requestHeaders = new Headers(await headers());
  const session = await dashboardAuth.api.getSession({ headers: requestHeaders });
  return session;
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  if (!session) {
    return null;
  }

  return findLinkedAppUserDirect(session.user.id);
}

export async function requireAuth(options?: { returnResponse?: false }): Promise<{
  session: BetterAuthSession;
  appUser: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
}>;
export async function requireAuth(options: { returnResponse: true }): Promise<{
  session: BetterAuthSession;
  appUser: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
} | Response>;
export async function requireAuth(options?: { returnResponse?: boolean }) {
  const session = await getCurrentSession();
  if (!session) {
    if (options?.returnResponse) {
      return toUnauthorizedResponse();
    }
    throw new AuthError(API_ERROR_CODES.UNAUTHORIZED, "Authentication required");
  }

  const appUser = await findLinkedAppUserDirect(session.user.id);
  if (!appUser) {
    if (options?.returnResponse) {
      return toUnauthorizedResponse("App user not linked to authenticated account");
    }
    throw new AuthError(API_ERROR_CODES.UNAUTHORIZED, "App user not linked to authenticated account");
  }

  return { session, appUser };
}

export async function requireCustomer() {
  const auth = await requireAuth();
  ensureActiveUser(auth.appUser.status);

  if (auth.appUser.accountType !== "customer" && auth.appUser.accountType !== "both") {
    throw new AuthError(API_ERROR_CODES.FORBIDDEN, "Customer account required");
  }

  if (!auth.appUser.customerProfile) {
    throw new AuthError(API_ERROR_CODES.FORBIDDEN, "Customer profile is missing");
  }

  return auth;
}

export async function requireStaff() {
  const auth = await requireAuth();
  ensureActiveUser(auth.appUser.status);

  if (auth.appUser.accountType !== "staff" && auth.appUser.accountType !== "both") {
    throw new AuthError(API_ERROR_CODES.FORBIDDEN, "Staff account required");
  }

  if (!auth.appUser.staffProfile || auth.appUser.staffProfile.status !== "active") {
    throw new AuthError(API_ERROR_CODES.FORBIDDEN, "Active staff profile required");
  }

  return auth;
}

export async function requireRole(allowedRoles: DashboardUserRole[]) {
  const auth = await requireStaff();
  const role = auth.appUser.staffProfile;
  if (!role) {
    throw new AuthError(API_ERROR_CODES.FORBIDDEN, "Staff profile not found");
  }
  const staffRole = await db.query.roles.findFirst({ where: eq(roles.id, role.roleId) });
  if (!staffRole || !allowedRoles.includes(staffRole.key as DashboardUserRole)) {
    throw new AuthError(API_ERROR_CODES.FORBIDDEN, "Role not authorized");
  }
  return auth;
}

export async function getCurrentStaffProfile() {
  const session = await getCurrentSession();
  if (!session) return null;
  const appUser = await findLinkedAppUserDirect(session.user.id);
  if (!appUser?.staffProfile) return null;
  
  const role = await db.query.roles.findFirst({ where: eq(roles.id, appUser.staffProfile.roleId) });
  return { ...appUser.staffProfile, role };
}

export async function getCurrentStaffPermissions(): Promise<Permission[]> {
  const session = await getCurrentSession();
  if (!session) return [];
  
  const appUser = await findLinkedAppUserDirect(session.user.id);
  if (!appUser?.staffProfile) return [];
  
  const role = await db.query.roles.findFirst({ where: eq(roles.id, appUser.staffProfile.roleId) });
  if (!role) return PERMISSIONS.PRODUCTS_READ ? [PERMISSIONS.PRODUCTS_READ] : [];
  
  const rolePerms = await db
    .select({ permission: permissions })
    .from(rolePermissions)
    .innerJoin(roles, eq(rolePermissions.roleId, roles.id))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(roles.key, role.key));
  
  return rolePerms.map(p => p.permission.key as Permission);
}

export async function userHasPermission(permission: Permission): Promise<boolean> {
  const perms = await getCurrentStaffPermissions();
  return perms.includes(permission);
}

export async function requirePermission(permission: Permission) {
  const auth = await requireStaff();
  const hasPerm = await userHasPermission(permission);
  if (!hasPerm) {
    throw new AuthError(API_ERROR_CODES.FORBIDDEN, `Permission required: ${permission}`);
  }
  return auth;
}
