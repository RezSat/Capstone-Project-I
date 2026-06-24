import { getAdminInventoryCatalog } from "@/modules/inventory/admin-inventory.service";
import type { AdminInventoryProduct } from "@/modules/inventory/admin-inventory.service";

export type { AdminInventoryProduct };

export async function getAdminInventoryCatalogData(): Promise<AdminInventoryProduct[]> {
  return getAdminInventoryCatalog();
}