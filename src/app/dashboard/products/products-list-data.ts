import { getCurrentPermissions, PERMISSIONS } from "../../../core/auth/get-current-permissions";
import { getDashboardProductList, type DashboardProductStats } from "../../../modules/products/dashboard-product-list.service";

export type DashboardProductsFilters = {
  q?: string;
  categoryId?: string;
  brandId?: string;
  status?: "draft" | "active" | "inactive" | "archived";
  sort?: "newest" | "name" | "status" | "price";
  page: number;
  pageSize: number;
};

export async function getDashboardProductsListData(filters: DashboardProductsFilters) {
  const { hasPermission } = await getCurrentPermissions();
  const data = await getDashboardProductList(filters);
  return {
    ...data,
    canManage: hasPermission(PERMISSIONS.PRODUCTS_MANAGE),
    canView: hasPermission(PERMISSIONS.PRODUCTS_VIEW),
    filters,
    stats: data.stats as DashboardProductStats,
  };
}
