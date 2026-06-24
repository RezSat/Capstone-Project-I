import { requireAnyPermission } from "@/core/auth/dashboard-route-protection";
import { getDashboardCategoriesListData } from "./categories-list-data";
import { CategoriesListPanel } from "@/components/categories/categories-list-panel";
import { normalizeSearchQuery } from "@/core/search/search-query";

export const dynamic = 'force-dynamic';

type DashboardCategoriesPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
    sort?: string | string[];
    page?: string;
  }>;
};

export default async function DashboardCategoriesPage({ searchParams }: DashboardCategoriesPageProps) {
  await requireAnyPermission("PRODUCTS_VIEW", "PRODUCTS_MANAGE");
  const query = await searchParams;
  const qValue = typeof query.q === "string" ? query.q : Array.isArray(query.q) ? query.q[0] : undefined;
  const searchQuery = normalizeSearchQuery(qValue);
  const sortParam = typeof query.sort === "string" ? query.sort : Array.isArray(query.sort) ? query.sort[0] : undefined;
  const sort = sortParam === "name" || sortParam === "sortOrder" ? sortParam : "newest";
  const statusParam = typeof query.status === "string" ? query.status : Array.isArray(query.status) ? query.status[0] : undefined;
  const status = statusParam === "active" || statusParam === "inactive" || statusParam === "hidden" ? statusParam : undefined;
  const page = typeof query.page === "string" ? parseInt(query.page, 10) : 1;
  const categoriesList = await getDashboardCategoriesListData({
    q: searchQuery,
    status,
    sort,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: 20,
  });

  return (
    <CategoriesListPanel
      key={`${searchQuery ?? ""}-${sort}-${status ?? ""}-${page}`}
      initialData={categoriesList}
    />
  );
}