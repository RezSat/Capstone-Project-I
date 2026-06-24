import { requireAnyPermission } from "@/core/auth/dashboard-route-protection";
import { getAdminInventoryCatalogData } from "./inventory-catalog-data";
import { AdminInventoryCatalog } from "@/components/inventory/admin-inventory-catalog";

export const dynamic = 'force-dynamic';

export default async function DashboardInventoryPage() {
  await requireAnyPermission("INVENTORY_VIEW", "INVENTORY_ADJUST");
  const catalog = await getAdminInventoryCatalogData();
  return <AdminInventoryCatalog initialCatalog={catalog} />;
}
