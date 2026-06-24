export const REQUIRED_ROLES = ["super_admin", "admin", "manager", "inventory_staff", "cashier", "viewer"] as const;

export const REQUIRED_PERMISSIONS = [
  "staff.manage",
  "users.view",
  "products.view",
  "products.manage",
  "inventory.view",
  "inventory.adjust",
  "orders.view",
  "orders.manage",
  "pos.create_sale",
  "reports.view",
  "settings.manage",
  "audit.view",
] as const;
