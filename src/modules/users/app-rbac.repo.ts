import { and, eq } from "drizzle-orm";
import { db } from "../../core/db/client";
import { permissions, rolePermissions, roles, staffProfiles } from "../../core/db/schema";

export function listRoles() {
  return db.select().from(roles).orderBy(roles.key);
}

export function listPermissionsForRole(roleKey: string) {
  return db
    .select({ permission: permissions })
    .from(rolePermissions)
    .innerJoin(roles, eq(rolePermissions.roleId, roles.id))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(roles.key, roleKey));
}

export async function userHasPermission(userId: string, permissionKey: string) {
  const [match] = await db
    .select({ permissionId: permissions.id })
    .from(staffProfiles)
    .innerJoin(rolePermissions, eq(staffProfiles.roleId, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(and(eq(staffProfiles.userId, userId), eq(permissions.key, permissionKey)));
  return Boolean(match);
}
