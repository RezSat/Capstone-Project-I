import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { ok, fail } from "@/core/http/responses";
import { db } from "@/core/db/client";
import { orders } from "@/core/db/schema";
import { releaseInventoryOnCancel } from "@/modules/orders/storefront-order.service";

export async function DELETE(request: Request) {
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