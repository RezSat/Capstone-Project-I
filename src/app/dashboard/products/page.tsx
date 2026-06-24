import { requireAnyPermission } from "@/core/auth/dashboard-route-protection";
import { getDashboardProductsListData } from "./products-list-data";
import { ProductsListPanel } from "@/components/products/products-list-panel";
import { normalizeSearchQuery } from "@/core/search/search-query";

export const dynamic = 'force-dynamic';

type DashboardProductsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    search?: string | string[];
    sort?: string | string[];
    categoryId?: string | string[];
    brandId?: string | string[];
    status?: string | string[];
    page?: string;
  }>;
};

export default async function DashboardProductsPage({ searchParams }: DashboardProductsPageProps) {
  await requireAnyPermission("PRODUCTS_VIEW", "PRODUCTS_MANAGE");
  const query = await searchParams;
  const qValue = typeof query.q === "string" ? query.q : Array.isArray(query.q) ? query.q[0] : undefined;
  const legacySearch = typeof query.search === "string" ? query.search : undefined;
  const searchQuery = normalizeSearchQuery(qValue ?? legacySearch);
  const sortParam = typeof query.sort === "string" ? query.sort : Array.isArray(query.sort) ? query.sort[0] : undefined;
  const sort = sortParam === "name" || sortParam === "status" || sortParam === "price" ? sortParam : "newest";
  const categoryId = typeof query.categoryId === "string" ? query.categoryId : Array.isArray(query.categoryId) ? query.categoryId[0] : undefined;
  const brandId = typeof query.brandId === "string" ? query.brandId : Array.isArray(query.brandId) ? query.brandId[0] : undefined;
  const statusParam = typeof query.status === "string" ? query.status : Array.isArray(query.status) ? query.status[0] : undefined;
  const status = statusParam === "draft" || statusParam === "active" || statusParam === "inactive" || statusParam === "archived" ? statusParam : undefined;
  const page = typeof query.page === "string" ? parseInt(query.page, 10) : 1;
  const productsList = await getDashboardProductsListData({
    q: searchQuery,
    categoryId,
    brandId,
    status,
    sort,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: 20,
  });

  return (
    <ProductsListPanel
      key={`${searchQuery ?? ""}-${sort}-${categoryId ?? ""}-${brandId ?? ""}-${status ?? ""}-${page}`}
      initialData={productsList}
    />
  );
}
