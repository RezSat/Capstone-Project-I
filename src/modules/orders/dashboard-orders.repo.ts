import { desc, eq, and, or, like, sql } from "drizzle-orm";
import { db } from "@/core/db/client";
import { orders, orderItems } from "@/core/db/schema";
import type { DashboardOrder, DashboardOrderItem } from "./dashboard-orders.types";
import type { orderStatusEnum } from "@/core/db/schema/enums";

export type OrderSearchParams = {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};

export type PaginatedOrders<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listOrdersPaginated(
  params: OrderSearchParams
): Promise<PaginatedOrders<DashboardOrder>> {
  const { search, status, page = 1, pageSize = 20 } = params;

  const conditions = [];
  if (status && status !== "all") {
    conditions.push(eq(orders.status, status as (typeof orderStatusEnum.enumValues)[number]));
  }
  if (search) {
    conditions.push(
      or(
        like(orders.orderNumber, `%${search}%`),
        like(orders.customerEmailSnapshot, `%${search}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(whereClause);

  const total = Number(countResult[0]?.count ?? 0);
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;

  const rows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      fulfillmentStatus: orders.fulfillmentStatus,
      grandTotalMinor: orders.grandTotalMinor,
      currencyCode: orders.currencyCode,
      customerEmailSnapshot: orders.customerEmailSnapshot,
      customerPhoneSnapshot: orders.customerPhoneSnapshot,
      billingDetailsSnapshot: orders.billingDetailsSnapshot,
      createdAt: orders.createdAt,
      placedAt: orders.placedAt,
    })
    .from(orders)
    .where(whereClause)
    .orderBy(desc(orders.createdAt))
    .limit(pageSize)
    .offset(offset);

  const items: DashboardOrder[] = rows.map((row) => ({
    id: row.id,
    orderNumber: row.orderNumber,
    status: row.status,
    paymentStatus: row.paymentStatus,
    fulfillmentStatus: row.fulfillmentStatus,
    grandTotalMinor: row.grandTotalMinor,
    currencyCode: row.currencyCode,
    customerEmailSnapshot: row.customerEmailSnapshot ?? null,
    customerPhoneSnapshot: row.customerPhoneSnapshot ?? null,
    billingDetailsSnapshot: row.billingDetailsSnapshot ?? null,
    createdAt: row.createdAt,
    placedAt: row.placedAt ?? null,
    items: [],
  }));

  return { items, total, page, pageSize, totalPages };
}

export async function getOrderItems(orderId: string): Promise<DashboardOrderItem[]> {
  const rows = await db
    .select({
      id: orderItems.id,
      productNameSnapshot: orderItems.productNameSnapshot,
      variantTitleSnapshot: orderItems.variantTitleSnapshot,
      skuSnapshot: orderItems.skuSnapshot,
      quantity: orderItems.quantity,
      unitPriceMinor: orderItems.unitPriceMinor,
      lineTotalMinor: orderItems.lineTotalMinor,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  return rows.map((row) => ({
    id: row.id,
    productNameSnapshot: row.productNameSnapshot,
    variantTitleSnapshot: row.variantTitleSnapshot ?? null,
    skuSnapshot: row.skuSnapshot ?? null,
    quantity: row.quantity,
    unitPriceMinor: row.unitPriceMinor,
    lineTotalMinor: row.lineTotalMinor,
  }));
}