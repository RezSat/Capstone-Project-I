import { getCurrentPermissions, PERMISSIONS } from "../../../core/auth/get-current-permissions";
import { fail } from "../../../core/http/responses";

export async function requireAdminProductsView() {
  const current = await getCurrentPermissions();
  if (!current.auth.isAuthenticated || !current.auth.userId || !current.auth.isActive) {
    return { denied: Response.json(fail("UNAUTHORIZED", "Dashboard authentication is required"), { status: 401 }) };
  }
  if (current.auth.role === "super_admin" || current.hasPermission(PERMISSIONS.PRODUCTS_VIEW)) {
    return { denied: null, actorUserId: current.auth.userId };
  }
  return { denied: Response.json(fail("FORBIDDEN", "products.view permission required"), { status: 403 }) };
}

export async function requireAdminProductsManage() {
  const current = await getCurrentPermissions();
  if (!current.auth.isAuthenticated || !current.auth.userId || !current.auth.isActive) {
    return { denied: Response.json(fail("UNAUTHORIZED", "Dashboard authentication is required"), { status: 401 }) };
  }
  if (current.auth.role === "super_admin" || current.hasPermission(PERMISSIONS.PRODUCTS_MANAGE)) {
    return { denied: null, actorUserId: current.auth.userId };
  }
  return { denied: Response.json(fail("FORBIDDEN", "products.manage permission required"), { status: 403 }) };
}

export async function requireAdminInventoryView() {
  const current = await getCurrentPermissions();
  if (!current.auth.isAuthenticated || !current.auth.userId || !current.auth.isActive) {
    return { denied: Response.json(fail("UNAUTHORIZED", "Dashboard authentication is required"), { status: 401 }) };
  }
  if (current.auth.role === "super_admin" || current.hasPermission(PERMISSIONS.INVENTORY_VIEW) || current.hasPermission(PERMISSIONS.INVENTORY_READ)) {
    return { denied: null, actorUserId: current.auth.userId };
  }
  return { denied: Response.json(fail("FORBIDDEN", "inventory.view permission required"), { status: 403 }) };
}

export async function requireAdminInventoryAdjust() {
  const current = await getCurrentPermissions();
  if (!current.auth.isAuthenticated || !current.auth.userId || !current.auth.isActive) {
    return { denied: Response.json(fail("UNAUTHORIZED", "Dashboard authentication is required"), { status: 401 }) };
  }
  if (current.auth.role === "super_admin" || current.hasPermission(PERMISSIONS.INVENTORY_ADJUST)) {
    return { denied: null, actorUserId: current.auth.userId };
  }
  return { denied: Response.json(fail("FORBIDDEN", "inventory.adjust permission required"), { status: 403 }) };
}
