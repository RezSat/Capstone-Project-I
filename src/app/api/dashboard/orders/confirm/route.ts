import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { ok, fail } from "@/core/http/responses";
import { db } from "@/core/db/client";
import { orders, orderItems, inventoryItems } from "@/core/db/schema";

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return Response.json(fail("VALIDATION_ERROR", "orderId is required"), { status: 400 });
    }

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) {
      return Response.json(fail("NOT_FOUND", "Order not found"), { status: 404 });
    }

    if (order.status !== "staged") {
      return Response.json(fail("INVALID_STATUS", `Order cannot be confirmed in status: ${order.status}`), { status: 409 });
    }

    const items = await db.query.orderItems.findMany({
      where: eq(orderItems.orderId, orderId),
    });

    if (items.length === 0) {
      console.log(`[CONFIRM] No items found for order ${orderId}`);
      return Response.json(fail("NO_ITEMS", "Order has no items to commit"), { status: 409 });
    }

    console.log(`[CONFIRM] Found ${items.length} items for order ${orderId}:`, items);

    await db.transaction(async (tx) => {
      for (const item of items) {
        if (!item.variantId) {
          console.log(`[CONFIRM] Skipping item ${item.id} - no variantId`);
          continue;
        }

        const [inv] = await tx
          .select()
          .from(inventoryItems)
          .where(eq(inventoryItems.variantId, item.variantId))
          .for("update");

        if (inv) {
          const newOnHand = Math.max(0, inv.quantityOnHand - item.quantity);
          const newReserved = Math.max(0, inv.quantityReserved - item.quantity);
          console.log(`[CONFIRM] Updating inventory ${inv.id}: onHand ${inv.quantityOnHand} -> ${newOnHand}, reserved ${inv.quantityReserved} -> ${newReserved}`);
          await tx
            .update(inventoryItems)
            .set({ quantityOnHand: newOnHand, quantityReserved: newReserved, updatedAt: new Date() })
            .where(eq(inventoryItems.id, inv.id));
        } else {
          console.log(`[CONFIRM] No inventory found for variant ${item.variantId}`);
        }
      }

      await tx
        .update(orders)
        .set({ status: "confirmed", completedAt: new Date(), updatedAt: new Date() })
        .where(eq(orders.id, orderId));
    });

    return NextResponse.json(ok({ success: true, status: "confirmed" }));
  } catch (error) {
    console.error("Admin order confirm error:", error);
    return Response.json(fail("INTERNAL_ERROR", "Failed to confirm order"), { status: 500 });
  }
}