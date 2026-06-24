import { listOrdersPaginated, getOrderItems, type OrderSearchParams } from "./dashboard-orders.repo";
import type { DashboardOrder, DashboardOrderItem, DashboardOrdersListData } from "./dashboard-orders.types";

export type { DashboardOrder, DashboardOrderItem, DashboardOrdersListData };

export async function findOrdersPaginated(params: OrderSearchParams) {
  return listOrdersPaginated(params);
}

export async function loadOrderItems(orderId: string): Promise<DashboardOrderItem[]> {
  return getOrderItems(orderId);
}

export async function getDashboardOrdersListData(
  search?: string,
  status?: string,
  page: number = 1,
  pageSize: number = 20
): Promise<DashboardOrdersListData> {
  try {
    const result = await findOrdersPaginated({ search, status, page, pageSize });

    const ordersWithItems = await Promise.all(
      result.items.map(async (order) => {
        const items = await loadOrderItems(order.id);
        return { ...order, items };
      })
    );

    return {
      items: ordersWithItems,
      status: "ready",
      isEmpty: ordersWithItems.length === 0,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  } catch {
    return {
      items: [],
      status: "error",
      isEmpty: true,
      pagination: { page: 1, pageSize, total: 0, totalPages: 0 },
    };
  }
}