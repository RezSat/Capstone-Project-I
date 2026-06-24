import { and, eq } from "drizzle-orm";
import { db } from "@/core/db/client";
import { inventoryItems, productVariants } from "@/core/db/schema";
import type { UpdateInventoryQuantityInput } from "./inventory.types";

export {
  countInventoryItems,
  searchInventoryPaginated,
  type InventorySearchParams,
  type PaginatedInventory,
} from "./inventory-search.repo";

type InventoryTransaction = Parameters<typeof db.transaction>[0] extends (
  tx: infer T
) => Promise<unknown>
  ? T
  : never;

export function findInventoryByVariantId(variantId: string) {
  return db.query.inventoryItems.findFirst({
    where: eq(inventoryItems.variantId, variantId),
  });
}

export function findInventoryByProductId(productId: string) {
  return db.query.productVariants.findFirst({
    where: eq(productVariants.productId, productId),
  });
}

export function listInventory() {
  return db.select().from(inventoryItems);
}

export function listInventoryStockLevels() {
  return db
    .select({
      inventoryId: inventoryItems.id,
      variantId: inventoryItems.variantId,
      quantityOnHand: inventoryItems.quantityOnHand,
      lowStockThreshold: inventoryItems.lowStockThreshold,
    })
    .from(inventoryItems)
    .innerJoin(productVariants, eq(inventoryItems.variantId, productVariants.id));
}

export function withInventoryTransaction<T>(work: (tx: InventoryTransaction) => Promise<T>) {
  return db.transaction(work);
}

export async function updateInventoryQuantity(
  tx: InventoryTransaction,
  input: UpdateInventoryQuantityInput
) {
  const [lockedRow] = await tx
    .select()
    .from(inventoryItems)
    .where(
      and(
        eq(inventoryItems.id, input.inventoryId),
        eq(inventoryItems.variantId, input.variantId)
      )
    )
    .for("update");

  if (!lockedRow) {
    return null;
  }

  if (lockedRow.quantityOnHand !== input.currentQuantity) {
    return null;
  }

  const [updatedInventory] = await tx
    .update(inventoryItems)
    .set({ quantityOnHand: input.nextQuantity, updatedAt: new Date() })
    .where(
      and(
        eq(inventoryItems.id, input.inventoryId),
        eq(inventoryItems.variantId, input.variantId),
        eq(inventoryItems.quantityOnHand, input.currentQuantity)
      )
    )
    .returning();

  return updatedInventory ?? null;
}

export async function findInventoryByVariantIdInTransaction(
  tx: InventoryTransaction,
  variantId: string
) {
  return tx.query.inventoryItems.findFirst({
    where: eq(inventoryItems.variantId, variantId),
  });
}