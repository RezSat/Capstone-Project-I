import { getDashboardAuth } from "../../modules/auth/dashboard-auth.service";
import { getInventoryStockSummary } from "../../modules/inventory/inventory.service";
import { getProducts } from "../../modules/products/product.service";

export type DashboardOverviewSummary = {
  accountIdentifier: string;
  activeProductsCount: number;
  inactiveProductsCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  activeUsersCount: number;
  isEmpty: boolean;
  status: "ready" | "error";
};

export async function getDashboardOverviewSummary(): Promise<DashboardOverviewSummary> {
  try {
    const [auth, activeProducts, inactiveProducts, stockSummary, users] = await Promise.all([
      getDashboardAuth(),
      getProducts("active"),
      getProducts("inactive"),
      getInventoryStockSummary(),
      import("../../modules/users/dashboard-users.service").then((m) => m.listDashboardUsersService()),
    ]);
    const accountIdentifier = auth.email || auth.userId || "dashboard user";
    const userItems = users as { items: Array<{ isActive: boolean }> };
    const activeUsersCount = userItems.items?.filter((u) => u.isActive).length ?? 0;

    return {
      accountIdentifier,
      activeProductsCount: activeProducts.length,
      inactiveProductsCount: inactiveProducts.length,
      lowStockCount: stockSummary.lowStockCount,
      outOfStockCount: stockSummary.outOfStockCount,
      activeUsersCount,
      isEmpty: activeProducts.length === 0,
      status: "ready",
    };
  } catch {
    return {
      accountIdentifier: "dashboard user",
      activeProductsCount: 0,
      inactiveProductsCount: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      activeUsersCount: 0,
      isEmpty: true,
      status: "error",
    };
  }
}
