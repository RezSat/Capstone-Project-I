import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "../../core/db/client";
import { dashboardAuth } from "./better-auth";
import { permissions, rolePermissions, roles, userAuthIdentities, users } from "../../core/db/schema";
import { PERMISSIONS, ROLE_PERMISSIONS, type Permission } from "./rbac-permissions";
import { hasPermission } from "./rbac-permissions";

export { PERMISSIONS, ROLE_PERMISSIONS, hasPermission };

const cachedRolePermissions: Record<string, Permission[]> = {};

async function loadRolePermissions(roleKey: string): Promise<Permission[]> {
  if (cachedRolePermissions[roleKey]) {
    return cachedRolePermissions[roleKey];
  }
  const rolePerms = await db
    .select({ permission: permissions })
    .from(rolePermissions)
    .innerJoin(roles, eq(rolePermissions.roleId, roles.id))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(roles.key, roleKey));
  const perms = rolePerms.map(p => p.permission.key as Permission);
  cachedRolePermissions[roleKey] = perms;
  return perms;
}

async function findLinkedAppUser(authUserId: string) {
  const identity = await db.query.userAuthIdentities.findFirst({
    where: eq(userAuthIdentities.providerUserId, authUserId),
  });
  if (!identity) return null;
  return db.query.users.findFirst({
    where: eq(users.id, identity.userId),
    with: { staffProfile: true },
  });
}

export async function getCurrentPermissions(): Promise<{
  auth: { userId: string | null; role: string | null; isAuthenticated: boolean; isActive: boolean };
  hasPermission: (permission: Permission) => boolean;
}> {
  const requestHeaders = new Headers(await headers());
  const session = await dashboardAuth.api.getSession({ headers: requestHeaders });

  if (!session) {
    return {
      auth: { userId: null, role: null, isAuthenticated: false, isActive: false },
      hasPermission: () => false,
    };
  }

  const appUser = await findLinkedAppUser(session.user.id);
  if (!appUser) {
    return {
      auth: { userId: null, role: null, isAuthenticated: false, isActive: false },
      hasPermission: () => false,
    };
  }

  const staffProfile = appUser.staffProfile;
  if (!staffProfile) {
    return {
      auth: { userId: appUser.id, role: null, isAuthenticated: true, isActive: false },
      hasPermission: () => false,
    };
  }

  const role = await db.query.roles.findFirst({ where: eq(roles.id, staffProfile.roleId) });
  const roleKey = role?.key ?? "viewer";
  const dbPerms = await loadRolePermissions(roleKey);

  return {
    auth: {
      userId: appUser.id,
      role: roleKey,
      isAuthenticated: true,
      isActive: appUser.status === "active" && staffProfile.status === "active",
    },
    hasPermission: (permission: Permission): boolean => {
      return dbPerms.includes(permission);
    },
  };
}
