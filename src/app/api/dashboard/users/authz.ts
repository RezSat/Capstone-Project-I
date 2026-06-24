import { fail } from "../../../../core/http/responses";
import { getCurrentPermissions } from "../../../../core/auth/get-current-permissions";
import { userHasPermission } from "../../../../modules/users/app-rbac.repo";

export async function requireStaffManageAccess() {
  const current = await getCurrentPermissions();
  if (!current.auth.isAuthenticated || !current.auth.userId || !current.auth.isActive) {
    return { denied: Response.json(fail("UNAUTHORIZED", "Dashboard authentication is required"), { status: 401 }) };
  }
  if (current.auth.role === "super_admin") {
    return { denied: null, actorUserId: current.auth.userId };
  }
  const [canManageStaff, canManageUsers] = await Promise.all([
    userHasPermission(current.auth.userId, "staff.manage"),
    userHasPermission(current.auth.userId, "users.manage"),
  ]);
  if (!canManageStaff && !canManageUsers) {
    return { denied: Response.json(fail("FORBIDDEN", "Staff management access required"), { status: 403 }) };
  }
  return { denied: null, actorUserId: current.auth.userId };
}
