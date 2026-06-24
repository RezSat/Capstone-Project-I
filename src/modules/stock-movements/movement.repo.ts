import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/core/db/client";
import { stockMovements } from "@/core/db/schema";

export type InsertMovementInput = {
  variantId: string;
  locationId: string;
  movementType: string;
  sourceType: string;
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  note?: string;
};

export type MovementSearchParams = {
  search?: string;
  typeFilter?: "all" | "in" | "out" | "adjustment";
  sort?: string;
  page?: number;
  pageSize?: number;
};

export type PaginatedMovements<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type MovementInsertExecutor = Pick<typeof db, "insert">;

export async function insertStockMovementInTransaction(
  tx: MovementInsertExecutor,
  input: InsertMovementInput
) {
  const [movement] = await tx.insert(stockMovements).values({
    variantId: input.variantId,
    locationId: input.locationId,
    movementType: input.movementType as "initial" | "receive" | "adjustment" | "reservation" | "release" | "sale" | "cancellation" | "return" | "refund" | "transfer_in" | "transfer_out" | "damage" | "loss",
    sourceType: input.sourceType as "online_order" | "pos_order" | "manual_adjustment" | "purchase_order" | "stock_count" | "return" | "transfer" | "system",
    quantityChange: input.quantityChange,
    quantityBefore: input.quantityBefore,
    quantityAfter: input.quantityAfter,
    note: input.note ?? null,
  }).returning();
  return movement ?? null;
}

export async function insertStockMovement(input: InsertMovementInput) {
  return insertStockMovementInTransaction(db, input);
}

export function listStockMovements() {
  return db
    .select()
    .from(stockMovements)
    .orderBy(desc(stockMovements.createdAt));
}

export function listStockMovementsByVariant(variantId: string) {
  return db
    .select()
    .from(stockMovements)
    .where(eq(stockMovements.variantId, variantId))
    .orderBy(desc(stockMovements.createdAt));
}

export async function countMovements(): Promise<number> {
  const result = await db.select({ count: sql<number>`count(*)` }).from(stockMovements);
  return result[0]?.count ?? 0;
}

export async function searchMovementsPaginated(params: MovementSearchParams) {
  const { page = 1, pageSize = 20 } = params;
  const total = await countMovements();
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;

  const items = await db
    .select({
      id: stockMovements.id,
      variantId: stockMovements.variantId,
      movementType: stockMovements.movementType,
      quantityChange: stockMovements.quantityChange,
      note: stockMovements.note,
      createdAt: stockMovements.createdAt,
    })
    .from(stockMovements)
    .orderBy(desc(stockMovements.createdAt))
    .limit(pageSize)
    .offset(offset);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}