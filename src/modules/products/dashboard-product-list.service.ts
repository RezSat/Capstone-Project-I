import { db } from "@/core/db/client";
import { products } from "@/core/db/schema";
import { count, avg, eq } from "drizzle-orm";
import { listAdminBrands, listAdminCategories } from "./admin-catalog.repo";
import { listDashboardProducts, type ProductListQuery } from "./dashboard-product-list.repo";
import { getProductImageSummaryForList } from "../product-files/product-file.repo";

export type DashboardListItem = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  brand: string | null;
  status: string;
  basePriceMinor: number;
  variantCount: number;
  totalStock: number;
  createdAt: Date;
  updatedAt: Date;
  thumbnailUrl: string | null;
};

export type DashboardProductStats = {
  totalProducts: number;
  activeProducts: number;
  averagePrice: number;
};

async function getProductStats(): Promise<DashboardProductStats> {
  const [totalResult, activeResult, avgResult] = await Promise.all([
    db.select({ count: count() }).from(products),
    db.select({ count: count() }).from(products).where(eq(products.status, "active")),
    db.select({ avg: avg(products.basePriceMinor) }).from(products).where(eq(products.status, "active")),
  ]);
  const avgValue = avgResult[0]?.avg;
  const numericAvg = typeof avgValue === "number" ? avgValue : parseFloat(avgValue ?? "0") || 0;
  return {
    totalProducts: totalResult[0]?.count ?? 0,
    activeProducts: activeResult[0]?.count ?? 0,
    averagePrice: Math.round(numericAvg),
  };
}

export async function getDashboardProductList(query: ProductListQuery) {
  const [[{ rows, total }, categories, brands], stats] = await Promise.all([
    Promise.all([listDashboardProducts(query), listAdminCategories(), listAdminBrands()]),
    getProductStats(),
  ]);
  const items: DashboardListItem[] = await Promise.all(
    rows.map(async (row) => {
      const image = await getProductImageSummaryForList(row.id).catch(() => null);
      return { ...row, thumbnailUrl: image?.publicUrl ?? null };
    })
  );
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  return {
    items,
    categories: categories.map((c) => ({ id: c.id, name: c.name })),
    brands: brands.map((b) => ({ id: b.id, name: b.name })),
    pagination: { page: query.page, pageSize: query.pageSize, total, totalPages },
    stats,
  };
}
