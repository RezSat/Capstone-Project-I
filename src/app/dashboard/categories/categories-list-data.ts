import { getCurrentPermissions, PERMISSIONS } from "../../../core/auth/get-current-permissions";
import { listDashboardCategories } from "../../../modules/products/dashboard-category-list.repo";

type CategoryListQuery = {
  q?: string;
  status?: "active" | "inactive" | "hidden";
  sort?: "newest" | "name" | "sortOrder";
  page: number;
  pageSize: number;
};

export type DashboardCategoryFilters = {
  q?: string;
  status?: "active" | "inactive" | "hidden";
  sort?: "newest" | "name" | "sortOrder";
  page: number;
  pageSize: number;
};

export async function getDashboardCategoriesListData(filters: DashboardCategoryFilters) {
  const { hasPermission } = await getCurrentPermissions();
  const { rows, total } = await listDashboardCategories(filters as CategoryListQuery);
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  return {
    items: rows,
    pagination: { page: filters.page, pageSize: filters.pageSize, total, totalPages },
    canManage: hasPermission(PERMISSIONS.PRODUCTS_MANAGE),
    filters: { q: filters.q, status: filters.status, sort: filters.sort },
  };
}