import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "../../core/db/client";
import { brands, categories, inventoryItems, productVariants, products } from "../../core/db/schema";

export type ProductListQuery = {
  q?: string;
  categoryId?: string;
  brandId?: string;
  status?: "draft" | "active" | "inactive" | "archived";
  sort?: "newest" | "name" | "status" | "price";
  page: number;
  pageSize: number;
};

export async function listDashboardProducts(query: ProductListQuery) {
  const filters = [];
  if (query.categoryId) filters.push(eq(products.primaryCategoryId, query.categoryId));
  if (query.brandId) filters.push(eq(products.brandId, query.brandId));
  if (query.status) filters.push(eq(products.status, query.status));
  if (query.q) {
    const bySku = db.select({ id: productVariants.productId }).from(productVariants).where(ilike(productVariants.sku, `%${query.q}%`));
    filters.push(or(ilike(products.name, `%${query.q}%`), ilike(products.slug, `%${query.q}%`), inArray(products.id, bySku))!);
  }
  const where = filters.length ? and(...filters) : undefined;
  const orderBy = query.sort === "name" ? asc(products.name) : query.sort === "status" ? asc(products.status) : query.sort === "price" ? desc(products.basePriceMinor) : desc(products.createdAt);
  const offset = (query.page - 1) * query.pageSize;
  const totalRows = await db.select({ count: sql<number>`count(*)` }).from(products).where(where);
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      category: categories.name,
      brand: brands.name,
      status: products.status,
      basePriceMinor: products.basePriceMinor,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      variantCount: sql<number>`count(distinct ${productVariants.id})`,
      totalStock: sql<number>`coalesce(sum(${inventoryItems.quantityOnHand}), 0)`,
    })
    .from(products)
    .leftJoin(categories, eq(products.primaryCategoryId, categories.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(productVariants, eq(productVariants.productId, products.id))
    .leftJoin(inventoryItems, eq(inventoryItems.variantId, productVariants.id))
    .where(where)
    .groupBy(products.id, categories.name, brands.name)
    .orderBy(orderBy)
    .limit(query.pageSize)
    .offset(offset);
  return { rows, total: totalRows[0]?.count ?? 0 };
}
