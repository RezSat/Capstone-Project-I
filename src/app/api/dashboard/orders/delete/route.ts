import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { ok, fail } from "@/core/http/responses";
import { db } from "@/core/db/client";
import { orders } from "@/core/db/schema";
import { releaseInventoryOnCancel } from "@/modules/orders/storefront-order.service";
import { getDashboardAuth } from "@/modules/auth/dashboard-auth.service";
import { hasPermission, PERMISSIONS } from "@/core/auth/rbac-permissions";

export async function DELETE(request: Request) {
  const auth = await getDashboardAuth();
  if (!auth.isAuthenticated || !auth.isActive) {
    return Response.json(fail("UNAUTHORIZED", "Dashboard authentication is required"), { status: 401 });
  }
  if (!hasPermission(auth.role, PERMISSIONS.ORDERS_MANAGE)) {
    return Response.json(fail("FORBIDDEN", "orders.manage permission required"), { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json(fail("VALIDATION_ERROR", "Order id is required"), { status: 400 });
    }

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
    });

    if (!order) {
      return Response.json(fail("NOT_FOUND", "Order not found"), { status: 404 });
    }

    const releaseResult = await releaseInventoryOnCancel(id);
    if (!releaseResult.success) {
      console.error("[ORDER CANCEL] Failed to release inventory:", releaseResult.error);
    }

    await db
      .update(orders)
      .set({ status: "cancelled", cancelledAt: new Date(), updatedAt: new Date() })
      .where(eq(orders.id, id));

    return NextResponse.json(ok({ success: true, status: "cancelled" }));
  } catch (error) {
    console.error("Admin order void error:", error);
    return Response.json(fail("INTERNAL_ERROR", "Failed to void order"), { status: 500 });
  }
}
