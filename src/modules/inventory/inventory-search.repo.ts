import { asc, eq, sql } from "drizzle-orm";
import { db } from "../../core/db/client";
import { inventoryItems, productVariants } from "../../core/db/schema";

export type InventorySearchParams = {
  search?: string;
  stockFilter?: "all" | "in-stock" | "low-stock" | "out-of-stock";
  sort?: string;
  page?: number;
  pageSize?: number;
};

export type PaginatedInventory<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function countInventoryItems(): Promise<number> {
  const baseQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(inventoryItems)
    .innerJoin(productVariants, eq(inventoryItems.variantId, productVariants.id));

  const result = await baseQuery;
  return result[0]?.count ?? 0;
}

export async function searchInventoryPaginated(params: InventorySearchParams) {
  const { page = 1, pageSize = 20 } = params;
  const total = await countInventoryItems();
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;

  const baseQuery = db
    .select({
      inventoryId: inventoryItems.id,
      variantId: inventoryItems.variantId,
      sku: productVariants.sku,
      quantityOnHand: inventoryItems.quantityOnHand,
      lowStockThreshold: inventoryItems.lowStockThreshold,
      priceMinor: productVariants.priceMinor,
      compareAtPriceMinor: productVariants.compareAtPriceMinor,
    })
    .from(inventoryItems)
    .innerJoin(productVariants, eq(inventoryItems.variantId, productVariants.id));

  const finalQuery = baseQuery.orderBy(asc(productVariants.sku));

  const items = await finalQuery.limit(pageSize).offset(offset);
  const enrichedItems = items.map((item) => ({
    ...item,
    status:
      item.quantityOnHand === 0
        ? "out-of-stock"
        : item.quantityOnHand <= item.lowStockThreshold
          ? "low-stock"
          : "in-stock",
  }));

  return {
    items: enrichedItems,
    total,
    page,
    pageSize,
    totalPages,
  };
}