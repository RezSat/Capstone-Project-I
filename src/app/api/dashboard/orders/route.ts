import { NextResponse } from "next/server";
import { listOrdersPaginated, getOrderItems } from "@/modules/orders/dashboard-orders.repo";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const pageSize = searchParams.get("pageSize") ? parseInt(searchParams.get("pageSize")!, 10) : 20;

    const result = await listOrdersPaginated({ search, status, page, pageSize });

    const ordersWithItems = await Promise.all(
      result.items.map(async (order) => {
        const items = await getOrderItems(order.id);
        return { ...order, items };
      })
    );

    if (ordersWithItems.length > 0) {
      console.log(`[ADMIN ORDERS API] Fetching Orders - Sample Status: paymentStatus=${ordersWithItems[0].paymentStatus}, status=${ordersWithItems[0].status}, orderNumber=${ordersWithItems[0].orderNumber}`);
    }

    return NextResponse.json({
      success: true,
      data: ordersWithItems,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    console.error("Dashboard orders API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}